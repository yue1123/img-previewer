/**
 * 防抖函数
 * @export {Funcion}
 * @param {Function} fn 回调函数
 * @param {Number} delay 防抖时间
 * @returns {Function}
 */

export function debounce<T>(fn: (arg: T) => void, delay: number) {
    var timer: number = 0
    return function (arg: T) {
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
export function preventDefault(e: Event) {
    e.preventDefault()
}

// 获取元素是否出现在可视区域
export function isElementInViewport(el: HTMLElement) {
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const offsetTop = el.offsetTop
    const offsetHeight = el.offsetHeight
    const scrollTop = document.documentElement.scrollTop
    const top = offsetTop - scrollTop
    return offsetHeight + offsetTop > scrollTop && top <= viewPortHeight + 100
}

// 获取元素位置
export function getElementRect(el: HTMLElement) {
    return el.getBoundingClientRect()
}


/**
 * 获取两数乘以一定比例后,较小的一个
 * @param multiplicator 乘数
 * @param number1 计算比例数1
 * @param number2 计算比例数2
 * @param ratio 比例
 * @returns 两数中比例值小的一个
 */
export function getTwoNumberSmall(multiplicator: number, number1: number, number2: number, ratio: number) {
    let a = (multiplicator * ratio) / number1
    let b = (multiplicator * ratio) / number2
    return a > b ? b : a
}