import { getElementRect, getTwoNumberSmall, debounce, preventDefault, nextTick } from './utils/index'

import { ImgPreviewerOptions, runtimeStore } from './type'

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
	let template = `
        <div class="img-pre__header img-pre__animated">
            <div class="img-pre__nums">
                <p>
                    <span id="img-pre__current-index"></span>
                    <span class="img-pre__nums-delimiter">-</span>
                    <span id="img-pre__total-index"></span>
                </p>
            </div>
            <div class="img-pre__bottons">
                <button class="img-pre__button-item" data-tooltip="{{RESET}}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-view-list" viewBox="0 0 16 16" > <path d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z" /> </svg>
                </button>
                <button class="img-pre__button-item" data-tooltip="{{ROTATE_LEFT}}">
                    <svg t="1639647288997" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1423" width="16" height="16" > <path d="M725.996 383.57H74.558A74.782 74.782 0 0 0 0 458.126v491.315A74.782 74.782 0 0 0 74.558 1024h651.438a74.782 74.782 0 0 0 74.558-74.558V458.127a74.782 74.782 0 0 0-74.558-74.558z m10.528 565.872a10.816 10.816 0 0 1-10.528 10.528H74.558a10.816 10.816 0 0 1-10.528-10.528V458.127c0-5.6 4.928-10.528 10.528-10.528h651.438c5.6 0 10.528 4.928 10.528 10.528v491.315z" p-id="1424" fill="#ffffff" ></path> <path d="M1023.94 533.165C986.117 355.73 849.93 202.038 668.558 132.088a592.112 592.112 0 0 0-234.33-39.551l36.511-38.463A32 32 0 1 0 424.341 9.98l-96.094 101.15a32 32 0 0 0 1.184 45.278l96.062 90.974a31.935 31.935 0 0 0 45.246-1.248 32 32 0 0 0-1.216-45.279l-46.75-44.319a529.17 529.17 0 0 1 222.746 35.231c161.403 62.239 282.392 198.139 315.703 354.647a32.063 32.063 0 0 0 62.718-13.248z" p-id="1425" fill="#ffffff" ></path> </svg>
                </button>
                <button class="img-pre__button-item" data-tooltip="{{ROTATE_RIGHT}}">
                    <svg t="1639647310917" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1652" width="16" height="16" > <path d="M0.69753 525.673495a31.720891 31.720891 0 0 0 25.581364 37.860419 32.744146 32.744146 0 0 0 38.372045-23.534855 502.929616 502.929616 0 0 1 320.790305-350.464687A557.673735 557.673735 0 0 1 611.580501 154.23209l-48.092964 44.511573a28.1395 28.1395 0 0 0-10.232546 21.999973 31.209264 31.209264 0 0 0 8.697664 22.511601 33.255773 33.255773 0 0 0 46.046455 0L706.231548 154.23209a32.744146 32.744146 0 0 0 10.232546-21.999973 31.720891 31.720891 0 0 0-9.209291-22.5116L609.533992 10.464824a33.255773 33.255773 0 0 0-31.209264-9.720918 32.232519 32.232519 0 0 0-23.534855 21.488346A31.209264 31.209264 0 0 0 563.487537 51.906634l37.348791 37.860419a626.743417 626.743417 0 0 0-237.906685 38.883673 566.883026 566.883026 0 0 0-358.139095 394.97626z m269.115949 420.045996a11.767427 11.767427 0 0 0 10.744172 10.744173h665.115464a10.744173 10.744173 0 0 0 10.744173-10.744173V435.627094a10.744173 10.744173 0 0 0-10.744173-10.744173h-665.115464a11.2558 11.2558 0 0 0-10.744172 10.744173v511.627279zM281.069279 358.883002h665.115463A77.255719 77.255719 0 0 1 1023.952089 435.627094v511.627279a76.744092 76.744092 0 0 1-77.25572 76.744092h-665.115463A76.744092 76.744092 0 0 1 205.348441 945.719491V435.627094A77.255719 77.255719 0 0 1 281.069279 358.883002z" p-id="1653" fill="#ffffff" ></path> </svg>
                </button>
                <button class="img-pre__button-item" data-tooltip="{{CLOSE}}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16" > <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z" /> <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z" /> </svg>
                </button>
            </div>
        </div>
        <div class="img-pre__contet-warpper" id="J_content-warpper" style="--index: 0">
            <div class="img-pre__img-item img-pre__animated current-index" id="J_current-index">
                <img src="" />
            </div>
        </div>`

	const defaultOptions = {
		ratio: 0.7,
		zoom: {
			min: 0.1,
			max: 5,
			step: 0.1
		},
		opacity: 0.6,
		scrollbar: false
	}
	let mergeOptions: ImgPreviewerOptions
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
		imgEls: undefined,
		index: 0
	}
	const _BODY = document.body || document.getElementsByTagName('body')[0]

	// 绑定事件
	function bindEvent() {
		let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent)
		let touchstart = mobile ? 'touchstart' : 'mousedown'
		let touchend = mobile ? 'touchend' : 'mouseup'
		let touchmove = mobile ? 'touchmove' : 'mousemove'
		const { rootEl } = store
		rootEl?.addEventListener('click', (e: any) => {
			if (e.target.localName === 'img') {
				document.querySelector('#J_current-index img')!.src = e.target.src
				handlePrviewershow()
			}
		})
	}
	// show
	function handlePrviewershow() {
		previewerContainer!.style.display = 'block'
		nextTick(() => {
			previewerContainer!.classList.add('show')
			// previewerContainer.classList.add('hide')
		})
	}
	// hide
	function handlePrviewerHide() {}
	// listen index change,and update view
	function onIndexChange(index: number) {
		console.log(index)
	}
	// 重置图片
	function reset() {}
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
	function defineReactValue(store: object, key: string, value: any, cal: (newVal: any) => void) {
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
	function render() {
		let el: HTMLElement | null = document.getElementById('image-preview-container')
		if (!el) {
			previewerContainer = document.createElement('div')
			previewerContainer.classList.add('img-pre__container', 'img-pre__animated')
			previewerContainer.id = 'J_container'
			previewerContainer.style.setProperty('--container-opcity', '1')
			previewerContainer.style.setProperty('--header-bg-opcity', '0.2')
			previewerContainer.style.setProperty('--container-zIndex', '99')
			previewerContainer.innerHTML = i18nTranslate(template, geti18nInfo())
			_BODY.appendChild(previewerContainer)
		} else {
			previewerContainer = el
		}
	}
	function _init(this: any, selector: string, options?: ImgPreviewerOptions) {
		if (options) {
			options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {})
			mergeOptions = Object.assign({}, defaultOptions, options)
		} else {
			mergeOptions = defaultOptions
		}

		store.rootEl = document.querySelector(selector)
		store.imgEls = store.rootEl?.querySelectorAll<HTMLElement>('img:not(.img-pre__img-item img)')
		// use defineProperty to init listen index
		defineReactValue(store, 'index', 0, onIndexChange)
		render()
		bindEvent()
	}
	ImgPreviewer.prototype.reset = function () {
		console.log(mergeOptions, options)
	}
	_init(selector, options)
}

export default ImgPreviewer
