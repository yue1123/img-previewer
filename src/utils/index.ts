export function debounce<T>(fn: (arg: T) => void, delay: number): (arg: T) => void {
	let timer = 0
	return function (arg: T) {
		clearTimeout(timer)
		timer = window.setTimeout(() => fn(arg), delay)
	}
}

export function preventDefault(e: Event): void {
	e.preventDefault()
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

/**
 * check element is not hidden by css
 * @param el check el
 * @param bubblingLevel The level to look up from the current element
 * @returns {boolean}
 */
export function isElementVisibleByCss(el: Element | null, bubblingLevel: number): boolean {
	while (bubblingLevel-- && el) {
		const { visibility, height, opacity, width } = getComputedStyle(el)
		if (visibility === 'hidden' || height === '0px' || width === '0px' || opacity === '0') {
			return false
		}
		el = el.parentElement
	}
	return true
}

/**
 * 判断一个元素是否出现在当前视口中
 * @param el 要判断的元素
 * @returns {boolean}
 */
export function isElementInViewport(el: Element | null, bubblingLevel: number): boolean {
	if (!el || !el.isConnected) return false
	const rect = el.getBoundingClientRect()
	const vWidth = window.innerWidth || document.documentElement.clientWidth
	const vHeight = window.innerHeight || document.documentElement.clientHeight
	// if element display:none or transform:scale(0)
	if (rect.width === 0 || rect.height === 0) {
		return false
	} else if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
		return false
	} else {
		return isElementVisibleByCss(el, bubblingLevel)
	}
}

/**
 * 计算让 (width, height) 以 ratio 比例填充 (containerWidth, containerHeight) 的缩放值
 */
export function getFitScale(
	containerWidth: number,
	width: number,
	containerHeight: number,
	height: number,
	ratio: number
): number {
	return Math.min((containerWidth * ratio) / width, (containerHeight * ratio) / height)
}

// 页面绘制后的下一帧回调
export function nextTick(fn: () => void): void {
	requestAnimationFrame(fn)
}

// set element inline style
export function setStyle(el: HTMLElement, styleObj: Partial<Record<'top' | 'left' | 'width' | 'height', string>>): void {
	for (const key in styleObj) {
		el.style[key as 'top'] = styleObj[key as 'top']!
	}
}

// set css custom properties
export function setProperties(el: HTMLElement, properties: Record<string, string>): void {
	for (const key in properties) {
		el.style.setProperty(key, properties[key])
	}
}

/**
 * run fn once when the transition/animation ends, with a timeout fallback
 * in case the event never fires (e.g. nothing actually changed)
 */
export function onceEnd(
	el: HTMLElement,
	type: 'transitionend' | 'animationend',
	fn: () => void,
	timeout = 600
): void {
	let done = false
	const finish = (event?: Event) => {
		// ignore events bubbled up from children
		if (done || (event && event.target !== el)) return
		done = true
		clearTimeout(timer)
		el.removeEventListener(type, finish)
		fn()
	}
	const timer = setTimeout(finish, timeout)
	el.addEventListener(type, finish)
}
