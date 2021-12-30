import {
    getElementRect,
    isElementInViewport,
    getTwoNumberSmall,
    debounce,
    preventDefault,
    nextTick,
    setStyle,
    setProperties,
    setDataset
} from './utils'
// style sheet
import './index.scss'
// runtime store init function
import createStore from './store'
// i18n language config
import i18n from './i18n/index'
// html template
import template from './template'
// type
import type { ImgPreviewerOptions } from './type'

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
        if (!document.querySelector(selector)) return console.error(new Error('selector ' + selector + ' is invalid'))
    } else {
        return console.error(
            new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el')
        )
    }

    const defaultOptions = {
        fillRatio: 0.8,
        imageZoom: {
            min: 1,
            max: 5,
            step: 0.1
        },
        style: {
            modalOpacity: 0.6,
            headerOpacity: 0,
            zIndex: 99
        },
        dataUrlKey: 'src'
    }
    let mergeOptions: any
    let previewerContainer: HTMLElement | null = null
    // const i18n =
    const store = createStore()
    let isOpen: boolean = false
    let isRunning: boolean = false
    // FIXME: 储存到store中去
    let moveable: boolean = false
    // 绑定事件
    function bindEvent(rootEl: HTMLElement | null) {
        let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent)
        const warpper = document.getElementById('J_content-warpper')
        // add click eventlistener for rootEl, proxy img click event
        rootEl?.addEventListener(
            'click',
            (event: any) => {
                const target: HTMLImageElement = event.target
                if (target === store.currentImgElement) return
                if (target.localName === 'img') {
                    store.currentClickEl = target
                    store.index = Number(target.dataset.index)
                    handlePrviewershow(event, getImageSrc(store.imgList[store.index]))
                }
            },
            false
        )

        // all buttons event proxy linstener
        document.getElementById('J_header-buttons')!.addEventListener('click', (event: any) => {
            // fixed mobile Safari and chrome e.path undefined
            const _event = window.event || event
            const path: HTMLElement[] = _event.path || (_event.composedPath && _event.composedPath())
            const buttonEl: HTMLButtonElement = path.find(
                (item: HTMLElement) => item.localName === 'button'
            ) as HTMLButtonElement
            if (buttonEl && !buttonEl.disabled) {
                handleActionFn(buttonEl.dataset.action as string)
            }
        })

        // hot keyboard event listener
        document.addEventListener('keyup', ({ key }: KeyboardEvent) => handleActionFn(key))

        // mouse wheel to zoom and zoom out image
        warpper?.addEventListener('wheel', (event: any) => {
            preventDefault(event)
            if (event.target.localName !== 'img') return
            moveable = true
            let { min, max, step } = mergeOptions.imageZoom
            let _max = store._scale + max
            if (event.wheelDelta > 0) {
                // zoom
                const scale = step + store.scale
                store.scale = scale > _max ? _max : scale
            } else {
                // zoom out
                const scale = store.scale - step
                store.scale = scale < min ? min : scale
            }
            store.currentImgElement!.style.setProperty('--scale', `${store.scale.toFixed(2)}`)
        })

        // click modal hide preview
        warpper?.addEventListener('click', (event) => {
            if (event.target === document.getElementById('J_current-index')) {
                handleActionFn('close')
            }
        })
        //
        if (mobile) {
            enableMobileScale(warpper)
            let lastTouchEnd = 0
            document.documentElement.addEventListener(
                'touchend',
                function (event) {
                    let now = Date.now()
                    if (now - lastTouchEnd <= 300) {
                        event.preventDefault()
                    }
                    lastTouchEnd = now
                },
                false
            )
        }
        warpper?.addEventListener('mousedown', (e: any) => {
            if (e.target.localName !== 'img' || !moveable) return
            let diffX = e.clientX - e.target!.offsetLeft
            let diffY = e.clientY - e.target!.offsetTop
            e.preventDefault()
            store.currentImgElement!.classList.add('moving')
            warpper['onmousemove'] = function (e: any) {
                let moveX = e.clientX - diffX
                let moveY = e.clientY - diffY
                setStyle(store.currentImgElement, {
                    top: `${moveY}px`,
                    left: `${moveX}px`
                })
            }
            warpper['onmouseup'] = function () {
                this.onmousemove = null
                store.currentImgElement!.classList.remove('moving')
            }
            warpper['onmouseout'] = function () {
                this.onmousemove = null
                store.currentImgElement!.classList.remove('moving')
            }
        })

        const handleResize = debounce(() => {
            isOpen && setImageStyles(window.innerWidth, window.innerHeight, false)
        }, 100)
        window.addEventListener('resize', handleResize)
    }
    // distribute processing function by antionType
    function handleActionFn(actionType: string) {
        switch (actionType) {
            case 'close':
            case 'Escape':
                handlePrviewerHide()
                break
            case 'rotateLeft':
                handleRotateLeft()
                break
            case 'rotateRight':
                handleRotateRight()
                break
            case 'reset':
                handleReset()
                break
            case 'next':
            case 'ArrowRight':
                handleNext()
                break
            case 'prev':
            case 'ArrowLeft':
                handlePrev()
                break
            default:
                break
        }
    }

    function setImageStyles(w: number, h: number, setRotate: boolean) {
        store.endX = w / 2 - store.width / 2 - store.startX
        store.endY = h / 2 - store.height / 2 - store.startY
        store.scale = store._scale = getTwoNumberSmall(
            w,
            store.width,
            h,
            store.height,
            mergeOptions.fillRatio || defaultOptions.fillRatio
        )
        if (setRotate) {
            store.rotate = 0
            setProperties(store.currentImgElement, {
                '--rotate': `0`
            })
        }
        setStyle(store.currentImgElement, {
            top: `${store.startY}px`,
            left: `${store.startX - 1}px`,
            width: `${store.width}px`,
            height: `${store.height}px`
        })
        setProperties(store.currentImgElement, {
            '--offsetX': `${store.endX}px`,
            '--offsetY': `${store.endY}px`,
            '--scale': `${store.scale}`
        })
    }

    // mobile enable two finger scale
    function enableMobileScale(warpper: any) {
        let _store: any = {
            scale: 1
        }
        warpper?.addEventListener('touchstart', function (event: any) {
            if (event.target.localName !== 'img') return
            event.preventDefault()
            let touches = event.touches
            let events = touches[0]
            let events2 = touches[1]

            // 第一个触摸点的坐标
            _store.pageX = events.pageX
            _store.pageY = events.pageY

            _store.moveable = true

            if (events2) {
                _store.pageX2 = events2.pageX
                _store.pageY2 = events2.pageY
            }

            _store.originScale = _store.scale || 1
        })
        document.addEventListener('touchmove', function (event) {
            if (!_store.moveable) return
            event.preventDefault()
            store.currentImgElement!.classList.add('moving')
            let touches = event.touches
            let events = touches[0]
            let events2 = touches[1]
            // two finger move
            if (events2) {
                // 第2个指头坐标在touchmove时候获取
                if (!_store.pageX2) {
                    _store.pageX2 = events2.pageX
                }
                if (!_store.pageY2) {
                    _store.pageY2 = events2.pageY
                }

                // 获取坐标之间的距离
                let getDistance = function (start: any, stop: any) {
                    return Math.hypot(stop.x - start.x, stop.y - start.y)
                }
                // 双指缩放比例计算
                let zoom =
                    getDistance(
                        {
                            x: events.pageX,
                            y: events.pageY
                        },
                        {
                            x: events2.pageX,
                            y: events2.pageY
                        }
                    ) /
                    getDistance(
                        {
                            x: _store.pageX,
                            y: _store.pageY
                        },
                        {
                            x: _store.pageX2,
                            y: _store.pageY2
                        }
                    )
                // 应用在元素上的缩放比例
                let newScale = _store.originScale * zoom
                // 最大缩放比例限制
                if (newScale > mergeOptions.zoom.max) {
                    newScale = mergeOptions.zoom.max
                }
                // 记住使用的缩放值
                _store.scale = newScale
                // 图像应用缩放效果
                store.currentImgElement!.style.setProperty('--scale', `${newScale.toFixed(2)}`)
            }
        })

        document.addEventListener('touchend', function () {
            _store.moveable = false
            store.currentImgElement!.classList.remove('moving')
            delete _store.pageX2
            delete _store.pageY2
        })
        document.addEventListener('touchcancel', function () {
            _store.moveable = false
            store.currentImgElement!.classList.remove('moving')
            delete _store.pageX2
            delete _store.pageY2
        })
    }
    function handleReset() {
        moveable = false
        setImageStyles(window.innerWidth, window.innerHeight, true)
    }
    function getImageSrc(el: HTMLImageElement): string {
        return mergeOptions.dataUrlKey && el.getAttribute(mergeOptions.dataUrlKey) || el.src
    }
    function handleNext() {
        if (store.index === store.totalIndex - 1 || isRunning) return
        isRunning = true
        const index: number = store.index + 1
        const div: HTMLDivElement = document.createElement<'div'>('div')
        const warpper: HTMLElement | null = document.getElementById('J_content-warpper')
        const img: HTMLImageElement = document.createElement<'img'>('img')
        const currentImgWarpper: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#J_current-index')
        const clickEl = store.imgList[index]
        const src = getImageSrc(clickEl)

        img.src = src

        // cache data
        store.index = index
        store.width = clickEl.width
        store.height = clickEl.height
        store.currentImgElement = img
        //
        setImageStyles(window.innerWidth, window.innerHeight, true)
        div.appendChild(img)
        div.classList.add('img-pre__img-item', 'slide-left-in')
        listenImageLoading(div, src)
        warpper!.appendChild(div)

        currentImgWarpper!.classList.add('slide-left-out')
        currentImgWarpper!.addEventListener('animationend', () => {
            isRunning = false
            currentImgWarpper && warpper!.removeChild(currentImgWarpper as Node)
        })

        // listen animationend and remove prev el
        div.addEventListener(
            'animationend',
            () => {
                div.classList.remove('slide-left-in')
                div.classList.add('current-index')
                div.id = 'J_current-index'
                store.currentClickEl = clickEl
            },
            {
                once: true
            }
        )
    }
    function handlePrev() {
        if (store.index === 0 || isRunning) return
        isRunning = true
        const index = store.index - 1
        const div: HTMLDivElement = document.createElement<'div'>('div')
        const img: HTMLImageElement = document.createElement<'img'>('img')
        const warpper = document.getElementById('J_content-warpper')
        const currentImgWarpper: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#J_current-index')
        const clickEl = store.imgList[index]
        const src = getImageSrc(clickEl)
        img.src = src
        // cache data
        store.index = index
        store.width = clickEl.width
        store.height = clickEl.height
        store.currentImgElement = img
        //
        setImageStyles(window.innerWidth, window.innerHeight, true)
        div.appendChild(img)
        div.classList.add('img-pre__img-item', 'slide-right-in')
        listenImageLoading(div, src)
        warpper!.appendChild(div)

        currentImgWarpper!.classList.add('slide-right-out')
        currentImgWarpper!.addEventListener('animationend', () => {
            isRunning = false
            currentImgWarpper && warpper!.removeChild(currentImgWarpper as Node)
        })

        // listen animationend and remove next el
        div.addEventListener(
            'animationend',
            () => {
                div.classList.remove('slide-right-in')
                div.classList.add('current-index')
                div.id = 'J_current-index'

                store.currentClickEl = clickEl
            },
            {
                once: true
            }
        )
    }
    // listen image load
    function listenImageLoading(el: any, src: string,): void {
        let image: HTMLImageElement | null = new Image()
        image.src = src
        let timer = setTimeout(() => {
            el?.classList.add('loading')
        }, 32);

        image.onload = () => {
            timer && clearTimeout(timer)
            // manually reclaim memory
            image = null
            document.getElementById('J_current-index')?.classList.remove('loading')
        }
    }
    // show
    function handlePrviewershow(e: any, src: string): void {
        isOpen = true
        previewerContainer!.style.display = 'block'
        document.ondragstart = preventDefault
        document.ondragend = preventDefault
        listenImageLoading(document.getElementById('J_current-index'), src)
        const { width, height, x, y } = getElementRect(e.target)
        nextTick(() => {
            store.currentImgElement!.src = src
            previewerContainer!.classList.remove('hide', 'fadeout')
            previewerContainer!.classList.add('show')
            store.width = width
            store.height = height
            store.startX = x
            store.startY = y
            setImageStyles(window.innerWidth, window.innerHeight, true)
        })

    }
    // hide
    function handlePrviewerHide(): void {
        isOpen = false
        moveable = false
        document.ondragstart = null
        document.ondragend = null
        //  current click image el is in viewport
        if (isElementInViewport(store.currentClickEl)) {
            const { top, left, width, height } = getElementRect(store.currentClickEl)
            previewerContainer!.classList.remove('show')
            previewerContainer!.classList.add('hide')
            store.currentImgElement!.style.cssText = `width:${width}px;height:${height}px;position: fixed; top: ${top}px; left: ${left}px;`
            store.currentImgElement!.addEventListener(
                'transitionend',
                () => {
                    previewerContainer!.style.display = 'none'
                    store.currentImgElement!.src = ''
                    store.currentImgElement!.style.cssText = ``
                },
                { once: true }
            )
        } else {
            previewerContainer!.classList.remove('show')
            previewerContainer!.classList.add('hide')
            store.currentImgElement!.classList.add('img-pre__animated')
            store.currentImgElement!.addEventListener(
                'animationend',
                () => {
                    previewerContainer!.style.display = 'none'
                    store.currentImgElement!.src = ''
                    store.currentImgElement!.style.cssText = ``
                    store.currentImgElement!.classList.remove('img-pre__animated')
                },
                { once: true }
            )
        }
    }

    function handleRotateLeft(): void {
        store.rotate -= 90
        setProperties(store.currentImgElement, {
            '--rotate': `${store.rotate}deg`
        })
    }

    function handleRotateRight(): void {
        store.rotate += 90
        setProperties(store.currentImgElement, {
            '--rotate': `${store.rotate}deg`
        })
    }

    // listen index change,and update view
    function onIndexChange(index: number): void {
        document.getElementById('img-pre__current-index')!.innerText = String(index + 1)
        let prevButton = document.getElementById('J-img-pre__prev') as HTMLButtonElement
        let nextButton = document.getElementById('J-img-pre__next') as HTMLButtonElement
        if (index === 0) {
            prevButton.disabled = true
        } else {
            prevButton.disabled = false
        }
        if (index === store.totalIndex - 1) {
            nextButton.disabled = true
        } else {
            nextButton.disabled = false
        }
    }

    function onTotalIndexChange(index: number): void {
        document.getElementById('img-pre__total-index')!.innerText = String(index)
    }

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
        return template.replace(/\{\{(.*?)\}\}/g, (_, a: string) => i18nObj[a])
    }
    //
    function defineReactValue(store: object, key: string, value: any, cal: (newVal: any) => void): void {
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
    function render(): void {
        let el: HTMLElement | null = document.getElementById('image-preview-container')
        const { modalOpacity,
            headerOpacity,
            zIndex } = mergeOptions.style
        if (!el) {
            previewerContainer = document.createElement('div')
            previewerContainer.classList.add('img-pre__container', 'img-pre__animated')
            previewerContainer.id = 'J_container'
            previewerContainer.style.setProperty('--container-opcity', String(modalOpacity))
            previewerContainer.style.setProperty('--header-bg-opcity', String(headerOpacity))
            previewerContainer.style.setProperty('--container-zIndex', String(zIndex))
            previewerContainer.innerHTML = i18nTranslate(template, geti18nInfo())
            document.body.appendChild(previewerContainer)
        } else {
            previewerContainer = el
        }
    }
    function _init(this: any, selector: string, options?: ImgPreviewerOptions): void {
        if (options) {
            options.imageZoom = Object.assign({}, defaultOptions.imageZoom, options.imageZoom || {})
            options.style = Object.assign({}, defaultOptions.style, options.style || {})
            mergeOptions = Object.assign({}, defaultOptions, options)
        } else {
            mergeOptions = defaultOptions
        }
        const rootEl: HTMLElement | null = document.querySelector(selector)

        // use defineProperty to init listen index
        defineReactValue(store, 'index', 0, onIndexChange)
        defineReactValue(store, 'totalIndex', 0, onTotalIndexChange)
        // render to document
        render()
        // bind enent for el
        bindEvent(rootEl)
        // cache data
        store.currentImgElement = document.querySelector('#J_current-index img')
        store.rootEl = rootEl
        //
        initImgList()
    }
    // get selector all img children to init totalIndex and store these
    function initImgList() {
        const imgEls = store.rootEl!.querySelectorAll<HTMLImageElement>('img')
        store.totalIndex = imgEls!.length
        store.imgList = new Array(store.totalIndex)
        for (let i = 0, len = store.totalIndex; i < len; i++) {
            let element = imgEls![i]
            setDataset(element, 'index', String(i))
            store.imgList[i] = element
        }
    }

    _init(selector, options)
    ImgPreviewer.prototype.update = initImgList
    ImgPreviewer.prototype.version = '2.0.0'
}

export default ImgPreviewer
