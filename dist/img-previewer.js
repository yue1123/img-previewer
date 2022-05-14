/*!
 * ImgPreviewer v2.1.6
 * https://github.com/yue1123/img-previewer
 *
 * Copyright 2021-present dh
 * Released under the MIT license
 *
 * Date: 2022-05-14T17:16:16.873Z
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImgPreviewer = factory());
})(this, (function () { 'use strict';

	var version = "2.1.6";

	function debounce(fn, delay) {
	    var timer = 0;
	    return function (arg) {
	        clearTimeout(timer);
	        timer = window.setTimeout(function () {
	            fn(arg);
	            clearTimeout(timer);
	        }, delay);
	    };
	}
	function preventDefault(e) {
	    e.preventDefault();
	}
	/**
	 * check element is hidden by css
	 * @param el check el
	 * @param  bubblingLevel The level to look up from the current element
	 * @returns {boolean}
	 */
	function isElementHiddenByCss(el, bubblingLevel) {
	    if (!el)
	        return false;
	    while (bubblingLevel-- && el) {
	        var _a = getComputedStyle(el), visibility = _a.visibility, height = _a.height, opacity = _a.opacity, width = _a.width;
	        if (visibility === 'hidden' || height === '0px' || width === '0px' || opacity === '0') {
	            return false;
	        }
	        el = el === null || el === void 0 ? void 0 : el.parentElement;
	    }
	    return true;
	}
	/**
	 * 判断一个元素是否出现在当前视口中
	 * @param el 要判断的元素
	 * @returns {boolean}
	 */
	function isElementInViewport(el, bubblingLevel) {
	    var rect = getElementRect(el);
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
	        return isElementHiddenByCss(el, bubblingLevel);
	    }
	}
	function getElementRect(el) {
	    return el.getBoundingClientRect();
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
	function getTwoNumberSmall(multiplier1, number1, multiplier2, number2, ratio) {
	    var a = (multiplier1 * ratio) / number1;
	    var b = (multiplier2 * ratio) / number2;
	    return a > b ? b : a;
	}
	// 页面绘制后的下一帧回调
	function nextTick(fn) {
	    requestAnimationFrame(fn);
	}
	// set element inline style
	function setStyle(imgElement, styleObj) {
	    for (var key in styleObj) {
	        imgElement.style[key] = styleObj[key];
	    }
	}
	// setProperties
	function setProperties(imgElement, properties) {
	    for (var key in properties) {
	        imgElement.style.setProperty(key, properties[key]);
	    }
	}
	// set element data-* attr
	function setDataset(el, key, value) {
	    if (el.dataset) {
	        el.dataset[key] = value;
	    }
	    else {
	        el.setAttribute('data-' + key, value);
	    }
	}

	function createStore() {
	    return {
	        rootEl: null,
	        container: null,
	        imgList: [],
	        currentImgElement: null,
	        totalIndex: 0,
	        index: 0,
	        width: 0,
	        height: 0,
	        startX: 0,
	        startY: 0,
	        endX: 0,
	        endY: 0,
	        scale: 0,
	        _scale: 0,
	        rotate: 0,
	        currentClickEl: null
	    };
	}

	var es = {
	    RESET: 'reset',
	    ROTATE_LEFT: 'rotate left',
	    ROTATE_RIGHT: 'rotate right',
	    CLOSE: 'close',
	    NEXT: 'next',
	    PREV: 'prev'
	};

	var zh_cn = {
	    RESET: '重置',
	    ROTATE_LEFT: '向左选择',
	    ROTATE_RIGHT: '向右选装',
	    CLOSE: '关闭',
	    NEXT: '下一张',
	    PREV: '上一张'
	};

	var i18n = { en: es, zh: zh_cn };

	var template = "\n    <div class=\"img-pre__header img-pre__animated\"> \n        <div class=\"img-pre__nums\"> \n            <p>\n                <span id=\"img-pre__current-index\"></span>\n                <span class=\"img-pre__nums-delimiter\">/</span>\n                <span id=\"img-pre__total-index\"></span>\n            </p>\n        </div>\n            <div class=\"img-pre__buttons\" id=\"J_header-buttons\"> \n                <button class=\"img-pre__button-item\" data-action=\"reset\" data-tooltip=\"{{RESET}}\"> \n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-view-list\" viewBox=\"0 0 16 16\" > <path d=\"M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z\" /> </svg> \n                </button> \n                <button class=\"img-pre__button-item\" data-action=\"rotateLeft\" data-tooltip=\"{{ROTATE_LEFT}}\">\n                    <svg t=\"1639647288997\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1423\" width=\"16\" height=\"16\" > <path d=\"M725.996 383.57H74.558A74.782 74.782 0 0 0 0 458.126v491.315A74.782 74.782 0 0 0 74.558 1024h651.438a74.782 74.782 0 0 0 74.558-74.558V458.127a74.782 74.782 0 0 0-74.558-74.558z m10.528 565.872a10.816 10.816 0 0 1-10.528 10.528H74.558a10.816 10.816 0 0 1-10.528-10.528V458.127c0-5.6 4.928-10.528 10.528-10.528h651.438c5.6 0 10.528 4.928 10.528 10.528v491.315z\" p-id=\"1424\" fill=\"#ffffff\" ></path> <path d=\"M1023.94 533.165C986.117 355.73 849.93 202.038 668.558 132.088a592.112 592.112 0 0 0-234.33-39.551l36.511-38.463A32 32 0 1 0 424.341 9.98l-96.094 101.15a32 32 0 0 0 1.184 45.278l96.062 90.974a31.935 31.935 0 0 0 45.246-1.248 32 32 0 0 0-1.216-45.279l-46.75-44.319a529.17 529.17 0 0 1 222.746 35.231c161.403 62.239 282.392 198.139 315.703 354.647a32.063 32.063 0 0 0 62.718-13.248z\" p-id=\"1425\" fill=\"#ffffff\" ></path> </svg> \n                </button>\n                <button class=\"img-pre__button-item\" data-action=\"rotateRight\" data-tooltip=\"{{ROTATE_RIGHT}}\">\n                    <svg t=\"1639647310917\" class=\"icon\" viewBox=\"0 0 1025 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1652\" width=\"16\" height=\"16\" > <path d=\"M0.69753 525.673495a31.720891 31.720891 0 0 0 25.581364 37.860419 32.744146 32.744146 0 0 0 38.372045-23.534855 502.929616 502.929616 0 0 1 320.790305-350.464687A557.673735 557.673735 0 0 1 611.580501 154.23209l-48.092964 44.511573a28.1395 28.1395 0 0 0-10.232546 21.999973 31.209264 31.209264 0 0 0 8.697664 22.511601 33.255773 33.255773 0 0 0 46.046455 0L706.231548 154.23209a32.744146 32.744146 0 0 0 10.232546-21.999973 31.720891 31.720891 0 0 0-9.209291-22.5116L609.533992 10.464824a33.255773 33.255773 0 0 0-31.209264-9.720918 32.232519 32.232519 0 0 0-23.534855 21.488346A31.209264 31.209264 0 0 0 563.487537 51.906634l37.348791 37.860419a626.743417 626.743417 0 0 0-237.906685 38.883673 566.883026 566.883026 0 0 0-358.139095 394.97626z m269.115949 420.045996a11.767427 11.767427 0 0 0 10.744172 10.744173h665.115464a10.744173 10.744173 0 0 0 10.744173-10.744173V435.627094a10.744173 10.744173 0 0 0-10.744173-10.744173h-665.115464a11.2558 11.2558 0 0 0-10.744172 10.744173v511.627279zM281.069279 358.883002h665.115463A77.255719 77.255719 0 0 1 1023.952089 435.627094v511.627279a76.744092 76.744092 0 0 1-77.25572 76.744092h-665.115463A76.744092 76.744092 0 0 1 205.348441 945.719491V435.627094A77.255719 77.255719 0 0 1 281.069279 358.883002z\" p-id=\"1653\" fill=\"#ffffff\" ></path> </svg> \n                </button>\n                <button class=\"img-pre__button-item\" data-action=\"close\" data-tooltip=\"{{CLOSE}}\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-x-lg\" viewBox=\"0 0 16 16\" > <path fill-rule=\"evenodd\" d=\"M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z\" /> <path fill-rule=\"evenodd\" d=\"M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z\" /> </svg> </button> <button id=\"J-img-pre__prev\" data-action=\"prev\" data-tooltip=\"{{PREV}}\"> <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-left\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z\"/> </svg> </button> <button id=\"J-img-pre__next\" data-action=\"next\" data-tooltip=\"{{NEXT}}\"> <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-right\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z\"/> </svg> \n                </button>                    \n            </div>\n        </div>\n    </div>        \n    <div class=\"img-pre__content-wrapper\" id=\"J_content-wrapper\"> \n        <div class=\"img-pre__img-item img-pre__animated current-index\" id=\"J_current-index\"> \n            <img alt=\"\" id=\"img-pre__image\" src=\"\" /> \n        </div>\n    </div>";

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
	    bubblingLevel: 0
	};

	function ImgPreviewer(selector, options) {
	    if (typeof window !== 'object') {
	        return;
	    }
	    // check use new
	    if (!(this instanceof ImgPreviewer)) {
	        return console.error(new Error('ImgPreviewer is a constructor and should be called with the `new` keyword'));
	    }
	    // check required params is correct incoming
	    if (selector) {
	        if (!document.querySelector(selector))
	            return console.error(new Error('selector ' + selector + ' is invalid'));
	    }
	    else {
	        return console.error(new Error('ImgPreviewer plugin should css string selector that on first params,like #el,.el'));
	    }
	    var mergeOptions;
	    var previewerContainer = null;
	    // const i18n =
	    var store = createStore();
	    var isOpen = false;
	    var isRunning = false;
	    // FIXME: 储存到store中去
	    var movable = false;
	    // 绑定事件
	    function bindEvent(rootEl) {
	        var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent);
	        var wrapper = document.getElementById('J_content-wrapper');
	        // add click eventListener for rootEl, proxy img click event
	        rootEl === null || rootEl === void 0 ? void 0 : rootEl.addEventListener(mergeOptions.triggerEvent, function (event) {
	            var target = event.target;
	            if (target === store.currentImgElement)
	                return;
	            if (target.localName === 'img') {
	                store.currentClickEl = target;
	                store.index = Number(target.dataset.index);
	                handlePreviewerShow(target, getImageSrc(store.imgList[store.index]));
	            }
	        }, false);
	        // all buttons event proxy listener
	        document.getElementById('J_header-buttons').addEventListener('click', function (event) {
	            // fixed mobile Safari and chrome e.path undefined
	            var _event = window.event || event;
	            var path = _event.path || (_event.composedPath && _event.composedPath());
	            var buttonEl = path.find(function (item) { return item.localName === 'button'; });
	            if (buttonEl && !buttonEl.disabled) {
	                handleActionFn(buttonEl.dataset.action);
	            }
	        });
	        // hot keyboard event listener
	        document.addEventListener('keyup', function (_a) {
	            var key = _a.key;
	            return handleActionFn(key);
	        });
	        // mouse wheel to zoom and zoom out image
	        wrapper === null || wrapper === void 0 ? void 0 : wrapper.addEventListener('wheel', function (event) {
	            preventDefault(event);
	            if (event.target.localName !== 'img')
	                return;
	            movable = true;
	            var _a = mergeOptions.imageZoom, min = _a.min, max = _a.max, step = _a.step;
	            var _max = store._scale + max;
	            if (event.wheelDelta > 0) {
	                // zoom
	                var scale = step + store.scale;
	                store.scale = scale > _max ? _max : scale;
	            }
	            else {
	                // zoom out
	                var scale = store.scale - step;
	                store.scale = scale < min ? min : scale;
	            }
	            store.currentImgElement.style.setProperty('--scale', "".concat(store.scale.toFixed(2)));
	        });
	        // click modal hide preview
	        wrapper === null || wrapper === void 0 ? void 0 : wrapper.addEventListener('click', function (event) {
	            if (event.target === document.getElementById('J_current-index')) {
	                handleActionFn('close');
	            }
	        });
	        //
	        if (mobile) {
	            enableMobileScale(wrapper);
	            var lastTouchEnd_1 = 0;
	            document.documentElement.addEventListener('touchend', function (event) {
	                var now = Date.now();
	                if (now - lastTouchEnd_1 <= 300) {
	                    event.preventDefault();
	                }
	                lastTouchEnd_1 = now;
	            }, false);
	        }
	        wrapper === null || wrapper === void 0 ? void 0 : wrapper.addEventListener('mousedown', function (e) {
	            if (e.target.localName !== 'img' || !movable)
	                return;
	            var diffX = e.clientX - e.target.offsetLeft;
	            var diffY = e.clientY - e.target.offsetTop;
	            e.preventDefault();
	            store.currentImgElement.classList.add('moving');
	            wrapper['onmousemove'] = function (e) {
	                var moveX = e.clientX - diffX;
	                var moveY = e.clientY - diffY;
	                setStyle(store.currentImgElement, {
	                    top: "".concat(moveY, "px"),
	                    left: "".concat(moveX, "px")
	                });
	            };
	            wrapper['onmouseup'] = function () {
	                this.onmousemove = null;
	                store.currentImgElement.classList.remove('moving');
	            };
	            wrapper['onmouseout'] = function () {
	                this.onmousemove = null;
	                store.currentImgElement.classList.remove('moving');
	            };
	        });
	        var handleResize = debounce(function () {
	            isOpen && setImageStyles(window.innerWidth, window.innerHeight, false);
	        }, 100);
	        window.addEventListener('resize', handleResize);
	    }
	    // distribute processing function by antionType
	    function handleActionFn(actionType) {
	        switch (actionType) {
	            case 'close':
	            case 'Escape':
	                handlePreviewerHide();
	                break;
	            case 'rotateLeft':
	                handleRotateLeft();
	                break;
	            case 'rotateRight':
	                handleRotateRight();
	                break;
	            case 'reset':
	                handleReset();
	                break;
	            case 'next':
	            case 'ArrowRight':
	                handleNext();
	                break;
	            case 'prev':
	            case 'ArrowLeft':
	                handlePrev();
	                break;
	        }
	    }
	    function setImageStyles(w, h, setRotate) {
	        store.endX = w / 2 - store.width / 2 - store.startX;
	        store.endY = h / 2 - store.height / 2 - store.startY;
	        store.scale = store._scale = getTwoNumberSmall(w, store.width, h, store.height, mergeOptions.fillRatio || defaultOptions.fillRatio);
	        if (setRotate) {
	            store.rotate = 0;
	            setProperties(store.currentImgElement, {
	                '--rotate': "0"
	            });
	        }
	        setStyle(store.currentImgElement, {
	            top: "".concat(store.startY, "px"),
	            left: "".concat(store.startX - 1, "px"),
	            width: "".concat(store.width, "px"),
	            height: "".concat(store.height, "px")
	        });
	        setProperties(store.currentImgElement, {
	            '--offsetX': "".concat(store.endX, "px"),
	            '--offsetY': "".concat(store.endY, "px"),
	            '--scale': "".concat(store.scale)
	        });
	    }
	    // mobile enable two finger scale
	    function enableMobileScale(wrapper) {
	        var _store = {
	            scale: 1
	        };
	        wrapper === null || wrapper === void 0 ? void 0 : wrapper.addEventListener('touchstart', function (event) {
	            if (event.target.localName !== 'img')
	                return;
	            event.preventDefault();
	            var touches = event.touches;
	            var events = touches[0];
	            var events2 = touches[1];
	            // 第一个触摸点的坐标
	            _store.pageX = events.pageX;
	            _store.pageY = events.pageY;
	            _store.movable = true;
	            if (events2) {
	                _store.pageX2 = events2.pageX;
	                _store.pageY2 = events2.pageY;
	            }
	            _store.originScale = _store.scale || 1;
	        });
	        document.addEventListener('touchmove', function (event) {
	            if (!_store.movable)
	                return;
	            event.preventDefault();
	            store.currentImgElement.classList.add('moving');
	            var touches = event.touches;
	            var events = touches[0];
	            var events2 = touches[1];
	            // two finger move
	            if (events2) {
	                // 第2个指头坐标在touchmove时候获取
	                if (!_store.pageX2) {
	                    _store.pageX2 = events2.pageX;
	                }
	                if (!_store.pageY2) {
	                    _store.pageY2 = events2.pageY;
	                }
	                // 获取坐标之间的距离
	                var getDistance = function (start, stop) {
	                    return Math.hypot(stop.x - start.x, stop.y - start.y);
	                };
	                // 双指缩放比例计算
	                var zoom = getDistance({
	                    x: events.pageX,
	                    y: events.pageY
	                }, {
	                    x: events2.pageX,
	                    y: events2.pageY
	                }) /
	                    getDistance({
	                        x: _store.pageX,
	                        y: _store.pageY
	                    }, {
	                        x: _store.pageX2,
	                        y: _store.pageY2
	                    });
	                // 应用在元素上的缩放比例
	                var newScale = _store.originScale * zoom;
	                // 最大缩放比例限制
	                if (newScale > mergeOptions.zoom.max) {
	                    newScale = mergeOptions.zoom.max;
	                }
	                // 记住使用的缩放值
	                _store.scale = newScale;
	                // 图像应用缩放效果
	                store.currentImgElement.style.setProperty('--scale', "".concat(newScale.toFixed(2)));
	            }
	        });
	        document.addEventListener('touchend', function () {
	            _store.movable = false;
	            store.currentImgElement.classList.remove('moving');
	            delete _store.pageX2;
	            delete _store.pageY2;
	        });
	        document.addEventListener('touchcancel', function () {
	            _store.movable = false;
	            store.currentImgElement.classList.remove('moving');
	            delete _store.pageX2;
	            delete _store.pageY2;
	        });
	    }
	    function handleReset() {
	        movable = false;
	        setImageStyles(window.innerWidth, window.innerHeight, true);
	    }
	    function getImageSrc(el) {
	        return (mergeOptions.dataUrlKey && el.getAttribute(mergeOptions.dataUrlKey)) || el.src;
	    }
	    function handleNext(i) {
	        if (store.index === store.totalIndex - 1 || isRunning)
	            return;
	        isRunning = true;
	        var index = i || store.index + 1;
	        var div = document.createElement('div');
	        var wrapper = document.getElementById('J_content-wrapper');
	        var img = document.createElement('img');
	        var currentImgWrapper = document.querySelector('#J_current-index');
	        var clickEl = store.imgList[index];
	        var src = getImageSrc(clickEl);
	        img.src = src;
	        // cache data
	        store.index = index;
	        store.width = clickEl.width;
	        store.height = clickEl.height;
	        store.currentImgElement = img;
	        //
	        setImageStyles(window.innerWidth, window.innerHeight, true);
	        div.appendChild(img);
	        div.classList.add('img-pre__img-item', 'slide-left-in');
	        listenImageLoading(div, src);
	        wrapper.appendChild(div);
	        currentImgWrapper.classList.add('slide-left-out');
	        currentImgWrapper.addEventListener('animationend', function () {
	            isRunning = false;
	            currentImgWrapper && wrapper.removeChild(currentImgWrapper);
	        });
	        // listen animationend and remove prev el
	        div.addEventListener('animationend', function () {
	            div.classList.remove('slide-left-in');
	            div.classList.add('current-index');
	            div.id = 'J_current-index';
	            store.currentClickEl = clickEl;
	        }, {
	            once: true
	        });
	    }
	    function handlePrev(i) {
	        if (store.index === 0 || isRunning)
	            return;
	        isRunning = true;
	        var index = i || store.index - 1;
	        var div = document.createElement('div');
	        var img = document.createElement('img');
	        var wrapper = document.getElementById('J_content-wrapper');
	        var currentImgWrapper = document.querySelector('#J_current-index');
	        var clickEl = store.imgList[index];
	        var src = getImageSrc(clickEl);
	        img.src = src;
	        // cache data
	        store.index = index;
	        store.width = clickEl.width;
	        store.height = clickEl.height;
	        store.currentImgElement = img;
	        //
	        setImageStyles(window.innerWidth, window.innerHeight, true);
	        div.appendChild(img);
	        div.classList.add('img-pre__img-item', 'slide-right-in');
	        listenImageLoading(div, src);
	        wrapper.appendChild(div);
	        currentImgWrapper.classList.add('slide-right-out');
	        currentImgWrapper.addEventListener('animationend', function () {
	            isRunning = false;
	            currentImgWrapper && wrapper.removeChild(currentImgWrapper);
	        });
	        // listen animationend and remove next el
	        div.addEventListener('animationend', function () {
	            div.classList.remove('slide-right-in');
	            div.classList.add('current-index');
	            div.id = 'J_current-index';
	            store.currentClickEl = clickEl;
	        }, {
	            once: true
	        });
	    }
	    // listen image load
	    function listenImageLoading(el, src) {
	        var image = new Image();
	        image.src = src;
	        var timer = setTimeout(function () {
	            el === null || el === void 0 ? void 0 : el.classList.add('loading');
	        }, 32);
	        image.onload = function () {
	            var _a;
	            timer && clearTimeout(timer);
	            // manually reclaim memory
	            image = null;
	            (_a = document.getElementById('J_current-index')) === null || _a === void 0 ? void 0 : _a.classList.remove('loading');
	        };
	    }
	    // show
	    function handlePreviewerShow(img, src) {
	        isOpen = true;
	        previewerContainer.style.display = 'block';
	        document.ondragstart = preventDefault;
	        document.ondragend = preventDefault;
	        listenImageLoading(document.getElementById('J_current-index'), src);
	        var _a = getElementRect(img), width = _a.width, height = _a.height, x = _a.x, y = _a.y;
	        nextTick(function () {
	            store.currentImgElement.src = src;
	            previewerContainer.classList.remove('hide', 'fadeout');
	            previewerContainer.classList.add('show');
	            store.width = width;
	            store.height = height;
	            store.startX = x;
	            store.startY = y;
	            setImageStyles(window.innerWidth, window.innerHeight, true);
	            mergeOptions.onShow && mergeOptions.onShow();
	        });
	    }
	    // hide
	    function handlePreviewerHide() {
	        isOpen = false;
	        movable = false;
	        document.ondragstart = null;
	        document.ondragend = null;
	        // current click image el is in viewport
	        if (isElementInViewport(store.currentClickEl, mergeOptions.bubblingLevel)) {
	            var _a = getElementRect(store.currentClickEl), top = _a.top, left = _a.left, width = _a.width, height = _a.height;
	            previewerContainer.classList.remove('show');
	            previewerContainer.classList.add('hide');
	            store.currentImgElement.style.cssText = "width:".concat(width, "px;height:").concat(height, "px;position: fixed; top: ").concat(top, "px; left: ").concat(left, "px;");
	            store.currentImgElement.addEventListener('transitionend', function () {
	                previewerContainer.style.display = 'none';
	                store.currentImgElement.src = '';
	                store.currentImgElement.style.cssText = "";
	            }, { once: true });
	        }
	        else {
	            previewerContainer.classList.remove('show');
	            previewerContainer.classList.add('hide');
	            store.currentImgElement.classList.add('img-pre__animated');
	            store.currentImgElement.addEventListener('animationend', function () {
	                previewerContainer.style.display = 'none';
	                store.currentImgElement.src = '';
	                store.currentImgElement.style.cssText = "";
	                store.currentImgElement.classList.remove('img-pre__animated');
	            }, { once: true });
	        }
	        mergeOptions.onHide && mergeOptions.onHide();
	    }
	    function handleRotateLeft() {
	        store.rotate -= 90;
	        setProperties(store.currentImgElement, {
	            '--rotate': "".concat(store.rotate, "deg")
	        });
	    }
	    function handleRotateRight() {
	        store.rotate += 90;
	        setProperties(store.currentImgElement, {
	            '--rotate': "".concat(store.rotate, "deg")
	        });
	    }
	    // listen index change,and update view
	    function onIndexChange(index) {
	        document.getElementById('img-pre__current-index').innerText = String(index + 1);
	        var prevButton = document.getElementById('J-img-pre__prev');
	        var nextButton = document.getElementById('J-img-pre__next');
	        prevButton.disabled = index === 0;
	        nextButton.disabled = index === store.totalIndex - 1;
	    }
	    function onTotalIndexChange(index) {
	        document.getElementById('img-pre__total-index').innerText = String(index);
	    }
	    // get i18n options
	    function getI18nInfo() {
	        if (mergeOptions.i18n) {
	            return mergeOptions.i18n;
	        }
	        else {
	            var lang = window.navigator.language;
	            // all display in English except Chinese
	            return lang.indexOf('zh') !== -1 ? i18n.zh : i18n.en;
	        }
	    }
	    // i18n translate
	    function i18nTranslate(template, i18nObj) {
	        return template.replace(/{{(.*?)}}/g, function (_, a) { return i18nObj[a]; });
	    }
	    //
	    function defineReactValue(store, key, value, cal) {
	        Object.defineProperty(store, key, {
	            enumerable: false,
	            set: function (newVal) {
	                cal((value = newVal));
	            },
	            get: function () {
	                return value;
	            }
	        });
	    }
	    //
	    function render() {
	        var el = document.getElementById('image-preview-container');
	        var _a = mergeOptions.style, modalOpacity = _a.modalOpacity, headerOpacity = _a.headerOpacity, zIndex = _a.zIndex;
	        if (!el) {
	            previewerContainer = document.createElement('div');
	            previewerContainer.classList.add('img-pre__container', 'img-pre__animated');
	            previewerContainer.id = 'J_container';
	            previewerContainer.style.setProperty('--container-opacity', String(modalOpacity));
	            previewerContainer.style.setProperty('--header-bg-opacity', String(headerOpacity));
	            previewerContainer.style.setProperty('--container-zIndex', String(zIndex));
	            previewerContainer.innerHTML = i18nTranslate(template, getI18nInfo());
	            document.body.appendChild(previewerContainer);
	        }
	        else {
	            previewerContainer = el;
	        }
	    }
	    function _init(selector, options) {
	        if (options) {
	            options.imageZoom = Object.assign({}, defaultOptions.imageZoom, options.imageZoom || {});
	            options.style = Object.assign({}, defaultOptions.style, options.style || {});
	            mergeOptions = Object.assign({}, defaultOptions, options);
	        }
	        else {
	            mergeOptions = defaultOptions;
	        }
	        var rootEl = document.querySelector(selector);
	        // use defineProperty to init listen index
	        defineReactValue(store, 'index', 0, onIndexChange);
	        defineReactValue(store, 'totalIndex', 0, onTotalIndexChange);
	        // render to document
	        render();
	        // bind event for el
	        bindEvent(rootEl);
	        // cache data
	        store.currentImgElement = document.querySelector('#J_current-index img');
	        store.rootEl = rootEl;
	        //
	        initImgList();
	    }
	    // get selector all img children to init totalIndex and store these
	    function initImgList() {
	        var imgEls = store.rootEl.querySelectorAll('img');
	        store.totalIndex = imgEls.length;
	        store.imgList = new Array(store.totalIndex);
	        for (var i = 0, len = store.totalIndex; i < len; i++) {
	            var element = imgEls[i];
	            setDataset(element, 'index', String(i));
	            store.imgList[i] = element;
	        }
	    }
	    function show(index) {
	        var img = store.imgList[index];
	        store.currentClickEl = img;
	        if (index < 0 || index > store.totalIndex - 1) {
	            throw new Error('invalid index');
	        }
	        if (isOpen) {
	            index < store.index ? handlePrev(index) : handleNext(index);
	        }
	        else {
	            handlePreviewerShow(img, img.src);
	        }
	        store.index = index;
	    }
	    _init(selector, options);
	    ImgPreviewer.prototype.getTotalIndex = function () { return store.totalIndex - 1; };
	    ImgPreviewer.prototype.update = initImgList;
	    ImgPreviewer.prototype.show = show;
	    ImgPreviewer.prototype.next = function () {
	        if (!isOpen) {
	            return show(0);
	        }
	        handleNext();
	    };
	    ImgPreviewer.prototype.prev = function () {
	        if (!isOpen) {
	            return show(store.totalIndex - 1);
	        }
	        handlePrev();
	    };
	    ImgPreviewer.prototype.version = version;
	}

	return ImgPreviewer;

}));
