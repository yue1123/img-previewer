import {
	getElementRect,
	isElementInViewport,
	getTwoNumberSmall,
	debounce,
	preventDefault,
	nextTick
} from './utils/index'

import { ImgPreviewerOptions, runtimeStore, objectKeyOnlyCss } from './type'

function ImgPreviewer(this: any, selector: string, options?: ImgPreviewerOptions) {
	if (typeof window !== 'object') {
		return
	}
	// check use new
	if (!(this instanceof ImgPreviewer)) {
		return console.error(new Error('ImagePreviewerue is a constructor and should be called with the `new` keyword'))
	}
	// check required params is correct incoming
	if (selector && typeof selector === 'string') {
		if (!document.querySelector(selector)) return console.error(new Error('selector is invalid'))
	} else {
		return console.error(
			new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el')
		)
	}
	const template: string = `<div class="img-pre__header img-pre__animated"> <div class="img-pre__nums"> <p> <span id="img-pre__current-index"></span> <span class="img-pre__nums-delimiter">/</span> <span id="img-pre__total-index"></span> </p> </div> <div class="img-pre__bottons" id="J_header-buttons"> <button class="img-pre__button-item" data-action="reset" data-tooltip="{{RESET}}"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-view-list" viewBox="0 0 16 16" > <path d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z" /> </svg> </button> <button class="img-pre__button-item" data-action="rotateLeft" data-tooltip="{{ROTATE_LEFT}}"> <svg t="1639647288997" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1423" width="16" height="16" > <path d="M725.996 383.57H74.558A74.782 74.782 0 0 0 0 458.126v491.315A74.782 74.782 0 0 0 74.558 1024h651.438a74.782 74.782 0 0 0 74.558-74.558V458.127a74.782 74.782 0 0 0-74.558-74.558z m10.528 565.872a10.816 10.816 0 0 1-10.528 10.528H74.558a10.816 10.816 0 0 1-10.528-10.528V458.127c0-5.6 4.928-10.528 10.528-10.528h651.438c5.6 0 10.528 4.928 10.528 10.528v491.315z" p-id="1424" fill="#ffffff" ></path> <path d="M1023.94 533.165C986.117 355.73 849.93 202.038 668.558 132.088a592.112 592.112 0 0 0-234.33-39.551l36.511-38.463A32 32 0 1 0 424.341 9.98l-96.094 101.15a32 32 0 0 0 1.184 45.278l96.062 90.974a31.935 31.935 0 0 0 45.246-1.248 32 32 0 0 0-1.216-45.279l-46.75-44.319a529.17 529.17 0 0 1 222.746 35.231c161.403 62.239 282.392 198.139 315.703 354.647a32.063 32.063 0 0 0 62.718-13.248z" p-id="1425" fill="#ffffff" ></path> </svg> </button> <button class="img-pre__button-item" data-action="rotateRight" data-tooltip="{{ROTATE_RIGHT}}"> <svg t="1639647310917" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1652" width="16" height="16" > <path d="M0.69753 525.673495a31.720891 31.720891 0 0 0 25.581364 37.860419 32.744146 32.744146 0 0 0 38.372045-23.534855 502.929616 502.929616 0 0 1 320.790305-350.464687A557.673735 557.673735 0 0 1 611.580501 154.23209l-48.092964 44.511573a28.1395 28.1395 0 0 0-10.232546 21.999973 31.209264 31.209264 0 0 0 8.697664 22.511601 33.255773 33.255773 0 0 0 46.046455 0L706.231548 154.23209a32.744146 32.744146 0 0 0 10.232546-21.999973 31.720891 31.720891 0 0 0-9.209291-22.5116L609.533992 10.464824a33.255773 33.255773 0 0 0-31.209264-9.720918 32.232519 32.232519 0 0 0-23.534855 21.488346A31.209264 31.209264 0 0 0 563.487537 51.906634l37.348791 37.860419a626.743417 626.743417 0 0 0-237.906685 38.883673 566.883026 566.883026 0 0 0-358.139095 394.97626z m269.115949 420.045996a11.767427 11.767427 0 0 0 10.744172 10.744173h665.115464a10.744173 10.744173 0 0 0 10.744173-10.744173V435.627094a10.744173 10.744173 0 0 0-10.744173-10.744173h-665.115464a11.2558 11.2558 0 0 0-10.744172 10.744173v511.627279zM281.069279 358.883002h665.115463A77.255719 77.255719 0 0 1 1023.952089 435.627094v511.627279a76.744092 76.744092 0 0 1-77.25572 76.744092h-665.115463A76.744092 76.744092 0 0 1 205.348441 945.719491V435.627094A77.255719 77.255719 0 0 1 281.069279 358.883002z" p-id="1653" fill="#ffffff" ></path> </svg> </button> <button class="img-pre__button-item" data-action="close" data-tooltip="{{CLOSE}}"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16" > <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z" /> <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z" /> </svg> </button> <button id="J-img-pre__prev" data-action="prev" data-tooltip="{{PREV}}"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/> </svg> </button> <button id="J-img-pre__next" data-action="next" data-tooltip="{{NEXT}}"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/> </svg> </button> </div> </div> <div class="img-pre__contet-warpper" id="J_content-warpper"> <div class="img-pre__img-item img-pre__animated current-index" id="J_current-index"> <img id="img-pre__imgage" src="" /> </div> </div>`

	const defaultOptions = {
		ratio: 0.7,
		zoom: {
			min: 1,
			max: 5,
			step: 0.1
		},
		opacity: 0.6,
		scrollbar: false
	}
	let mergeOptions: any
	let previewerContainer: HTMLElement | null = null
	const i18n = {
		en: {
			RESET: 'reset',
			ROTATE_LEFT: 'rotate left',
			ROTATE_RIGHT: 'rotate right',
			CLOSE: 'close',
			NEXT: 'next',
			PREV: 'prev'
		},
		zh: {
			RESET: '重置',
			ROTATE_LEFT: '向左旋转',
			ROTATE_RIGHT: '向右旋转',
			CLOSE: '关闭',
			NEXT: '下一张',
			PREV: '上一张'
		}
	}
	const store: runtimeStore = {
		rootEl: null,
		container: null,
		imgList: [],
		currentImgElement: null,
		totalIndex: 0,
		index: 0,
		width: 0,
		height: 0,
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
		scale: 0,
		_scale: 0,
		rotate: 0,
		currentClickEl: null
	}
	let isOpen: boolean = false
	let isRunning: boolean = false
	// FIXME: 储存到store中去
	let moveable: boolean = false
	// 绑定事件
	function bindEvent(rootEl: HTMLElement | null) {
		let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent)
		const warpper = document.getElementById('J_content-warpper')
		// add click eventlistener for rootEl, proxy img click event
		rootEl?.addEventListener(
			'click',
			(event: any) => {
				const target: HTMLImageElement = event.target
				if (target === store.currentImgElement) return
				if (target.localName === 'img') {
					store.currentClickEl = target
					store.index = Number(target.dataset.index)
					handlePrviewershow(event, store.imgList[store.index].src)
				}
			},
			false
		)

		// all buttons event proxy linstener
		document.getElementById('J_header-buttons')!.addEventListener('click', (event: any) => {
			// fixed mobile Safari and chrome e.path undefined
			const _event = window.event || event
			const path: HTMLElement[] = _event.path || (_event.composedPath && _event.composedPath())
			const buttonEl: HTMLButtonElement = path.find(
				(item: HTMLElement) => item.localName === 'button'
			) as HTMLButtonElement
			if (buttonEl && !buttonEl.disabled) {
				handleActionFn(buttonEl.dataset.action as string)
			}
		})

		// hot keyboard event listener
		document.addEventListener('keyup', ({ key }: KeyboardEvent) => handleActionFn(key))

		// mouse wheel to zoom and zoom out image
		warpper?.addEventListener('mousewheel', (e: any) => {
			if (e.target.localName !== 'img') return
			moveable = true
			preventDefault(e)
			let { min, max, step } = mergeOptions.zoom
			let _max = store._scale + max
			if (e.wheelDelta > 0) {
				// zoom
				const scale = step + store.scale
				store.scale = scale > _max ? _max : scale
			} else {
				// zoom out
				const scale = store.scale - step
				store.scale = scale < min ? min : scale
			}
			store.currentImgElement!.style.setProperty('--scale', `${store.scale.toFixed(2)}`)
		})

		// click modal hide preview
		warpper?.addEventListener('click', (event) => {
			if (event.target === document.getElementById('J_current-index')) {
				handleActionFn('close')
			}
		})
		//
		if (mobile) {
			enableMobileScale(warpper)
			let lastTouchEnd = 0
			document.documentElement.addEventListener(
				'touchend',
				function (event) {
					let now = Date.now()
					if (now - lastTouchEnd <= 300) {
						event.preventDefault()
					}
					lastTouchEnd = now
				},
				false
			)
		}
		warpper?.addEventListener('mousedown', (e: any) => {
			if (e.target.localName !== 'img' || !moveable) return
			let diffX = e.clientX - e.target!.offsetLeft
			let diffY = e.clientY - e.target!.offsetTop
			e.preventDefault()
			store.currentImgElement!.classList.add('moving')
			warpper['onmousemove'] = function (e: any) {
				let moveX = e.clientX - diffX
				let moveY = e.clientY - diffY
				setStyle(store.currentImgElement, {
					top: `${moveY}px`,
					left: `${moveX}px`
				})
			}
			warpper['onmouseup'] = function () {
				this.onmousemove = null
				store.currentImgElement!.classList.remove('moving')
			}
			warpper['onmouseout'] = function () {
				this.onmousemove = null
				store.currentImgElement!.classList.remove('moving')
			}
		})

		const handleResize = debounce(() => {
			isOpen && setImageStyles(window.innerWidth, window.innerHeight)
		}, 100)
		window.addEventListener('resize', handleResize)
	}
	// distribute processing function by antionType
	function handleActionFn(actionType: string) {
		switch (actionType) {
			case 'close':
			case 'Escape':
				handlePrviewerHide()
				break
			case 'rotateLeft':
				handleRotateLeft()
				break
			case 'rotateRight':
				handleRotateRight()
				break
			case 'reset':
				handleReset()
				break
			case 'next':
			case 'ArrowRight':
				handleNext()
				break
			case 'prev':
			case 'ArrowLeft':
				handlePrev()
				break
			default:
				break
		}
	}
	function setStyle(imgElement: HTMLElement | null, styleObj: objectKeyOnlyCss) {
		for (const key in styleObj) {
			imgElement!.style[key] = styleObj[key]
		}
	}
	// setProperties
	function setProperties(imgElement: HTMLElement | null, properties: object) {
		for (const key in properties) {
			imgElement!.style.setProperty(key, properties[key])
		}
	}
	function setDataset(el: HTMLElement, key: string, value: string) {
		if (el.dataset) {
			el.dataset[key] = value
		} else {
			el.setAttribute('data-' + key, value)
		}
	}
	function setImageStyles(w: number, h: number) {
		store.endX = w / 2 - store.width / 2 - store.startX
		store.endY = h / 2 - store.height / 2 - store.startY
		store.scale = store._scale = getTwoNumberSmall(
			w,
			store.width,
			h,
			store.height,
			mergeOptions.ratio || defaultOptions.ratio
		)
		setStyle(store.currentImgElement, {
			top: `${store.startY}px`,
			left: `${store.startX - 1}px`,
			width: `${store.width}px`,
			height: `${store.height}px`
		})
		setProperties(store.currentImgElement, {
			'--offsetX': `${store.endX}px`,
			'--offsetY': `${store.endY}px`,
			'--scale': `${store.scale}`,
			'--rotate': `0`
		})
	}

	// mobile enable two finger scale
	function enableMobileScale(warpper: any) {
		let _store: any = {
			scale: 1
		}
		warpper?.addEventListener('touchstart', function (event: any) {
			if (event.target.localName !== 'img') return
			event.preventDefault()
			let touches = event.touches
			let events = touches[0]
			let events2 = touches[1]

			// 第一个触摸点的坐标
			_store.pageX = events.pageX
			_store.pageY = events.pageY

			_store.moveable = true

			if (events2) {
				_store.pageX2 = events2.pageX
				_store.pageY2 = events2.pageY
			}

			_store.originScale = _store.scale || 1
		})
		document.addEventListener('touchmove', function (event) {
			if (!_store.moveable) {
				return
			}
			event.preventDefault()
			store.currentImgElement!.classList.add('moving')
			let touches = event.touches
			let events = touches[0]
			let events2 = touches[1]
			// two finger move
			if (events2) {
				// 第2个指头坐标在touchmove时候获取
				if (!_store.pageX2) {
					_store.pageX2 = events2.pageX
				}
				if (!_store.pageY2) {
					_store.pageY2 = events2.pageY
				}

				// 获取坐标之间的距离
				let getDistance = function (start: any, stop: any) {
					return Math.hypot(stop.x - start.x, stop.y - start.y)
				}
				// 双指缩放比例计算
				let zoom =
					getDistance(
						{
							x: events.pageX,
							y: events.pageY
						},
						{
							x: events2.pageX,
							y: events2.pageY
						}
					) /
					getDistance(
						{
							x: _store.pageX,
							y: _store.pageY
						},
						{
							x: _store.pageX2,
							y: _store.pageY2
						}
					)
				// 应用在元素上的缩放比例
				let newScale = _store.originScale * zoom
				// 最大缩放比例限制
				if (newScale > mergeOptions.zoom.max) {
					newScale = mergeOptions.zoom.max
				}
				// 记住使用的缩放值
				_store.scale = newScale
				// 图像应用缩放效果
				store.currentImgElement!.style.setProperty('--scale', `${newScale.toFixed(2)}`)
			}
		})

		document.addEventListener('touchend', function () {
			_store.moveable = false
			store.currentImgElement!.classList.remove('moving')
			delete _store.pageX2
			delete _store.pageY2
		})
		document.addEventListener('touchcancel', function () {
			_store.moveable = false
			store.currentImgElement!.classList.remove('moving')
			delete _store.pageX2
			delete _store.pageY2
		})
	}
	function handleReset() {
		moveable = false
		setImageStyles(window.innerWidth, window.innerHeight)
	}
	function handleNext() {
		if (store.index === store.totalIndex - 1 || isRunning) return
		isRunning = true
		const index: number = store.index + 1
		const div: HTMLDivElement = document.createElement<'div'>('div')
		const warpper: HTMLElement | null = document.getElementById('J_content-warpper')
		const img: HTMLImageElement = document.createElement<'img'>('img')
		const currentImgWarpper: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#J_current-index')
		const clickEl = store.imgList[index]
		img.src = clickEl.src

		// cache data
		store.index = index
		store.width = clickEl.width
		store.height = clickEl.height
		store.currentImgElement = img
		//
		setImageStyles(window.innerWidth, window.innerHeight)
		div.appendChild(img)
		div.classList.add('img-pre__img-item', 'slide-left-in')
		warpper!.appendChild(div)

		currentImgWarpper!.classList.add('slide-left-out')
		currentImgWarpper!.addEventListener('animationend', () => {
			isRunning = false
			currentImgWarpper && warpper!.removeChild(currentImgWarpper as Node)
		})

		// listen animationend and remove prev el
		div.addEventListener(
			'animationend',
			() => {
				div.classList.remove('slide-left-in')
				div.classList.add('current-index')
				div.id = 'J_current-index'
				store.currentClickEl = clickEl
			},
			{
				once: true
			}
		)
	}
	function handlePrev() {
		if (store.index === 0 || isRunning) return
		isRunning = true
		const index = store.index - 1
		const div: HTMLDivElement = document.createElement<'div'>('div')
		const img: HTMLImageElement = document.createElement<'img'>('img')
		const warpper = document.getElementById('J_content-warpper')
		const currentImgWarpper: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#J_current-index')
		const clickEl = store.imgList[index]
		img.src = clickEl.src
		// cache data
		store.index = index
		store.width = clickEl.width
		store.height = clickEl.height
		store.currentImgElement = img
		//
		setImageStyles(window.innerWidth, window.innerHeight)
		div.appendChild(img)
		div.classList.add('img-pre__img-item', 'slide-right-in')
		warpper!.appendChild(div)

		currentImgWarpper!.classList.add('slide-right-out')
		currentImgWarpper!.addEventListener('animationend', () => {
			isRunning = false
			currentImgWarpper && warpper!.removeChild(currentImgWarpper as Node)
		})

		// listen animationend and remove next el
		div.addEventListener(
			'animationend',
			() => {
				div.classList.remove('slide-right-in')
				div.classList.add('current-index')
				div.id = 'J_current-index'

				store.currentClickEl = clickEl
			},
			{
				once: true
			}
		)
	}
	// show
	function handlePrviewershow(e: any, src: string): void {
		isOpen = true
		previewerContainer!.style.display = 'block'
		document.ondragstart = preventDefault
		document.ondragend = preventDefault
		nextTick(() => {
			store.currentImgElement!.src = src
			previewerContainer!.classList.remove('hide')
			previewerContainer!.classList.add('show')
			store.width = e.target.width
			store.height = e.target.height
			store.startX = e.clientX - e.offsetX
			store.startY = e.clientY - e.offsetY + 1
			setImageStyles(window.innerWidth, window.innerHeight)
		})
	}
	// hide
	function handlePrviewerHide(): void {
		isOpen = false
        moveable = false
		document.ondragstart = null
		document.ondragend = null
		//  current click image el is in viewport
		if (isElementInViewport(store.currentClickEl)) {
			const { top, left, width, height } = getElementRect(store.currentClickEl)
			previewerContainer!.classList.remove('show')
			previewerContainer!.classList.add('hide')
			store.currentImgElement!.style.cssText = `width:${width}px;height:${height}px;position: fixed; top: ${top}px; left: ${left}px;`
			store.currentImgElement!.addEventListener(
				'transitionend',
				() => {
					previewerContainer!.style.display = 'none'
					store.currentImgElement!.src = ''
					store.currentImgElement!.style.cssText = ``
				},
				{ once: true }
			)
		} else {
		}
	}

	function handleRotateLeft(): void {
		store.rotate -= 90
		setProperties(store.currentImgElement, {
			'--rotate': `${store.rotate}deg`
		})
	}

	function handleRotateRight(): void {
		store.rotate += 90
		setProperties(store.currentImgElement, {
			'--rotate': `${store.rotate}deg`
		})
	}

	// listen index change,and update view
	function onIndexChange(index: number): void {
		document.getElementById('img-pre__current-index')!.innerText = String(index + 1)
		let prevButton = document.getElementById('J-img-pre__prev') as HTMLButtonElement
		let nextButton = document.getElementById('J-img-pre__next') as HTMLButtonElement
		if (index === 0) {
			prevButton.disabled = true
		} else {
			prevButton.disabled = false
		}
		if (index === store.totalIndex - 1) {
			nextButton.disabled = true
		} else {
			nextButton.disabled = false
		}
	}

	function onTotalIndexChange(index: number): void {
		document.getElementById('img-pre__total-index')!.innerText = '' + index
	}

	// get i18n options
	function geti18nInfo(): object {
		if (mergeOptions.i18n) {
			return mergeOptions.i18n
		} else {
			const lang: string = window.navigator.language
			// all display in English except Chinese
			return lang.indexOf('zh') !== -1 ? i18n.zh : i18n.en
		}
	}

	// i18n translate
	function i18nTranslate(template: string, i18nObj: object): string {
		return template.replace(/\{\{(.*?)\}\}/g, (_, a) => i18nObj[a])
	}
	//
	function defineReactValue(store: object, key: string, value: any, cal: (newVal: any) => void): void {
		Object.defineProperty(store, key, {
			enumerable: false,
			set(newVal) {
				cal((value = newVal))
			},
			get() {
				return value
			}
		})
	}
	//
	function render(): void {
		let el: HTMLElement | null = document.getElementById('image-preview-container')
		if (!el) {
			previewerContainer = document.createElement('div')
			previewerContainer.classList.add('img-pre__container', 'img-pre__animated')
			previewerContainer.id = 'J_container'
			previewerContainer.style.setProperty('--container-opcity', '0.6')
			previewerContainer.style.setProperty('--header-bg-opcity', '0.2')
			previewerContainer.style.setProperty('--container-zIndex', '99')
			previewerContainer.innerHTML = i18nTranslate(template, geti18nInfo())
			document.body.appendChild(previewerContainer)
		} else {
			previewerContainer = el
		}
	}
	function _init(this: any, selector: string, options?: ImgPreviewerOptions): void {
		if (options) {
			options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {})
			mergeOptions = Object.assign({}, defaultOptions, options)
		} else {
			mergeOptions = defaultOptions
		}
		const rootEl: HTMLElement | null = document.querySelector(selector)
		const imgEls = rootEl!.querySelectorAll<HTMLImageElement>('img')
		// use defineProperty to init listen index
		defineReactValue(store, 'index', 0, onIndexChange)
		defineReactValue(store, 'totalIndex', 0, onTotalIndexChange)
		// render to document
		render()
		// bind enent for el
		bindEvent(rootEl)
		// cache data
		// store.rootEl = rootEl
		store.totalIndex = imgEls!.length
		store.imgList = new Array(store.totalIndex)
		store.currentImgElement = document.querySelector('#J_current-index img')

		for (let i = 0, len = store.totalIndex; i < len; i++) {
			let element = imgEls![i]
			setDataset(element, 'index', String(i))
			store.imgList[i] = element
		}
	}
	ImgPreviewer.prototype.reset = function () {
		console.log(mergeOptions, options)
	}
	_init(selector, options)
}

export default ImgPreviewer
