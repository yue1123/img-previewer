import type { objectKeyOnlyCss } from '../../type'

export function debounce<T>(fn: (arg: T) => void, delay: number): (arg: T) => void {
	var timer = 0
	return function (arg: T) {
		clearTimeout(timer)
		timer = window.setTimeout(function () {
			fn(arg)
			clearTimeout(timer)
		}, delay)
	}
}

export function preventDefault(e: Event): void {
	e.preventDefault()
}

/**
 * check element is hidden by css
 * @param el check el
 * @param  bubblingLevel The level to look up from the current element 
 * @returns {boolean}
 */
export function isElementHiddenByCss(el: Element | null, bubblingLevel: number): boolean {
	if (!el) return false
	while (bubblingLevel-- && el) {
		const { visibility, height, opacity, width } = getComputedStyle(el)
		if (visibility === 'hidden' || height === '0px' || width === '0px' || opacity === '0') {
			return false
		}
    el = el?.parentElement
	}
	return true
}


/**
 * 判断一个元素是否出现在当前视口中
 * @param el 要判断的元素
 * @returns {boolean}
 */
export function isElementInViewport(el: any, bubblingLevel: number): boolean {
	const rect = getElementRect(el)
	const vWidth = window.innerWidth || document.documentElement.clientWidth
	const vHeight = window.innerHeight || document.documentElement.clientHeight
	// if element display:none or transform:scale(0)
	if (rect.width === 0 || rect.height === 0) {
		return false
	} else if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
		return false
	} else {
		return isElementHiddenByCss(el, bubblingLevel)
	}
}

export function getElementRect(el: Element | null): DOMRect {
	return el!.getBoundingClientRect()
}

/**
 * 获取两数乘以一定比例后,较小的一个
 * @param multiplier1 乘数1
 * @param multiplier2 乘数2
 * @param number1 计算比例数1
 * @param number2 计算比例数2
 * @param ratio 比例
 * @returns 两数中比例值小的一个
 */
export function getTwoNumberSmall(
	multiplier1: number,
	number1: number,
	multiplier2: number,
	number2: number,
	ratio: number
) {
	let a = (multiplier1 * ratio) / number1
	let b = (multiplier2 * ratio) / number2
	return a > b ? b : a
}

// 页面绘制后的下一帧回调
export function nextTick(fn: () => void) {
	requestAnimationFrame(fn)
}

// set element inline style
export function setStyle(
	imgElement: HTMLElement | null,
	styleObj: objectKeyOnlyCss
) {
	for (const key in styleObj) {
		imgElement!.style[key] = styleObj[key]
	}
}
// setProperties
export function setProperties(
	imgElement: HTMLElement | null,
	properties: object
) {
	for (const key in properties) {
		imgElement!.style.setProperty(key, properties[key])
	}
}

// set element data-* attr
export function setDataset(el: HTMLElement, key: string, value: string) {
	if (el.dataset) {
		el.dataset[key] = value
	} else {
		el.setAttribute('data-' + key, value)
	}
}
