/**
 * {
 *   start:10,
 *   end:10,
 *   step:1,
 *   style:'font-size'
 *   template:'$px'
 * }
 */

export default function runAnimation(el, options, callback) {
	var requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
	var start = options.start || 0
	var end = options.end || 0
	var step = options.step
	var playing = null

	function running() {
		if ((step > 0 && start < end) || (step < 0 && start > end)) {
			start += step
			el.style[options.style] = options.template.replace('$', start)
			playing = requestAnimationFrame(running)
		} else {
			callback && callback()
			cancelAnimationFrame(playing)
		}
	}

	running()
}
