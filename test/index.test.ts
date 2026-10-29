import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ImgPreviewer from '../src/index'

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T

function setup(count = 3, id = 'app') {
	const root = document.createElement('div')
	root.id = id
	for (let i = 0; i < count; i++) {
		const img = document.createElement('img')
		img.src = `http://localhost/${id}-${i}.jpg`
		root.appendChild(img)
	}
	document.body.appendChild(root)
	return root
}

function containers() {
	return document.querySelectorAll<HTMLElement>('.img-pre__container')
}

// finish all running slide animations
function flushAnimations() {
	vi.advanceTimersByTime(1000)
}

beforeEach(() => {
	vi.useFakeTimers()
	vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => fn(0))
	// jsdom has no layout, give images a size
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
		x: 10, y: 20, top: 20, left: 10, width: 100, height: 80, right: 110, bottom: 100, toJSON() {}
	} as DOMRect)
})

afterEach(() => {
	// let pending close animations finish, so they release what they hold on window
	vi.runOnlyPendingTimers()
	document.body.innerHTML = ''
	vi.useRealTimers()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('ImgPreviewer', () => {
	it('reports invalid selector without throwing', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		new ImgPreviewer('#not-exist')
		expect(error).toHaveBeenCalledTimes(1)
		expect(containers().length).toBe(0)
	})

	it('collects images and renders counter', () => {
		setup(3)
		const p = new ImgPreviewer('#app')
		expect(p.getTotalIndex()).toBe(2)
		expect($('.img-pre__total-index').textContent).toBe('3')
	})

	it('opens on image click and closes on Escape', () => {
		setup(3)
		const onShow = vi.fn()
		const onHide = vi.fn()
		const onClose = vi.fn()
		new ImgPreviewer('#app', { onShow, onHide, onClose })
		const container = containers()[0]
		document.querySelectorAll<HTMLImageElement>('#app img')[1].click()
		expect(container.style.display).toBe('block')
		expect(container.classList.contains('show')).toBe(true)
		expect($('.img-pre__current-index').textContent).toBe('2')
		expect($<HTMLImageElement>('.img-pre__img-item img', container).src).toBe('http://localhost/app-1.jpg')
		expect(onShow).toHaveBeenCalledTimes(1)

		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }))
		expect(onHide).toHaveBeenCalledTimes(1)
		expect(onClose).toHaveBeenCalledTimes(1)
		flushAnimations()
		expect(container.style.display).toBe('none')
	})

	it('calls lifecycle hooks in order with context', () => {
		setup(3)
		const [first, second] = Array.from(document.querySelectorAll<HTMLImageElement>('#app img'))
		const calls: string[] = []
		const record = (name: string) => (context: any) => {
			calls.push(`${name}:${context.index}${'prevIndex' in context ? '<' + context.prevIndex : ''}`)
		}
		const onShow = vi.fn(record('show'))
		const onHidden = vi.fn(record('hidden'))
		const p = new ImgPreviewer('#app', {
			onBeforeShow: record('beforeShow'),
			onShow,
			onShown: record('shown'),
			onChange: record('change'),
			onBeforeHide: record('beforeHide'),
			onHide: record('hide'),
			onHidden
		})
		p.show(0)
		expect(onShow.mock.calls[0][0].img).toBe(first)
		flushAnimations()
		p.next()
		flushAnimations()
		p.hide()
		flushAnimations()
		expect(onHidden.mock.calls[0][0].img).toBe(second)
		expect(calls).toEqual(['beforeShow:0', 'show:0', 'shown:0', 'change:1<0', 'beforeHide:1', 'hide:1', 'hidden:1'])
	})

	it('cancels show and hide when before hooks return false', () => {
		setup(2)
		let allowHide = false
		const onShow = vi.fn()
		const p = new ImgPreviewer('#app', {
			onBeforeShow: ({ index }) => index !== 0,
			onBeforeHide: () => allowHide,
			onShow
		})
		const container = containers()[0]
		p.show(0)
		expect(container.style.display).toBe('')
		p.show(1)
		expect(onShow).toHaveBeenCalledTimes(1)
		p.hide()
		expect(container.classList.contains('show')).toBe(true)
		allowHide = true
		p.hide()
		expect(container.classList.contains('hide')).toBe(true)
	})

	it('skips onShown when closed before the open animation ends', () => {
		setup(1)
		const onShown = vi.fn()
		const p = new ImgPreviewer('#app', { onShown })
		p.show(0)
		p.hide()
		flushAnimations()
		expect(onShown).not.toHaveBeenCalled()
	})

	it('starts from the clicked image when reopened during the hide animation', () => {
		setup(2)
		const p = new ImgPreviewer('#app')
		p.show(0)
		p.hide()
		// capture the start state at the forced reflow, before layout() moves it to the center
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		let startState: Record<string, string> | null = null
		vi.spyOn(img, 'offsetWidth', 'get').mockImplementation(() => {
			startState = {
				moving: String(img.classList.contains('moving')),
				offsetX: img.style.getPropertyValue('--offsetX'),
				scale: img.style.getPropertyValue('--scale')
			}
			return 100
		})
		p.show(1)
		// laid out at the fitted size in the center, transformed back onto the clicked image (100x80 at 10,20)
		const width = parseFloat(img.style.width)
		const left = parseFloat(img.style.left)
		expect(startState!.moving).toBe('true')
		expect(parseFloat(startState!.offsetX)).toBeCloseTo(60 - (left + width / 2))
		expect(parseFloat(startState!.scale)).toBeCloseTo(100 / width)
		// then animated to the center
		expect(img.classList.contains('moving')).toBe(false)
		expect(img.style.getPropertyValue('--offsetX')).toBe('0px')
		expect(img.style.getPropertyValue('--scale')).toBe('1')
	})

	it('flies back with transforms only, keeping the laid out box', () => {
		setup(1)
		const p = new ImgPreviewer('#app')
		p.show(0)
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		$<HTMLButtonElement>('[data-action="rotateRight"]').click()
		const box = { top: img.style.top, left: img.style.left, width: img.style.width, height: img.style.height }
		p.hide()
		expect({ top: img.style.top, left: img.style.left, width: img.style.width, height: img.style.height }).toEqual(box)
		expect(parseFloat(img.style.getPropertyValue('--scale'))).toBeCloseTo(100 / parseFloat(box.width))
		expect(img.style.getPropertyValue('--rotate')).toBe('0deg')
	})

	it('hides the original image while previewing when hideOriginal is on', () => {
		setup(2)
		const [first, second] = Array.from(document.querySelectorAll<HTMLImageElement>('#app img'))
		first.style.visibility = 'visible'
		const p = new ImgPreviewer('#app', { hideOriginal: true })
		p.show(0)
		expect(first.style.visibility).toBe('hidden')
		// switching shows the previous one again and hides the new one
		p.next()
		expect(first.style.visibility).toBe('visible')
		expect(second.style.visibility).toBe('hidden')
		flushAnimations()
		// stays hidden during the fly back animation, restored when it lands
		p.hide()
		expect(second.style.visibility).toBe('hidden')
		flushAnimations()
		expect(second.style.visibility).toBe('')
		// destroy while open restores it too
		p.show(0)
		p.destroy()
		expect(first.style.visibility).toBe('visible')
	})

	it('hides the original image by default and keeps it visible when hideOriginal is off', () => {
		setup(1)
		const img = document.querySelector<HTMLImageElement>('#app img')!
		const p = new ImgPreviewer('#app')
		p.show(0)
		expect(img.style.visibility).toBe('hidden')
		p.destroy()
		new ImgPreviewer('#app', { hideOriginal: false }).show(0)
		expect(img.style.visibility).toBe('')
	})

	it('ignores hot keys while closed', () => {
		setup(3)
		new ImgPreviewer('#app')
		document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
		expect(document.querySelectorAll('.img-pre__img-item').length).toBe(1)
		expect($('.img-pre__current-index').textContent).toBe('1')
	})

	it('navigates with show/next/prev and updates buttons', () => {
		setup(3)
		const p = new ImgPreviewer('#app')
		const prev = $<HTMLButtonElement>('.img-pre__prev')
		const next = $<HTMLButtonElement>('.img-pre__next')
		p.show(0)
		expect(prev.disabled).toBe(true)
		p.next()
		flushAnimations()
		expect($('.img-pre__current-index').textContent).toBe('2')
		expect(document.querySelectorAll('.img-pre__img-item').length).toBe(1)
		p.show(2)
		flushAnimations()
		expect(next.disabled).toBe(true)
		// jump back to the first one, index 0 must not be treated as "no index"
		p.show(0)
		flushAnimations()
		expect($('.img-pre__current-index').textContent).toBe('1')
		expect($<HTMLImageElement>('.img-pre__img-item img').src).toBe('http://localhost/app-0.jpg')
		p.prev()
		flushAnimations()
		expect($('.img-pre__current-index').textContent).toBe('1')
	})

	it('throws on invalid index', () => {
		setup(2)
		const p = new ImgPreviewer('#app')
		expect(() => p.show(5)).toThrow('invalid index')
	})

	it('uses dataUrlKey for the large image', () => {
		const root = setup(1)
		root.querySelector('img')!.setAttribute('data-src', 'http://localhost/large.jpg')
		const p = new ImgPreviewer('#app', { dataUrlKey: 'data-src' })
		p.show(0)
		expect($<HTMLImageElement>('.img-pre__img-item img').src).toBe('http://localhost/large.jpg')
	})

	it('uses the duration option for animations and their fallback', () => {
		setup(1)
		const p = new ImgPreviewer('#app', { duration: 1000 })
		const container = containers()[0]
		expect(container.style.getPropertyValue('--container-duration')).toBe('1000ms')
		p.show(0)
		p.hide()
		// no transitionend in jsdom, the fallback must wait for the whole animation
		vi.advanceTimersByTime(900)
		expect(container.style.display).toBe('block')
		vi.advanceTimersByTime(400)
		expect(container.style.display).toBe('none')
	})

	it('falls back to the default duration for invalid values', () => {
		setup(1)
		new ImgPreviewer('#app', { duration: -1 })
		new ImgPreviewer('#app', { duration: 0 })
		expect(containers()[0].style.getPropertyValue('--container-duration')).toBe('400ms')
		expect(containers()[1].style.getPropertyValue('--container-duration')).toBe('0ms')
	})

	it('marks the container when the toolbar is turned off', () => {
		setup(1)
		new ImgPreviewer('#app')
		new ImgPreviewer('#app', { toolbar: false })
		expect(containers()[0].classList.contains('img-pre__container--no-toolbar')).toBe(false)
		expect(containers()[1].classList.contains('img-pre__container--no-toolbar')).toBe(true)
	})

	it('does not mutate user options', () => {
		setup(1)
		const options = { imageZoom: { step: 1 } }
		new ImgPreviewer('#app', options)
		expect(options).toEqual({ imageZoom: { step: 1 } })
	})

	it('picks up images added later on click', () => {
		const root = setup(1)
		const p = new ImgPreviewer('#app')
		const img = document.createElement('img')
		img.src = 'http://localhost/new.jpg'
		root.appendChild(img)
		img.click()
		expect(p.getTotalIndex()).toBe(1)
		expect($('.img-pre__current-index').textContent).toBe('2')
	})

	it('keeps multiple instances independent', () => {
		setup(2, 'a')
		setup(4, 'b')
		const a = new ImgPreviewer('#a')
		const b = new ImgPreviewer('#b')
		expect(containers().length).toBe(2)
		expect(a.getTotalIndex()).toBe(1)
		expect(b.getTotalIndex()).toBe(3)
		b.show(3)
		expect(containers()[1].style.display).toBe('block')
		expect(containers()[0].style.display).toBe('')
	})

	it('excludes its own images when root is body', () => {
		setup(2)
		const p = new ImgPreviewer('body')
		expect(p.getTotalIndex()).toBe(1)
	})

	it('zooms with mouse wheel within limits', () => {
		setup(1)
		const p = new ImgPreviewer('#app', { imageZoom: { min: 1, max: 1, step: 10 } })
		p.show(0)
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		// --scale is relative to the fitted size, zoom limits are relative to the clicked image (100px wide)
		const fit = parseFloat(img.style.width) / 100
		const scale = () => Number(img.style.getPropertyValue('--scale')) * fit
		img.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }))
		expect(scale()).toBeCloseTo(fit + 1, 1)
		expect(img.classList.contains('zooming')).toBe(true)
		for (let i = 0; i < 5; i++) img.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }))
		expect(scale()).toBeCloseTo(1, 2)
	})

	it('rotates and resets via toolbar buttons', () => {
		setup(1)
		const p = new ImgPreviewer('#app')
		p.show(0)
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		$<HTMLButtonElement>('[data-action="rotateRight"]').click()
		expect(img.style.getPropertyValue('--rotate')).toBe('90deg')
		$<HTMLButtonElement>('[data-action="rotateLeft"]').click()
		$<HTMLButtonElement>('[data-action="rotateLeft"]').click()
		expect(img.style.getPropertyValue('--rotate')).toBe('-90deg')
		$<HTMLButtonElement>('[data-action="reset"]').click()
		expect(img.style.getPropertyValue('--rotate')).toBe('0deg')
	})

	it('zooms with toolbar buttons and +/- keys', () => {
		setup(1)
		const p = new ImgPreviewer('#app')
		p.show(0)
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		const scale = () => Number(img.style.getPropertyValue('--scale'))
		const base = scale()
		$<HTMLButtonElement>('[data-action="zoomIn"]').click()
		expect(scale()).toBeCloseTo(base * 1.25, 1)
		document.dispatchEvent(new KeyboardEvent('keyup', { key: '-' }))
		expect(scale()).toBeCloseTo(base, 1)
		document.dispatchEvent(new KeyboardEvent('keyup', { key: '+' }))
		expect(scale()).toBeCloseTo(base * 1.25, 1)
	})

	it('does not zoom when zoomable is off', () => {
		setup(1)
		const p = new ImgPreviewer('#app', { zoomable: false })
		expect(containers()[0].classList.contains('img-pre__container--no-zoom')).toBe(true)
		p.show(0)
		const img = $<HTMLImageElement>('.img-pre__img-item img')
		const base = img.style.getPropertyValue('--scale')
		$<HTMLButtonElement>('[data-action="zoomIn"]').click()
		document.dispatchEvent(new KeyboardEvent('keyup', { key: '+' }))
		img.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }))
		expect(img.style.getPropertyValue('--scale')).toBe(base)
		expect(img.classList.contains('zooming')).toBe(false)
	})

	it('navigates with the side buttons', () => {
		setup(2)
		const p = new ImgPreviewer('#app')
		p.show(0)
		$<HTMLButtonElement>('.img-pre__next').click()
		flushAnimations()
		expect($('.img-pre__current-index').textContent).toBe('2')
	})

	it('stops a mouse drag in progress on hide and destroy', () => {
		setup(1)
		const removed = vi.spyOn(window, 'removeEventListener')
		const p = new ImgPreviewer('#app')
		const startDrag = () => {
			p.show(0)
			const img = $<HTMLImageElement>('.img-pre__img-item img')
			$<HTMLButtonElement>('[data-action="zoomIn"]').click()
			img.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
			expect(img.classList.contains('moving')).toBe(true)
			return img
		}
		const dragListeners = () => removed.mock.calls.filter(([type]) => type === 'mousemove' || type === 'mouseup')

		let img = startDrag()
		p.hide()
		expect(img.classList.contains('moving')).toBe(false)
		expect(dragListeners().length).toBe(2)
		flushAnimations()

		img = startDrag()
		removed.mockClear()
		p.destroy()
		expect(dragListeners().length).toBe(2)
		window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 300 }))
		expect(img.style.top).not.toBe('300px')
	})

	it('blocks page scrolling until the close animation ends', () => {
		setup(2)
		const p = new ImgPreviewer('#app')
		const scroll = () => {
			const events = [
				new WheelEvent('wheel', { cancelable: true }),
				new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true }),
				new KeyboardEvent('keydown', { key: 'a', cancelable: true })
			]
			events.forEach((event) => window.dispatchEvent(event))
			return events.map((event) => event.defaultPrevented)
		}
		p.show(0)
		p.hide()
		expect(scroll()).toEqual([true, true, false])
		flushAnimations()
		expect(scroll()).toEqual([false, false, false])
		// reopening during the close animation and destroy both release the lock
		p.show(0)
		p.hide()
		p.show(1)
		expect(scroll()).toEqual([false, false, false])
		p.hide()
		p.destroy()
		expect(scroll()).toEqual([false, false, false])
	})

	it('destroy removes DOM and listeners', () => {
		setup(2)
		const p = new ImgPreviewer('#app')
		p.destroy()
		expect(containers().length).toBe(0)
		expect(() => document.querySelector<HTMLImageElement>('#app img')!.click()).not.toThrow()
		expect(() => document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }))).not.toThrow()
	})

	it('uses i18n option for tooltips', () => {
		setup(1)
		new ImgPreviewer('#app', {
			i18n: { RESET: 'R', ROTATE_LEFT: 'RL', ROTATE_RIGHT: 'RR', CLOSE: 'C', NEXT: 'N', PREV: 'P' }
		})
		expect($('[data-action="close"]').getAttribute('data-tooltip')).toBe('C')
		// keys missing from the custom i18n fall back to the built-in text
		expect($('[data-action="zoomIn"]').getAttribute('data-tooltip')).toMatch(/zoom in|放大/)
		expect($('[data-action="close"]').getAttribute('aria-label')).toBe('C')
	})
})
