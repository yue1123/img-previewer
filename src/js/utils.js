/**
 * 防抖函数
 * @export {Funcion}
 * @param {Function} fn 回调函数
 * @param {Number} delay 防抖时间
 * @returns {Function}
 */

export function debounce(fn, delay) {
	var timer = null
	return function (arg) {
		clearTimeout(timer)
		timer = setTimeout(function () {
			fn(arg)
			clearTimeout(timer)
		}, delay)
	}
}

/**
 * 阻止默认事件
 * @param {Object} e
 */
export function preventDefault(e) {
	e.preventDefault()
}
