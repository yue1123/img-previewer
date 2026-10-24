import {
	isElementInViewport,
	getFitScale,
	clamp,
	debounce,
	preventDefault,
	nextTick,
	setStyle,
	setProperties,
	onceEnd
} from './utils'
import { getLocale } from './i18n/index'
import { renderTemplate } from './template'
import { resolveOptions } from './defaultOptions'
import type { ImgPreviewerOptions, ImgPreviewerHookContext, ResolvedOptions } from './types'

export type {
	ImgPreviewerOptions,
	ImgPreviewerOptionsZoom,
	ImgPreviewerOptionsStyle,
	ImgPreviewerHookContext,
	ImgPreviewerChangeContext,
	Ii18n
} from './types'

class ImgPreviewer {
	static version: string = typeof __VERSION__ === 'string' ? __VERSION__ : ''
	version: string = ImgPreviewer.version

	private options!: ResolvedOptions
	private rootEl!: HTMLElement
	private container!: HTMLElement
	private wrapper!: HTMLElement
	private currentItem!: HTMLElement
	private currentImg!: HTMLImageElement
	private currentIndexEl!: HTMLElement
	private totalIndexEl!: HTMLElement
	private prevButton!: HTMLButtonElement
	private nextButton!: HTMLButtonElement

	private imgList: HTMLImageElement[] = []
	private index = 0
	private currentClickEl: HTMLImageElement | null = null
	// original image hidden by `hideOriginal`, and its inline visibility to restore
	private hiddenEl: HTMLImageElement | null = null
	private hiddenElVisibility = ''
	// image rect when preview opened
	private width = 0
	private height = 0
	private startX = 0
	private startY = 0
	private scale = 1
	// fitted scale, the base of max zoom
	private baseScale = 1
	private rotate = 0

	private isOpen = false
	// increased on every open, so a stale open animation won't fire onShown
	private openId = 0
	private isAnimating = false
	// image can be dragged only after zoomed
	private movable = false
	private disposers: Array<() => void> = []
	// ends the current mouse drag, if any
	private stopDrag: (() => void) | null = null

	constructor(selector: string, options?: ImgPreviewerOptions) {
		// SSR safe
		if (typeof window !== 'object') return
		if (!selector || typeof selector !== 'string') {
			console.error(new Error('ImgPreviewer plugin should css string selector that on first params,like #el,.el'))
			return
		}
		const rootEl = document.querySelector<HTMLElement>(selector)
		if (!rootEl) {
			console.error(new Error('selector ' + selector + ' is invalid'))
			return
		}
		this.rootEl = rootEl
		this.options = resolveOptions(options)
		this.render()
		this.bindEvents()
		this.update()
	}

	/** re-collect image elements under the root element */
	update(): void {
		if (!this.rootEl) return
		const imgEls = this.rootEl.querySelectorAll<HTMLImageElement>('img')
		// when root is `body`, skip the previewer's own images
		this.imgList = Array.prototype.filter.call(
			imgEls,
			(el: HTMLImageElement) => !this.container.contains(el)
		) as HTMLImageElement[]
		this.totalIndexEl.textContent = String(this.imgList.length)
		this.setIndex(clamp(this.index, 0, Math.max(this.imgList.length - 1, 0)))
	}

	/** index of the last image */
	getTotalIndex(): number {
		return this.imgList.length - 1
	}

	/** show the image at index */
	show(index: number): void {
		const img = this.imgList[index]
		if (!img) {
			throw new Error('invalid index')
		}
		if (this.isOpen) {
			if (index !== this.index) this.slideTo(index)
		} else {
			this.open(img)
		}
	}

	next(): void {
		if (!this.isOpen) return this.show(0)
		if (this.index < this.imgList.length - 1) this.slideTo(this.index + 1)
	}

	prev(): void {
		if (!this.isOpen) return this.show(this.imgList.length - 1)
		if (this.index > 0) this.slideTo(this.index - 1)
	}

	/** close the previewer */
	hide(): void {
		if (!this.isOpen) return
		const { onBeforeHide, onHide, onClose, onHidden } = this.options
		const context = this.context()
		if (onBeforeHide?.(context) === false) return
		this.isOpen = false
		this.movable = false
		this.stopDrag?.()
		const { container, currentImg } = this
		const finish = () => {
			// reopened before the animation finished
			if (this.isOpen) return
			this.restoreOriginal()
			container.style.display = 'none'
			currentImg.removeAttribute('src')
			currentImg.style.cssText = ''
			currentImg.classList.remove('img-pre__animated')
			onHidden?.(context)
		}
		container.classList.remove('show')
		container.classList.add('hide')
		// the visibility check must see the original image as it really is
		const hiddenEl = this.hiddenEl
		this.restoreOriginal()
		if (isElementInViewport(this.currentClickEl, this.options.bubblingLevel)) {
			// keep it hidden until the preview image lands on it
			this.hideOriginal(hiddenEl)
			// fly back to the original position
			const { top, left, width, height } = this.currentClickEl!.getBoundingClientRect()
			currentImg.style.cssText = `width:${width}px;height:${height}px;position:fixed;top:${top}px;left:${left}px;`
			onceEnd(currentImg, 'transitionend', finish)
		} else {
			// fade out
			currentImg.classList.add('img-pre__animated')
			onceEnd(currentImg, 'animationend', finish)
		}
		onHide?.(context)
		onClose?.(context)
	}

	/** remove all listeners and DOM created by this instance */
	destroy(): void {
		this.stopDrag?.()
		this.isOpen = false
		this.restoreOriginal()
		this.disposers.forEach((dispose) => dispose())
		this.disposers = []
		this.container && this.container.remove()
		this.imgList = []
	}

	private render(): void {
		const { modalOpacity, headerOpacity, zIndex } = this.options.style
		const container = document.createElement('div')
		container.classList.add('img-pre__container', 'img-pre__animated')
		setProperties(container, {
			'--container-opacity': String(modalOpacity),
			'--header-bg-opacity': String(headerOpacity),
			'--container-zIndex': String(zIndex)
		})
		container.innerHTML = renderTemplate(getLocale(this.options.i18n))
		document.body.appendChild(container)

		const $ = <T extends Element>(selector: string) => container.querySelector(selector) as T
		this.container = container
		this.wrapper = $('.img-pre__content-wrapper')
		this.currentItem = $('.img-pre__img-item')
		this.currentImg = $('.img-pre__img-item img')
		this.currentIndexEl = $('.img-pre__current-index')
		this.totalIndexEl = $('.img-pre__total-index')
		this.prevButton = $('.img-pre__prev')
		this.nextButton = $('.img-pre__next')
	}

	// add listener and remember how to remove it
	private on<K extends keyof HTMLElementEventMap>(
		target: HTMLElement | Document | Window,
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void,
		options?: AddEventListenerOptions
	): void {
		target.addEventListener(type, listener as EventListener, options)
		this.disposers.push(() => target.removeEventListener(type, listener as EventListener, options))
	}

	private bindEvents(): void {
		const { wrapper } = this

		// proxy img click event of root element
		this.on(this.rootEl, this.options.triggerEvent, (event) => {
			const target = event.target as HTMLElement
			if (target.localName !== 'img' || this.container.contains(target)) return
			let index = this.imgList.indexOf(target as HTMLImageElement)
			if (index === -1) {
				// image added without calling update()
				this.update()
				index = this.imgList.indexOf(target as HTMLImageElement)
			}
			index !== -1 && this.show(index)
		})

		// all buttons event proxy listener
		this.on(this.container, 'click', (event) => {
			const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
			if (button && !button.disabled) {
				this.handleAction(button.dataset.action as string)
			}
		})

		// hot keys
		this.on(document, 'keyup', (event) => {
			if (this.isOpen) this.handleAction(event.key)
		})

		// no native image dragging while previewing
		this.on(document, 'dragstart', (event) => {
			if (this.isOpen) preventDefault(event)
		})

		// click backdrop to close
		this.on(wrapper, 'click', (event) => {
			if (event.target === this.currentItem) this.hide()
		})

		// mouse wheel to zoom in and zoom out image
		this.on(
			wrapper,
			'wheel',
			(event) => {
				preventDefault(event)
				if (event.target !== this.currentImg) return
				const { step } = this.options.imageZoom
				this.zoomTo(this.scale + (event.deltaY < 0 ? step : -step))
			},
			{ passive: false }
		)

		this.bindDrag()
		this.bindTouch()

		this.on(
			window,
			'resize',
			debounce(() => {
				this.isOpen && this.layout(false)
			}, 100)
		)
	}

	// drag the zoomed image with mouse
	private bindDrag(): void {
		this.on(this.wrapper, 'mousedown', (event) => {
			const img = this.currentImg
			if (event.target !== img || !this.movable) return
			event.preventDefault()
			const diffX = event.clientX - img.offsetLeft
			const diffY = event.clientY - img.offsetTop
			img.classList.add('moving')
			const onMove = (e: MouseEvent) => {
				setStyle(img, {
					top: `${e.clientY - diffY}px`,
					left: `${e.clientX - diffX}px`
				})
			}
			// also called by hide() and destroy() to end a drag in progress
			const stopDrag = () => {
				img.classList.remove('moving')
				window.removeEventListener('mousemove', onMove)
				window.removeEventListener('mouseup', stopDrag)
				this.stopDrag = null
			}
			this.stopDrag?.()
			this.stopDrag = stopDrag
			window.addEventListener('mousemove', onMove)
			window.addEventListener('mouseup', stopDrag)
		})
	}

	// two finger pinch to zoom
	private bindTouch(): void {
		let pinching = false
		let startDistance = 0
		let startScale = 1
		let lastTouchEnd = 0
		const distance = (touches: TouchList) =>
			Math.hypot(touches[1].pageX - touches[0].pageX, touches[1].pageY - touches[0].pageY)
		const stop = () => {
			pinching = false
			this.currentImg.classList.remove('moving')
		}

		this.on(
			this.wrapper,
			'touchstart',
			(event) => {
				if (event.target !== this.currentImg) return
				event.preventDefault()
				pinching = true
				startDistance = event.touches.length > 1 ? distance(event.touches) : 0
				startScale = this.scale
			},
			{ passive: false }
		)
		this.on(
			this.container,
			'touchmove',
			(event) => {
				if (!pinching) return
				event.preventDefault()
				if (event.touches.length < 2) return
				// the second finger may land after touchstart
				if (!startDistance) {
					startDistance = distance(event.touches)
					return
				}
				this.currentImg.classList.add('moving')
				this.setScale((startScale * distance(event.touches)) / startDistance)
			},
			{ passive: false }
		)
		// touches while previewing all happen on the full screen container
		this.on(this.container, 'touchend', (event) => {
			stop()
			// prevent double tap zoom while previewing
			if (!this.isOpen) return
			const now = Date.now()
			if (now - lastTouchEnd <= 300) event.preventDefault()
			lastTouchEnd = now
		})
		this.on(this.container, 'touchcancel', stop)
	}

	// distribute processing function by action type
	private handleAction(action: string): void {
		switch (action) {
			case 'close':
			case 'Escape':
				this.hide()
				break
			case 'rotateLeft':
				this.setRotate(this.rotate - 90)
				break
			case 'rotateRight':
				this.setRotate(this.rotate + 90)
				break
			case 'zoomIn':
			case '+':
			case '=':
				this.zoomTo(this.scale * 1.25)
				break
			case 'zoomOut':
			case '-':
				this.zoomTo(this.scale / 1.25)
				break
			case 'reset':
				this.movable = false
				this.layout(true)
				break
			case 'next':
			case 'ArrowRight':
				this.next()
				break
			case 'prev':
			case 'ArrowLeft':
				this.prev()
				break
		}
	}

	private setIndex(index: number): void {
		this.index = index
		this.currentIndexEl.textContent = String(index + 1)
		this.prevButton.disabled = index === 0
		this.nextButton.disabled = index >= this.imgList.length - 1
	}

	// clamp within options.imageZoom, max is relative to the fitted scale
	private setScale(scale: number): void {
		const { min, max } = this.options.imageZoom
		this.scale = clamp(scale, min, this.baseScale + max)
		setProperties(this.currentImg, { '--scale': this.scale.toFixed(2) })
	}

	private zoomTo(scale: number): void {
		this.movable = true
		this.setScale(scale)
	}

	private setRotate(deg: number): void {
		this.rotate = deg
		setProperties(this.currentImg, { '--rotate': `${deg}deg` })
	}

	// put the preview image on the clicked image's rect
	private placeAtStart(): void {
		setStyle(this.currentImg, {
			top: `${this.startY}px`,
			left: `${this.startX - 1}px`,
			width: `${this.width}px`,
			height: `${this.height}px`
		})
	}

	// move image from its start rect to the viewport center and fit it
	private layout(resetRotate: boolean): void {
		const w = window.innerWidth
		const h = window.innerHeight
		const img = this.currentImg
		this.scale = this.baseScale = getFitScale(w, this.width, h, this.height, this.options.fillRatio)
		if (resetRotate) this.setRotate(0)
		this.placeAtStart()
		setProperties(img, {
			'--offsetX': `${w / 2 - this.width / 2 - this.startX}px`,
			'--offsetY': `${h / 2 - this.height / 2 - this.startY}px`,
			'--scale': `${this.scale}`
		})
	}

	// hide the image on the page when `hideOriginal` is on, showing the previously hidden one again
	private hideOriginal(el: HTMLImageElement | null): void {
		if (el === this.hiddenEl) return
		this.restoreOriginal()
		if (!el || !this.options.hideOriginal) return
		this.hiddenEl = el
		this.hiddenElVisibility = el.style.visibility
		el.style.visibility = 'hidden'
	}

	private restoreOriginal(): void {
		if (!this.hiddenEl) return
		this.hiddenEl.style.visibility = this.hiddenElVisibility
		this.hiddenEl = null
	}

	private context(): ImgPreviewerHookContext {
		return { index: this.index, img: this.currentClickEl! }
	}

	private getImageSrc(el: HTMLImageElement): string {
		const { dataUrlKey } = this.options
		return (dataUrlKey && el.getAttribute(dataUrlKey)) || el.src
	}

	// show a loading spinner on el until img is loaded
	private watchLoading(el: HTMLElement, img: HTMLImageElement): void {
		const timer = setTimeout(() => el.classList.add('loading'), 32)
		img.onload = img.onerror = () => {
			clearTimeout(timer)
			el.classList.remove('loading')
		}
	}

	private open(img: HTMLImageElement): void {
		const { container, options } = this
		const index = this.imgList.indexOf(img)
		const context: ImgPreviewerHookContext = { index, img }
		if (options.onBeforeShow?.(context) === false) return
		const src = this.getImageSrc(img)
		const openId = ++this.openId
		this.isOpen = true
		this.movable = false
		this.currentClickEl = img
		this.setIndex(index)
		container.style.display = 'block'
		this.watchLoading(this.currentItem, this.currentImg)
		const { width, height, x, y } = img.getBoundingClientRect()
		nextTick(() => {
			const currentImg = this.currentImg
			currentImg.classList.remove('img-pre__animated')
			currentImg.src = src
			container.classList.remove('hide')
			container.classList.add('show')
			this.width = width
			this.height = height
			this.startX = x
			this.startY = y
			// snap to the clicked image without transition first, otherwise an
			// interrupted hide animation would make it fly from its mid-flight position
			currentImg.classList.add('moving')
			currentImg.style.cssText = ''
			this.placeAtStart()
			setProperties(currentImg, { '--offsetX': '0px', '--offsetY': '0px', '--scale': '1', '--rotate': '0deg' })
			// force reflow so the start position is committed
			void currentImg.offsetWidth
			currentImg.classList.remove('moving')
			this.hideOriginal(img)
			this.layout(true)
			onceEnd(currentImg, 'transitionend', () => {
				// closed or reopened in the meantime
				if (!this.isOpen || openId !== this.openId) return
				options.onShown?.(context)
			})
			options.onShow?.(context)
		})
	}

	private slideTo(index: number): void {
		if (this.isAnimating) return
		this.isAnimating = true
		const clickEl = this.imgList[index]
		const prevIndex = this.index
		const src = this.getImageSrc(clickEl)
		const prevItem = this.currentItem
		const item = document.createElement('div')
		const img = document.createElement('img')
		// next: current slides out to the left, new one comes in from the right
		const side = index > prevIndex ? 'left' : 'right'

		img.src = src
		item.appendChild(img)
		item.classList.add('img-pre__img-item', `slide-${side}-in`)

		this.currentItem = item
		this.currentImg = img
		this.currentClickEl = clickEl
		this.width = clickEl.width
		this.height = clickEl.height
		this.hideOriginal(clickEl)
		this.movable = false
		this.setIndex(index)
		this.layout(true)

		this.watchLoading(item, img)
		this.wrapper.appendChild(item)
		this.options.onChange?.({ index, img: clickEl, prevIndex })

		prevItem.classList.add(`slide-${side}-out`)
		onceEnd(prevItem, 'animationend', () => {
			prevItem.remove()
			this.isAnimating = false
		})
		onceEnd(item, 'animationend', () => {
			item.classList.remove(`slide-${side}-in`)
			item.classList.add('current-index')
		})
	}
}

export default ImgPreviewer
