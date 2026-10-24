/*!
 * ImgPreviewer v2.1.7
 * https://github.com/yue1123/img-previewer
 *
 * Copyright 2021-present dh
 * Released under the MIT license
 */
function debounce(fn, delay) {
    var timer = 0;
    return function (arg) {
        clearTimeout(timer);
        timer = window.setTimeout(function () { return fn(arg); }, delay);
    };
}
function preventDefault(e) {
    e.preventDefault();
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * check element is not hidden by css
 * @param el check el
 * @param bubblingLevel The level to look up from the current element
 * @returns {boolean}
 */
function isElementVisibleByCss(el, bubblingLevel) {
    while (bubblingLevel-- && el) {
        var _a = getComputedStyle(el), visibility = _a.visibility, height = _a.height, opacity = _a.opacity, width = _a.width;
        if (visibility === 'hidden' || height === '0px' || width === '0px' || opacity === '0') {
            return false;
        }
        el = el.parentElement;
    }
    return true;
}
/**
 * 判断一个元素是否出现在当前视口中
 * @param el 要判断的元素
 * @returns {boolean}
 */
function isElementInViewport(el, bubblingLevel) {
    if (!el || !el.isConnected)
        return false;
    var rect = el.getBoundingClientRect();
    var vWidth = window.innerWidth || document.documentElement.clientWidth;
    var vHeight = window.innerHeight || document.documentElement.clientHeight;
    // if element display:none or transform:scale(0)
    if (rect.width === 0 || rect.height === 0) {
        return false;
    }
    else if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
        return false;
    }
    else {
        return isElementVisibleByCss(el, bubblingLevel);
    }
}
/**
 * 计算让 (width, height) 以 ratio 比例填充 (containerWidth, containerHeight) 的缩放值
 */
function getFitScale(containerWidth, width, containerHeight, height, ratio) {
    return Math.min((containerWidth * ratio) / width, (containerHeight * ratio) / height);
}
// 页面绘制后的下一帧回调
function nextTick(fn) {
    requestAnimationFrame(fn);
}
// set element inline style
function setStyle(el, styleObj) {
    for (var key in styleObj) {
        el.style[key] = styleObj[key];
    }
}
// set css custom properties
function setProperties(el, properties) {
    for (var key in properties) {
        el.style.setProperty(key, properties[key]);
    }
}
/**
 * run fn once when the transition/animation ends, with a timeout fallback
 * in case the event never fires (e.g. nothing actually changed)
 */
function onceEnd(el, type, fn, timeout) {
    if (timeout === void 0) { timeout = 600; }
    var done = false;
    var finish = function (event) {
        // ignore events bubbled up from children
        if (done || (event && event.target !== el))
            return;
        done = true;
        clearTimeout(timer);
        el.removeEventListener(type, finish);
        fn();
    };
    var timer = setTimeout(finish, timeout);
    el.addEventListener(type, finish);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var en = {
    RESET: 'reset',
    ROTATE_LEFT: 'rotate left',
    ROTATE_RIGHT: 'rotate right',
    CLOSE: 'close',
    NEXT: 'next',
    PREV: 'prev',
    ZOOM_IN: 'zoom in',
    ZOOM_OUT: 'zoom out'
};

var zh_cn = {
    RESET: '重置',
    ROTATE_LEFT: '向左旋转',
    ROTATE_RIGHT: '向右旋转',
    CLOSE: '关闭',
    NEXT: '下一张',
    PREV: '上一张',
    ZOOM_IN: '放大',
    ZOOM_OUT: '缩小'
};

// all display in English except Chinese, user texts override the built-in ones
function getLocale(custom) {
    var locale = /^zh/i.test(window.navigator.language) ? zh_cn : en;
    return __assign(__assign({}, locale), custom);
}

// icons from Tabler Icons (MIT), https://tabler.io/icons
var icon = function (paths) {
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">".concat(paths, "</svg>");
};
var icons = {
    zoomIn: icon('<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M7 10l6 0"/><path d="M10 7l0 6"/><path d="M21 21l-6 -6"/>'),
    zoomOut: icon('<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M7 10l6 0"/><path d="M21 21l-6 -6"/>'),
    reset: icon('<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>'),
    rotateLeft: icon('<path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5"/>'),
    rotateRight: icon('<path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5"/>'),
    close: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
    prev: icon('<path d="M15 6l-6 6l6 6"/>'),
    next: icon('<path d="M9 6l6 6l-6 6"/>')
};
var button = function (action, label, className) {
    if (className === void 0) { className = 'img-pre__button-item'; }
    return "<button type=\"button\" class=\"".concat(className, "\" data-action=\"").concat(action, "\" data-tooltip=\"{{").concat(label, "}}\" aria-label=\"{{").concat(label, "}}\">").concat(icons[action], "</button>");
};
var divider = '<span class="img-pre__divider" aria-hidden="true"></span>';
var template = "\n\t<div class=\"img-pre__header img-pre__animated\">\n\t\t<div class=\"img-pre__nums\" aria-live=\"polite\">\n\t\t\t<span class=\"img-pre__current-index\"></span>\n\t\t\t<span class=\"img-pre__nums-delimiter\">/</span>\n\t\t\t<span class=\"img-pre__total-index\"></span>\n\t\t</div>\n\t\t<div class=\"img-pre__buttons\">\n\t\t\t".concat(button('zoomOut', 'ZOOM_OUT'), "\n\t\t\t").concat(button('zoomIn', 'ZOOM_IN'), "\n\t\t\t").concat(divider, "\n\t\t\t").concat(button('rotateLeft', 'ROTATE_LEFT'), "\n\t\t\t").concat(button('rotateRight', 'ROTATE_RIGHT'), "\n\t\t\t").concat(divider, "\n\t\t\t").concat(button('reset', 'RESET'), "\n\t\t\t").concat(button('close', 'CLOSE'), "\n\t\t</div>\n\t</div>\n\t").concat(button('prev', 'PREV', 'img-pre__nav img-pre__prev img-pre__animated'), "\n\t").concat(button('next', 'NEXT', 'img-pre__nav img-pre__next img-pre__animated'), "\n\t<div class=\"img-pre__content-wrapper\">\n\t\t<div class=\"img-pre__img-item img-pre__animated current-index\">\n\t\t\t<img alt=\"\" />\n\t\t</div>\n\t</div>");
// fill {{KEY}} placeholders with i18n text
function renderTemplate(i18n) {
    return template.replace(/{{(.*?)}}/g, function (_, key) { return i18n[key]; });
}

var defaultOptions = {
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
    triggerEvent: 'click',
    dataUrlKey: 'src',
    bubblingLevel: 0,
    hideOriginal: false
};
// merge user options with defaults, never mutates the user's object
function resolveOptions(options) {
    if (options === void 0) { options = {}; }
    return __assign(__assign(__assign({}, defaultOptions), options), { fillRatio: options.fillRatio || defaultOptions.fillRatio, imageZoom: __assign(__assign({}, defaultOptions.imageZoom), options.imageZoom), style: __assign(__assign({}, defaultOptions.style), options.style) });
}

var ImgPreviewer = /** @class */ (function () {
    function ImgPreviewer(selector, options) {
        this.version = ImgPreviewer.version;
        this.imgList = [];
        this.index = 0;
        this.currentClickEl = null;
        // original image hidden by `hideOriginal`, and its inline visibility to restore
        this.hiddenEl = null;
        this.hiddenElVisibility = '';
        // image rect when preview opened
        this.width = 0;
        this.height = 0;
        this.startX = 0;
        this.startY = 0;
        this.scale = 1;
        // fitted scale, the base of max zoom
        this.baseScale = 1;
        this.rotate = 0;
        this.isOpen = false;
        // increased on every open, so a stale open animation won't fire onShown
        this.openId = 0;
        this.isAnimating = false;
        // image can be dragged only after zoomed
        this.movable = false;
        this.disposers = [];
        // SSR safe
        if (typeof window !== 'object')
            return;
        if (!selector || typeof selector !== 'string') {
            console.error(new Error('ImgPreviewer plugin should css string selector that on first params,like #el,.el'));
            return;
        }
        var rootEl = document.querySelector(selector);
        if (!rootEl) {
            console.error(new Error('selector ' + selector + ' is invalid'));
            return;
        }
        this.rootEl = rootEl;
        this.options = resolveOptions(options);
        this.render();
        this.bindEvents();
        this.update();
    }
    /** re-collect image elements under the root element */
    ImgPreviewer.prototype.update = function () {
        var _this = this;
        if (!this.rootEl)
            return;
        var imgEls = this.rootEl.querySelectorAll('img');
        // when root is `body`, skip the previewer's own images
        this.imgList = Array.prototype.filter.call(imgEls, function (el) { return !_this.container.contains(el); });
        this.totalIndexEl.textContent = String(this.imgList.length);
        this.setIndex(clamp(this.index, 0, Math.max(this.imgList.length - 1, 0)));
    };
    /** index of the last image */
    ImgPreviewer.prototype.getTotalIndex = function () {
        return this.imgList.length - 1;
    };
    /** show the image at index */
    ImgPreviewer.prototype.show = function (index) {
        var img = this.imgList[index];
        if (!img) {
            throw new Error('invalid index');
        }
        if (this.isOpen) {
            if (index !== this.index)
                this.slideTo(index);
        }
        else {
            this.open(img);
        }
    };
    ImgPreviewer.prototype.next = function () {
        if (!this.isOpen)
            return this.show(0);
        if (this.index < this.imgList.length - 1)
            this.slideTo(this.index + 1);
    };
    ImgPreviewer.prototype.prev = function () {
        if (!this.isOpen)
            return this.show(this.imgList.length - 1);
        if (this.index > 0)
            this.slideTo(this.index - 1);
    };
    /** close the previewer */
    ImgPreviewer.prototype.hide = function () {
        var _this = this;
        if (!this.isOpen)
            return;
        var _a = this.options, onBeforeHide = _a.onBeforeHide, onHide = _a.onHide, onClose = _a.onClose, onHidden = _a.onHidden;
        var context = this.context();
        if ((onBeforeHide === null || onBeforeHide === void 0 ? void 0 : onBeforeHide(context)) === false)
            return;
        this.isOpen = false;
        this.movable = false;
        var _b = this, container = _b.container, currentImg = _b.currentImg;
        var finish = function () {
            // reopened before the animation finished
            if (_this.isOpen)
                return;
            _this.restoreOriginal();
            container.style.display = 'none';
            currentImg.removeAttribute('src');
            currentImg.style.cssText = '';
            currentImg.classList.remove('img-pre__animated');
            onHidden === null || onHidden === void 0 ? void 0 : onHidden(context);
        };
        container.classList.remove('show');
        container.classList.add('hide');
        // the visibility check must see the original image as it really is
        var hiddenEl = this.hiddenEl;
        this.restoreOriginal();
        if (isElementInViewport(this.currentClickEl, this.options.bubblingLevel)) {
            // keep it hidden until the preview image lands on it
            this.hideOriginal(hiddenEl);
            // fly back to the original position
            var _c = this.currentClickEl.getBoundingClientRect(), top_1 = _c.top, left = _c.left, width = _c.width, height = _c.height;
            currentImg.style.cssText = "width:".concat(width, "px;height:").concat(height, "px;position:fixed;top:").concat(top_1, "px;left:").concat(left, "px;");
            onceEnd(currentImg, 'transitionend', finish);
        }
        else {
            // fade out
            currentImg.classList.add('img-pre__animated');
            onceEnd(currentImg, 'animationend', finish);
        }
        onHide === null || onHide === void 0 ? void 0 : onHide(context);
        onClose === null || onClose === void 0 ? void 0 : onClose(context);
    };
    /** remove all listeners and DOM created by this instance */
    ImgPreviewer.prototype.destroy = function () {
        this.isOpen = false;
        this.restoreOriginal();
        this.disposers.forEach(function (dispose) { return dispose(); });
        this.disposers = [];
        this.container && this.container.remove();
        this.imgList = [];
    };
    ImgPreviewer.prototype.render = function () {
        var _a = this.options.style, modalOpacity = _a.modalOpacity, headerOpacity = _a.headerOpacity, zIndex = _a.zIndex;
        var container = document.createElement('div');
        container.classList.add('img-pre__container', 'img-pre__animated');
        setProperties(container, {
            '--container-opacity': String(modalOpacity),
            '--header-bg-opacity': String(headerOpacity),
            '--container-zIndex': String(zIndex)
        });
        container.innerHTML = renderTemplate(getLocale(this.options.i18n));
        document.body.appendChild(container);
        var $ = function (selector) { return container.querySelector(selector); };
        this.container = container;
        this.wrapper = $('.img-pre__content-wrapper');
        this.currentItem = $('.img-pre__img-item');
        this.currentImg = $('.img-pre__img-item img');
        this.currentIndexEl = $('.img-pre__current-index');
        this.totalIndexEl = $('.img-pre__total-index');
        this.prevButton = $('.img-pre__prev');
        this.nextButton = $('.img-pre__next');
    };
    // add listener and remember how to remove it
    ImgPreviewer.prototype.on = function (target, type, listener, options) {
        target.addEventListener(type, listener, options);
        this.disposers.push(function () { return target.removeEventListener(type, listener, options); });
    };
    ImgPreviewer.prototype.bindEvents = function () {
        var _this = this;
        var wrapper = this.wrapper;
        // proxy img click event of root element
        this.on(this.rootEl, this.options.triggerEvent, function (event) {
            var target = event.target;
            if (target.localName !== 'img' || _this.container.contains(target))
                return;
            var index = _this.imgList.indexOf(target);
            if (index === -1) {
                // image added without calling update()
                _this.update();
                index = _this.imgList.indexOf(target);
            }
            index !== -1 && _this.show(index);
        });
        // all buttons event proxy listener
        this.on(this.container, 'click', function (event) {
            var button = event.target.closest('button[data-action]');
            if (button && !button.disabled) {
                _this.handleAction(button.dataset.action);
            }
        });
        // hot keys
        this.on(document, 'keyup', function (event) {
            if (_this.isOpen)
                _this.handleAction(event.key);
        });
        // no native image dragging while previewing
        this.on(document, 'dragstart', function (event) {
            if (_this.isOpen)
                preventDefault(event);
        });
        // click backdrop to close
        this.on(wrapper, 'click', function (event) {
            if (event.target === _this.currentItem)
                _this.hide();
        });
        // mouse wheel to zoom in and zoom out image
        this.on(wrapper, 'wheel', function (event) {
            preventDefault(event);
            if (event.target !== _this.currentImg)
                return;
            var step = _this.options.imageZoom.step;
            _this.zoomTo(_this.scale + (event.deltaY < 0 ? step : -step));
        }, { passive: false });
        this.bindDrag();
        this.bindTouch();
        this.on(window, 'resize', debounce(function () {
            _this.isOpen && _this.layout(false);
        }, 100));
    };
    // drag the zoomed image with mouse
    ImgPreviewer.prototype.bindDrag = function () {
        var _this = this;
        this.on(this.wrapper, 'mousedown', function (event) {
            var img = _this.currentImg;
            if (event.target !== img || !_this.movable)
                return;
            event.preventDefault();
            var diffX = event.clientX - img.offsetLeft;
            var diffY = event.clientY - img.offsetTop;
            img.classList.add('moving');
            var onMove = function (e) {
                setStyle(img, {
                    top: "".concat(e.clientY - diffY, "px"),
                    left: "".concat(e.clientX - diffX, "px")
                });
            };
            var onUp = function () {
                img.classList.remove('moving');
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });
    };
    // two finger pinch to zoom
    ImgPreviewer.prototype.bindTouch = function () {
        var _this = this;
        var pinching = false;
        var startDistance = 0;
        var startScale = 1;
        var lastTouchEnd = 0;
        var distance = function (touches) {
            return Math.hypot(touches[1].pageX - touches[0].pageX, touches[1].pageY - touches[0].pageY);
        };
        var stop = function () {
            pinching = false;
            _this.currentImg.classList.remove('moving');
        };
        this.on(this.wrapper, 'touchstart', function (event) {
            if (event.target !== _this.currentImg)
                return;
            event.preventDefault();
            pinching = true;
            startDistance = event.touches.length > 1 ? distance(event.touches) : 0;
            startScale = _this.scale;
        }, { passive: false });
        this.on(this.container, 'touchmove', function (event) {
            if (!pinching)
                return;
            event.preventDefault();
            if (event.touches.length < 2)
                return;
            // the second finger may land after touchstart
            if (!startDistance) {
                startDistance = distance(event.touches);
                return;
            }
            _this.currentImg.classList.add('moving');
            _this.setScale((startScale * distance(event.touches)) / startDistance);
        }, { passive: false });
        // touches while previewing all happen on the full screen container
        this.on(this.container, 'touchend', function (event) {
            stop();
            // prevent double tap zoom while previewing
            if (!_this.isOpen)
                return;
            var now = Date.now();
            if (now - lastTouchEnd <= 300)
                event.preventDefault();
            lastTouchEnd = now;
        });
        this.on(this.container, 'touchcancel', stop);
    };
    // distribute processing function by action type
    ImgPreviewer.prototype.handleAction = function (action) {
        switch (action) {
            case 'close':
            case 'Escape':
                this.hide();
                break;
            case 'rotateLeft':
                this.setRotate(this.rotate - 90);
                break;
            case 'rotateRight':
                this.setRotate(this.rotate + 90);
                break;
            case 'zoomIn':
            case '+':
            case '=':
                this.zoomTo(this.scale * 1.25);
                break;
            case 'zoomOut':
            case '-':
                this.zoomTo(this.scale / 1.25);
                break;
            case 'reset':
                this.movable = false;
                this.layout(true);
                break;
            case 'next':
            case 'ArrowRight':
                this.next();
                break;
            case 'prev':
            case 'ArrowLeft':
                this.prev();
                break;
        }
    };
    ImgPreviewer.prototype.setIndex = function (index) {
        this.index = index;
        this.currentIndexEl.textContent = String(index + 1);
        this.prevButton.disabled = index === 0;
        this.nextButton.disabled = index >= this.imgList.length - 1;
    };
    // clamp within options.imageZoom, max is relative to the fitted scale
    ImgPreviewer.prototype.setScale = function (scale) {
        var _a = this.options.imageZoom, min = _a.min, max = _a.max;
        this.scale = clamp(scale, min, this.baseScale + max);
        setProperties(this.currentImg, { '--scale': this.scale.toFixed(2) });
    };
    ImgPreviewer.prototype.zoomTo = function (scale) {
        this.movable = true;
        this.setScale(scale);
    };
    ImgPreviewer.prototype.setRotate = function (deg) {
        this.rotate = deg;
        setProperties(this.currentImg, { '--rotate': "".concat(deg, "deg") });
    };
    // put the preview image on the clicked image's rect
    ImgPreviewer.prototype.placeAtStart = function () {
        setStyle(this.currentImg, {
            top: "".concat(this.startY, "px"),
            left: "".concat(this.startX - 1, "px"),
            width: "".concat(this.width, "px"),
            height: "".concat(this.height, "px")
        });
    };
    // move image from its start rect to the viewport center and fit it
    ImgPreviewer.prototype.layout = function (resetRotate) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var img = this.currentImg;
        this.scale = this.baseScale = getFitScale(w, this.width, h, this.height, this.options.fillRatio);
        if (resetRotate)
            this.setRotate(0);
        this.placeAtStart();
        setProperties(img, {
            '--offsetX': "".concat(w / 2 - this.width / 2 - this.startX, "px"),
            '--offsetY': "".concat(h / 2 - this.height / 2 - this.startY, "px"),
            '--scale': "".concat(this.scale)
        });
    };
    // hide the image on the page when `hideOriginal` is on, showing the previously hidden one again
    ImgPreviewer.prototype.hideOriginal = function (el) {
        if (el === this.hiddenEl)
            return;
        this.restoreOriginal();
        if (!el || !this.options.hideOriginal)
            return;
        this.hiddenEl = el;
        this.hiddenElVisibility = el.style.visibility;
        el.style.visibility = 'hidden';
    };
    ImgPreviewer.prototype.restoreOriginal = function () {
        if (!this.hiddenEl)
            return;
        this.hiddenEl.style.visibility = this.hiddenElVisibility;
        this.hiddenEl = null;
    };
    ImgPreviewer.prototype.context = function () {
        return { index: this.index, img: this.currentClickEl };
    };
    ImgPreviewer.prototype.getImageSrc = function (el) {
        var dataUrlKey = this.options.dataUrlKey;
        return (dataUrlKey && el.getAttribute(dataUrlKey)) || el.src;
    };
    // show a loading spinner on el until img is loaded
    ImgPreviewer.prototype.watchLoading = function (el, img) {
        var timer = setTimeout(function () { return el.classList.add('loading'); }, 32);
        img.onload = img.onerror = function () {
            clearTimeout(timer);
            el.classList.remove('loading');
        };
    };
    ImgPreviewer.prototype.open = function (img) {
        var _this = this;
        var _a;
        var _b = this, container = _b.container, options = _b.options;
        var index = this.imgList.indexOf(img);
        var context = { index: index, img: img };
        if (((_a = options.onBeforeShow) === null || _a === void 0 ? void 0 : _a.call(options, context)) === false)
            return;
        var src = this.getImageSrc(img);
        var openId = ++this.openId;
        this.isOpen = true;
        this.movable = false;
        this.currentClickEl = img;
        this.setIndex(index);
        container.style.display = 'block';
        this.watchLoading(this.currentItem, this.currentImg);
        var _c = img.getBoundingClientRect(), width = _c.width, height = _c.height, x = _c.x, y = _c.y;
        nextTick(function () {
            var _a;
            var currentImg = _this.currentImg;
            currentImg.classList.remove('img-pre__animated');
            currentImg.src = src;
            container.classList.remove('hide');
            container.classList.add('show');
            _this.width = width;
            _this.height = height;
            _this.startX = x;
            _this.startY = y;
            // snap to the clicked image without transition first, otherwise an
            // interrupted hide animation would make it fly from its mid-flight position
            currentImg.classList.add('moving');
            currentImg.style.cssText = '';
            _this.placeAtStart();
            setProperties(currentImg, { '--offsetX': '0px', '--offsetY': '0px', '--scale': '1', '--rotate': '0deg' });
            // force reflow so the start position is committed
            void currentImg.offsetWidth;
            currentImg.classList.remove('moving');
            _this.hideOriginal(img);
            _this.layout(true);
            onceEnd(currentImg, 'transitionend', function () {
                var _a;
                // closed or reopened in the meantime
                if (!_this.isOpen || openId !== _this.openId)
                    return;
                (_a = options.onShown) === null || _a === void 0 ? void 0 : _a.call(options, context);
            });
            (_a = options.onShow) === null || _a === void 0 ? void 0 : _a.call(options, context);
        });
    };
    ImgPreviewer.prototype.slideTo = function (index) {
        var _this = this;
        var _a, _b;
        if (this.isAnimating)
            return;
        this.isAnimating = true;
        var clickEl = this.imgList[index];
        var prevIndex = this.index;
        var src = this.getImageSrc(clickEl);
        var prevItem = this.currentItem;
        var item = document.createElement('div');
        var img = document.createElement('img');
        // next: current slides out to the left, new one comes in from the right
        var side = index > prevIndex ? 'left' : 'right';
        img.src = src;
        item.appendChild(img);
        item.classList.add('img-pre__img-item', "slide-".concat(side, "-in"));
        this.currentItem = item;
        this.currentImg = img;
        this.currentClickEl = clickEl;
        this.width = clickEl.width;
        this.height = clickEl.height;
        this.hideOriginal(clickEl);
        this.movable = false;
        this.setIndex(index);
        this.layout(true);
        this.watchLoading(item, img);
        this.wrapper.appendChild(item);
        (_b = (_a = this.options).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, { index: index, img: clickEl, prevIndex: prevIndex });
        prevItem.classList.add("slide-".concat(side, "-out"));
        onceEnd(prevItem, 'animationend', function () {
            prevItem.remove();
            _this.isAnimating = false;
        });
        onceEnd(item, 'animationend', function () {
            item.classList.remove("slide-".concat(side, "-in"));
            item.classList.add('current-index');
        });
    };
    ImgPreviewer.version = "2.1.7" ;
    return ImgPreviewer;
}());

export { ImgPreviewer as default };
