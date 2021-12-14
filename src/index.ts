
import { getElementRect, getTwoNumberSmall, debounce, preventDefault } from './utils/index'
import runAnimation from './utils/runAnimation'


import { ImgPreviewerOptions } from './type'


// class ImgPreviewer {
//     public config: ImgPreviewerOptions = {};
//     private readonly template = `
//         <div class="preview-header">
//             <div class="nums">
//                 <p>
//                     <span id="current-index"></span>
//                     &nbsp;/&nbsp;
//                     <span id="total-nums"></span>
//                 </p>
//             </div>
//             <div class="tool-btn">
//                 <button id="rotate-left" data-tooltip="向右旋转"><i class="iconfont icon-xuanzhuan"></i></button>
//                 <button id="rotate-right" data-tooltip="向左旋转"><i class="iconfont icon-xuanzhuan1"></i></button>
//                 <button id="reset" data-tooltip="重置"><i class="iconfont icon-zhongzhi"></i></button>
//                 <button id="close" data-tooltip="关闭"><i class="iconfont icon-account-practice-lesson-close"></i></button>
//             </div>
//         </div>
//         <div class="image-container">
//             <button id="prev" data-tooltip="上一张"><i class="iconfont icon-shangyige"></i></button>
//             <div class="img-content" id="image-content"><img id="preview-image" src="" alt="" /></div>
//             <button id="next" data-tooltip="下一张"><i class="iconfont icon-xiayige"></i></button>
//         </div>
//     `
//     constructor(selector: string, options?: ImgPreviewerOptions) {
//         // check use new
//         if (!(this instanceof ImgPreviewer)) {
//             console.warn('ImagePreviewerue is a constructor and should be called with the `new` keyword');
//         }
//         // check required params is correct incoming
//         if (selector && typeof selector === 'string') {
//             if (!document.querySelector(selector)) throw new Error('selector is invalid')
//         } else {
//             throw new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el')
//         }
//         this.config = {}
//         this._init(selector, options)
//     }
//     /**
//      * _init
//      */
//     private _init(selector: string, options?: ImgPreviewerOptions) {
//         // merge options with default options
//         if (options) {
//             options.zoom = Object.assign({}, _DEFAULT.zoom, options.zoom || {})
//             this.config = Object.assign({}, _DEFAULT, options)
//         } else {
//             this.config = _DEFAULT
//         }
//         console.log(this.config);
//         let d1 = Date.now()
//         this.render()
//         console.log(Date.now() - d1);
//     }
//     /**
//      * render
//      */
//     public render() {
//         let previewContainer = document.createElement('div')
//         previewContainer.classList.add('image-preview-container')
//         previewContainer.id = 'image-preview-container'
//         previewContainer.innerHTML = this.template
//         document.body.appendChild(previewContainer)
//         console.log(document.getElementById('image-preview-container'));
//         requestAnimationFrame(() => {
//             console.log(document.getElementById('image-preview-container'));
//         })
//     }
// }

function ImgPreviewer(this: any, selector: string, options?: ImgPreviewerOptions) {
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

    // init methods
    function _init(this: any, selector: string, options?: ImgPreviewerOptions) {
        if (options) {
            options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {})
            config = Object.assign({}, defaultOptions, options)
        } else {
            config = defaultOptions
        }
        console.log(config);
        return
        // console.log(this.config);
        // let d1 = Date.now()
        // this.render()
        // console.log(Date.now() - d1);
    }

    function render() {
        console.log('render');
        // console.log(this);
    }
    ImgPreviewer.prototype.reset = function () {
        console.log(config, options);
    }
    _init(selector, options)
}





export default ImgPreviewer

