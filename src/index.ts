
import { getElementRect, getTwoNumberSmall, debounce, preventDefault } from './utils/index'
import runAnimation from './utils/runAnimation'


import { ImgPreviewerOptions } from './type'


function ImgPreviewer(this: any, selector: string, options?: ImgPreviewerOptions) {
    if (typeof window !== 'object') {
        return;
    }
    // check use new
    if (!(this instanceof ImgPreviewer)) {
        return console.error(new Error('ImagePreviewerue is a constructor and should be called with the `new` keyword'));
    }
    // check required params is correct incoming
    if (selector && typeof selector === 'string') {
        if (!document.querySelector(selector)) return console.error(new Error('selector is invalid'))
    } else {
        return console.error(new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el'))
    }
    let template = `
        <div class="preview-header">
            <div class="nums">
                <p>
                    <span id="current-index"></span>
                    &nbsp;/&nbsp;
                    <span id="total-nums"></span>
                </p>
            </div>
            <div class="tool-btn">
                <button id="rotate-left" data-tooltip="向右旋转"><i class="iconfont icon-xuanzhuan"></i></button>
                <button id="rotate-right" data-tooltip="向左旋转"><i class="iconfont icon-xuanzhuan1"></i></button>
                <button id="reset" data-tooltip="重置"><i class="iconfont icon-zhongzhi"></i></button>
                <button id="close" data-tooltip="关闭"><i class="iconfont icon-account-practice-lesson-close"></i></button>
            </div>
        </div>
        <div class="image-container">
            <button id="prev" data-tooltip="上一张"><i class="iconfont icon-shangyige"></i></button>
            <div class="img-content" id="image-content"><img id="preview-image" src="" alt="" /></div>
            <button id="next" data-tooltip="下一张"><i class="iconfont icon-xiayige"></i></button>
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
    let config = {}
    let previewContainer: HTMLElement | null = null
    const _BODY = document.body || document.getElementsByTagName('body')[0]
    // init methods
    function _init(this: any, selector: string, options?: ImgPreviewerOptions) {
        if (options) {
            options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {})
            config = Object.assign({}, defaultOptions, options)
        } else {
            config = defaultOptions
        }
        // console.log(selector);
        render()
    }

    // 绑定事件
    function bindEvent() {

    }

    // 重置图片
    function reset() {

    }

    // 
    function render() {
        let el: HTMLElement | null = document.getElementById('image-preview-container')
        if (!el) {
            previewContainer = document.createElement('div')
            previewContainer.classList.add('image-preview-container')
            previewContainer.id = 'image-preview-container'
            previewContainer.innerHTML = template
            _BODY.appendChild(previewContainer)
        } else {
            previewContainer = el
        }
    }
    ImgPreviewer.prototype.reset = function () {
        console.log(config, options);
    }
    _init(selector, options)
}





export default ImgPreviewer

