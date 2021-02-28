import { debounce, preventDefault } from './js/utils.js'
import runAnimation from './js/runAnimation.js'
// 获取元素是否出现在可视区域
function isElementInView(el) {}
// 获取元素位置
function getElementRect(el) {
	return el.getBoundingClientRect()
}
// 计算放大倍数
function calcScaleNums(width, height, ratio) {
	let scaleX = (windowWidth * ratio) / width
	let scaleY = (windowHeight * ratio) / height
	return scaleX > scaleY ? scaleY : scaleX
}
// 设置图片样式
function setImageBaseStyle(el, width, height, left, top) {
	el.style.cssText = `width:${width}px;height:${height}px;position:fixed; top:${top}px; left:${left}px;`
}
function taggleModel(flag) {
	previewContainer.style.display = flag ? 'block' : 'none'
}
function taggleScrollBar(flag) {
	_BODY.style.overflow = flag ? 'auto' : 'hidden'
}

let _BODY, windowHeight, windowWidth
let previewContainer = null
let imageEl = null
let historyInfo = null
let currentImageScale = 0
let _DEFAULT = {
	ratio: 0.9,
	zoom: {
		min: 0.1,
		max: 5,
		step: 0.1
	},
	opacity: 0.6,
	scrollbar: false
}
class ImagePreviewer {
	constructor(selector, options = {}) {
		this.selector = selector
		this.options = options
		this.config = Object.assign({}, _DEFAULT, options)
		this.index = 0
		this.imageElements = []
		if (selector && typeof selector === 'string') {
			let el = document.querySelector(selector)
			if (!el) {
				throw new Error('selector is invalid')
			}
		} else {
			throw new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el')
		}
		this.init()
	}
	// 绑定事件
	bindEvent() {
		let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent)
		let touchstart = mobile ? 'touchstart' : 'mousedown'
		let touchend = mobile ? 'touchend' : 'mouseup'
		let touchmove = mobile ? 'touchmove' : 'mousemove'
		// TODO: 每张图片绑定点击时间
		this.imageElements.forEach((item, index) => {
			item.addEventListener('click', (e) => {
				// taggleModel(true)
				this.handleOpen(e, index)
				taggleModel(true)
				this.updateIndex(index)
			})
		})
		// 点击关闭
		document.getElementById('close').addEventListener('click', () => {
			this.handleClose()
		})
		// 重置样式
		document.getElementById('reset').addEventListener('click', () => {
			this.handleReset()
		})
		// 上一张
		document.getElementById('prev').addEventListener('click', () => {
			this.prev()
		})
		// 下一张
		document.getElementById('next').addEventListener('click', () => {
			this.next()
		})
		// 蒙版点击关闭
		previewContainer.addEventListener('click', (e) => {
			if (e.target.classList[0] === 'image-container') {
				this.handleClose()
			}
		})
		// 拖动图片
		imageEl.addEventListener(touchstart, function (e) {
			let diffX = e.clientX - imageEl.offsetLeft
			let diffY = e.clientY - imageEl.offsetTop
			this.classList.add('moving')
			this[`on${touchmove}`] = function (e) {
				let moveX = e.clientX - diffX
				let moveY = e.clientY - diffY
				this.style.left = `${moveX}px`
				this.style.top = `${moveY}px`
			}
			this[`on${touchend}`] = function () {
				this.classList.remove('moving')
				this.onmousemove = null
			}
			this.onmouseout = function () {
				this.classList.remove('moving')
				this.onmousemove = null
			}
		})
		// 缩放图片
		imageEl.addEventListener(
			'mousewheel',
			(e) => {
				let { min, max, step } = this.config.zoom
				if (e.wheelDelta > 0 && currentImageScale < max) {
					currentImageScale += step
				} else if (currentImageScale > min) {
					currentImageScale -= step
				}
				imageEl.style.setProperty('--scale', `${currentImageScale.toFixed(2)}`)
			},
			true
		)
		// 旋转图片
		document.getElementById('rotate-right').addEventListener('click', () => {
			this.handelRotateRight()
		})
		document.getElementById('rotate-left').addEventListener('click', () => {
			this.handelRotateLeft()
		})
		// 阻止默认事件
		previewContainer.addEventListener('mousewheel', preventDefault)
		document.ondragstart = preventDefault
		document.ondragend = preventDefault
		// 窗口大小改变
		window.onresize = debounce.bind(
			null,
			() => {
				this.handleClose()
				windowWidth = window.innerWidth
				windowHeight = window.innerHeight
			},
			100
		)()
	}
	// 更新图片列表
	update() {}
	// 重置
	handleReset() {
		imageEl.style.top = `${historyInfo.startY}px`
		imageEl.style.left = `${historyInfo.startX}px`
		imageEl.style.setProperty('--rotate', `${0}deg`)
		imageEl.style.setProperty('--scale', `${historyInfo.scale}`)
	}
	// 打开预览
	handleOpen(e, index) {
		let { ratio } = this.config
		let { imageElements } = this
		let { width, height } = e.target
		let startX = e.clientX - e.offsetX
		let startY = e.clientY - e.offsetY + 1
		currentImageScale = calcScaleNums(width, height, ratio)
		historyInfo = {
			startX: startX,
			startY: startY,
			endX: windowWidth / 2 - width / 2 - startX,
			endY: windowHeight / 2 - height / 2 - startY,
			scale: currentImageScale,
			rotate: 0
		}
		imageEl.src = imageElements[index].src
		setImageBaseStyle(imageEl, width, height, startX, startY)
		setTimeout(() => {
			ImagePreviewer.setImageAnimationParams(historyInfo)
		})
		previewContainer.classList.add('show')
		!this.config.scrollbar && taggleScrollBar(false)
	}
	static setImageAnimationParams(historyInfo) {
		imageEl.style.setProperty('--offsetX', `${historyInfo.endX}px`)
		imageEl.style.setProperty('--offsetY', `${historyInfo.endY + 30}px`)
		imageEl.style.setProperty('--scale', `${historyInfo.scale}`)
		imageEl.style.setProperty('--rotate', `${historyInfo.rotate}deg`)
	}
	// 关闭预览
	handleClose() {
		let { opacity } = this.config
		runAnimation(
			previewContainer,
			{
				start: opacity,
				end: 0,
				step: -0.02,
				style: 'background',
				template: 'rgba(0, 0, 0, $)'
			},
			() => {
				imageEl.style = ''
				imageEl.src = ''
				previewContainer.style.background = ``
				previewContainer.classList.remove('hiding')
				taggleModel(false)
			}
		)
		const { top, left, width, height } = getElementRect(this.imageElements[this.index])
		imageEl.style.cssText = `width:${width}px;height:${height}px;position: fixed; top: ${top}px; left: ${left}px;`
		previewContainer.classList.remove('show')
		previewContainer.classList.add('hiding')
		!this.config.scrollbar && taggleScrollBar(true)
	}
	// 向左旋转
	handelRotateLeft() {
		historyInfo.rotate -= 90
		imageEl.style.setProperty('--rotate', `${historyInfo.rotate}deg`)
	}
	// 向右旋转
	handelRotateRight() {
		historyInfo.rotate += 90
		imageEl.style.setProperty('--rotate', `${historyInfo.rotate}deg`)
	}
	// 上一张
	prev() {
		if (this.index !== 0) {
			this.index -= 1
			//TODO: 更新图片显示
			this.updateIndex(this.index)
			this.useIndexUpdateImage(this.index)
		}
	}

	// 下一张
	next() {
		if (this.index < this.imageElements.length - 1) {
			this.index += 1
			this.updateIndex(this.index)
			this.useIndexUpdateImage(this.index)
		}
	}
	useIndexUpdateImage(index) {
		let { ratio } = this.config
		let { height, width, src } = this.imageElements[index]
		//TODO: 更新图片显示
		imageEl.classList.add('moving')
		setImageBaseStyle(imageEl, width, height, windowWidth / 2 - width / 2, windowHeight / 2 - height / 2)
		historyInfo = {
			endX: 0,
			endY: 0,
			scale: calcScaleNums(width, height, ratio),
			rotate: 0
		}
		imageEl.src = src
		ImagePreviewer.setImageAnimationParams(historyInfo)
		setTimeout(() => {
			imageEl.classList.remove('moving')
		})
	}
	// 更新视图上的索引
	updateIndex(index) {
		this.index = index
		document.getElementById('total-nums').innerText = this.imageElements.length
		document.getElementById('current-index').innerText = index + 1
	}
	// 渲染视图
	render() {
		let template = `<div class="preview-header">
                        <div class="nums">
                            <button id="prev" data-tooltip="上一张"><i class="iconfont icon-shangyige"></i></button>
                            <p>
                                <span id="current-index"></span>
                                /
                                <span id="total-nums"></span>
                            </p>
                            <button id="next" data-tooltip="下一张"><i class="iconfont icon-xiayige"></i></button>
                        </div>
                        <div class="tool-btn">
                            <button id="rotate-left" data-tooltip="向右旋转"><i class="iconfont icon-xuanzhuan"></i></button>
                            <button id="rotate-right" data-tooltip="向左旋转"><i class="iconfont icon-xuanzhuan1"></i></button>
                            <button id="reset" data-tooltip="重置"><i class="iconfont icon-zhongzhi"></i></button>
                            <button id="close" data-tooltip="关闭"><i class="iconfont icon-account-practice-lesson-close"></i></button>
                        </div>
                    </div>
                    <div class="image-container">
                        <div class="img-content" id="image-content"><img id="preview-image" src="" alt="" /></div>
                    </div>`
		let el = document.getElementById('image-preview-container')
		if (!el) {
			previewContainer = document.createElement('div')
			previewContainer.classList.add('image-preview-container')
			previewContainer.id = 'image-preview-container'
			previewContainer.innerHTML = template
			_BODY.appendChild(previewContainer)
		} else {
			previewContainer = el
		}
		imageEl = document.getElementById('preview-image')
	}
	// 初始化
	init() {
		_BODY = (document && document.body) || document.getElementsByTagName('body')[0]
		windowWidth = window.innerWidth
		windowHeight = window.innerHeight
		this.imageElements = document.querySelectorAll(`${this.selector} img`)
		for (let i = 0, len = this.imageElements.length; i < len; i++) {
			this.imageElements[i].classList.add('zoom-in')
		}
		this.render()
		this.updateIndex(this.index)
		this.bindEvent(this.imageElements)
	}
}
export default ImagePreviewer
