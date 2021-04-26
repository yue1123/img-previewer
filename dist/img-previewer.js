/*!
 * ImgPreviewer v1.0.2
 * https://github.com/yue1123/img-previewer
 *
 * Copyright 2021-present dh
 * Released under the MIT license
 *
 * Date: 2021-04-26T09:36:40.555Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImgPreviewer = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * 防抖函数
   * @export {Funcion}
   * @param {Function} fn 回调函数
   * @param {Number} delay 防抖时间
   * @returns {Function}
   */
  function debounce(fn, delay) {
    var timer = null;
    return function (arg) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn(arg);
        clearTimeout(timer);
      }, delay);
    };
  }
  /**
   * 阻止默认事件
   * @param {Object} e
   */

  function preventDefault(e) {
    e.preventDefault();
  }

  /**
   * {
   *   start:10,
   *   end:10,
   *   step:1,
   *   style:'font-size'
   *   template:'$px'
   * }
   */
  function runAnimation(el, options, callback) {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    var start = options.start || 0;
    var end = options.end || 0;
    var step = options.step;
    var playing = null;

    function running() {
      if (step > 0 && start < end || step < 0 && start > end) {
        start += step;
        el.style[options.style] = options.template.replace('$', start);
        playing = requestAnimationFrame(running);
      } else {
        callback && callback();
        cancelAnimationFrame(playing);
      }
    }

    running();
  }

  function isElementInViewport(el) {
    var viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var offsetTop = el.offsetTop;
    var offsetHeight = el.offsetHeight;
    var scrollTop = document.documentElement.scrollTop;
    var top = offsetTop - scrollTop;
    return offsetHeight + offsetTop > scrollTop && top <= viewPortHeight + 100;
  } // 获取元素位置


  function getElementRect(el) {
    return el.getBoundingClientRect();
  } // 计算放大倍数


  function calcScaleNums(width, height, ratio) {
    var scaleX = windowWidth * ratio / width;
    var scaleY = windowHeight * ratio / height;
    return scaleX > scaleY ? scaleY : scaleX;
  } // 设置图片样式


  function setImageBaseStyle(el, width, height, left, top) {
    el.style.cssText = "width:".concat(width, "px;height:").concat(height, "px;position:fixed; top:").concat(top, "px; left:").concat(left, "px;");
  }

  function taggleModel(flag) {
    previewContainer.style.display = flag ? 'block' : 'none';
  }

  function taggleScrollBar(flag) {
    _BODY.style.overflow = flag ? 'auto' : 'hidden';
  }

  var _BODY, windowHeight, windowWidth;

  var previewContainer = null;
  var imageEl = null;
  var historyInfo = null;
  var currentImageScale = 0;
  var _DEFAULT = {
    ratio: 0.9,
    zoom: {
      min: 0.1,
      max: 5,
      step: 0.1
    },
    opacity: 0.6,
    scrollbar: true
  };

  var ImagePreviewer = /*#__PURE__*/function () {
    function ImagePreviewer(selector) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ImagePreviewer);

      this.index = 0;
      this.selector = selector;
      this.options = options;
      this.imageElements = [];
      options.zoom = Object.assign({}, _DEFAULT.zoom, options.zoom || {});
      this.config = Object.assign({}, _DEFAULT, options);

      if (selector && typeof selector === 'string') {
        var el = document.querySelector(selector);

        if (!el) {
          throw new Error('selector is invalid');
        }
      } else {
        throw new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el');
      }

      this.init();
    } // update image list


    _createClass(ImagePreviewer, [{
      key: "update",
      value: function update() {
        var _this = this;

        this.imageElements = document.querySelectorAll("".concat(this.selector, " img:not(#preview-image)"));
        this.imageElements.forEach(function (item, index) {
          item.onclick = null;

          item.onclick = function (e) {
            _this.handleOpen(e, index);

            taggleModel(true);

            _this.updateIndex(index);
          };
        });
      } // 绑定事件

    }, {
      key: "bindEvent",
      value: function bindEvent() {
        var _this2 = this;

        var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent);
        var touchstart = mobile ? 'touchstart' : 'mousedown';
        var touchend = mobile ? 'touchend' : 'mouseup';
        var touchmove = mobile ? 'touchmove' : 'mousemove'; // TODO: 每张图片绑定点击事件

        this.imageElements.forEach(function (item, index) {
          item.onclick = function (e) {
            _this2.handleOpen(e, index);

            taggleModel(true);

            _this2.updateIndex(index);
          };
        }); // 点击关闭

        document.getElementById('close').addEventListener('click', function () {
          _this2.handleClose();
        }); // 重置样式

        document.getElementById('reset').addEventListener('click', function () {
          _this2.handleReset();
        }); // 上一张

        document.getElementById('prev').addEventListener('click', function () {
          _this2.prev();
        }); // 下一张

        document.getElementById('next').addEventListener('click', function () {
          _this2.next();
        }); // 蒙版点击关闭

        previewContainer.addEventListener('click', function (e) {
          if (e.target.classList[0] === 'image-container') {
            _this2.handleClose();
          }
        }); // 拖动图片

        imageEl.addEventListener(touchstart, function (e) {
          var diffX = e.clientX - imageEl.offsetLeft;
          var diffY = e.clientY - imageEl.offsetTop;
          this.classList.add('moving');

          this["on".concat(touchmove)] = function (e) {
            var moveX = e.clientX - diffX;
            var moveY = e.clientY - diffY;
            this.style.left = "".concat(moveX, "px");
            this.style.top = "".concat(moveY, "px");
          };

          this["on".concat(touchend)] = function () {
            this.classList.remove('moving');
            this.onmousemove = null;
          };

          this.onmouseout = function () {
            this.classList.remove('moving');
            this.onmousemove = null;
          };
        }); // 缩放图片

        imageEl.addEventListener('mousewheel', function (e) {
          var _this2$config$zoom = _this2.config.zoom,
              min = _this2$config$zoom.min,
              max = _this2$config$zoom.max,
              step = _this2$config$zoom.step;

          if (e.wheelDelta > 0 && currentImageScale < max) {
            currentImageScale += step;
          } else if (currentImageScale > min) {
            currentImageScale -= step;
          }

          imageEl.style.setProperty('--scale', "".concat(currentImageScale.toFixed(2)));
        }, true); // 旋转图片

        document.getElementById('rotate-right').addEventListener('click', function () {
          _this2.handelRotateRight();
        });
        document.getElementById('rotate-left').addEventListener('click', function () {
          _this2.handelRotateLeft();
        }); // 阻止默认事件

        previewContainer.addEventListener('mousewheel', preventDefault);
        document.ondragstart = preventDefault;
        document.ondragend = preventDefault; // 窗口大小改变

        window.onresize = debounce.bind(null, function () {
          _this2.handleClose();

          windowWidth = window.innerWidth;
          windowHeight = window.innerHeight;
        }, 100)();
      } // 重置

    }, {
      key: "handleReset",
      value: function handleReset() {
        imageEl.style.top = "".concat(historyInfo.startY, "px");
        imageEl.style.left = "".concat(historyInfo.startX, "px");
        imageEl.style.setProperty('--rotate', "".concat(0, "deg"));
        imageEl.style.setProperty('--scale', "".concat(historyInfo.scale));
      } // 打开预览

    }, {
      key: "handleOpen",
      value: function handleOpen(e, index) {
        var ratio = this.config.ratio;
        var imageElements = this.imageElements;
        var _e$target = e.target,
            width = _e$target.width,
            height = _e$target.height;
        var startX = e.clientX - e.offsetX;
        var startY = e.clientY - e.offsetY + 1;
        currentImageScale = calcScaleNums(width, height, ratio);
        historyInfo = {
          startX: startX,
          startY: startY,
          endX: windowWidth / 2 - width / 2 - startX,
          endY: windowHeight / 2 - height / 2 - startY,
          scale: currentImageScale,
          rotate: 0
        };
        imageEl.src = imageElements[index].src;
        setImageBaseStyle(imageEl, width, height, startX, startY);
        setTimeout(function () {
          ImagePreviewer.setImageAnimationParams(historyInfo);
        });
        previewContainer.classList.add('show');
        !this.config.scrollbar && taggleScrollBar(false);
      }
    }, {
      key: "handleClose",
      value: // 关闭预览
      function handleClose() {
        var opacity = this.config.opacity;
        var current = this.imageElements[this.index]; // console.log(isElementInViewport)

        if (isElementInViewport(current)) {
          runAnimation(previewContainer, {
            start: opacity,
            end: 0,
            step: -0.02,
            style: 'background',
            template: 'rgba(0, 0, 0, $)'
          }, function () {
            imageEl.style = '';
            imageEl.src = '';
            previewContainer.style.background = "";
            previewContainer.classList.remove('hiding');
            taggleModel(false);
          });

          var _getElementRect = getElementRect(current),
              top = _getElementRect.top,
              left = _getElementRect.left,
              width = _getElementRect.width,
              height = _getElementRect.height;

          imageEl.style.cssText = "width:".concat(width, "px;height:").concat(height, "px;position: fixed; top: ").concat(top, "px; left: ").concat(left, "px;");
        } else {
          imageEl.style.display = 'none'; // image

          runAnimation(previewContainer, {
            start: opacity,
            end: 0,
            step: -0.05,
            style: 'background',
            template: 'rgba(0, 0, 0, $)'
          }, function () {
            imageEl.src = '';
            imageEl.style = '';
            previewContainer.style = "";
            previewContainer.classList.remove('hiding');
            taggleModel(false);
          });
        }

        previewContainer.classList.remove('show');
        previewContainer.classList.add('hiding');
        !this.config.scrollbar && taggleScrollBar(true);
      } // 向左旋转

    }, {
      key: "handelRotateLeft",
      value: function handelRotateLeft() {
        historyInfo.rotate -= 90;
        imageEl.style.setProperty('--rotate', "".concat(historyInfo.rotate, "deg"));
      } // 向右旋转

    }, {
      key: "handelRotateRight",
      value: function handelRotateRight() {
        historyInfo.rotate += 90;
        imageEl.style.setProperty('--rotate', "".concat(historyInfo.rotate, "deg"));
      } // 上一张

    }, {
      key: "prev",
      value: function prev() {
        if (this.index !== 0) {
          this.index -= 1; //TODO: 更新图片显示

          this.updateIndex(this.index);
          this.useIndexUpdateImage(this.index);
        }
      } // 下一张

    }, {
      key: "next",
      value: function next() {
        if (this.index < this.imageElements.length - 1) {
          this.index += 1;
          this.updateIndex(this.index);
          this.useIndexUpdateImage(this.index);
        }
      }
    }, {
      key: "useIndexUpdateImage",
      value: function useIndexUpdateImage(index) {
        var ratio = this.config.ratio;
        var _this$imageElements$i = this.imageElements[index],
            height = _this$imageElements$i.height,
            width = _this$imageElements$i.width,
            src = _this$imageElements$i.src; //TODO: 更新图片显示

        imageEl.classList.add('moving');
        setImageBaseStyle(imageEl, width, height, windowWidth / 2 - width / 2, windowHeight / 2 - height / 2);
        historyInfo = {
          endX: 0,
          endY: 0,
          scale: calcScaleNums(width, height, ratio),
          rotate: 0
        };
        imageEl.src = src;
        ImagePreviewer.setImageAnimationParams(historyInfo);
        setTimeout(function () {
          imageEl.classList.remove('moving');
        });
      } // 更新视图上的索引

    }, {
      key: "updateIndex",
      value: function updateIndex(index) {
        this.index = index;
        document.getElementById('total-nums').innerText = this.imageElements.length;
        document.getElementById('current-index').innerText = index + 1;
      } // 渲染视图

    }, {
      key: "render",
      value: function render() {
        var template = "<div class=\"preview-header\">\n                        <div class=\"nums\">\n                           \n                            <p>\n                                <span id=\"current-index\"></span>\n                                &nbsp;/&nbsp;\n                                <span id=\"total-nums\"></span>\n                            </p>\n                            \n                        </div>\n                        <div class=\"tool-btn\">\n                            <button id=\"rotate-left\" data-tooltip=\"\u5411\u53F3\u65CB\u8F6C\"><i class=\"iconfont icon-xuanzhuan\"></i></button>\n                            <button id=\"rotate-right\" data-tooltip=\"\u5411\u5DE6\u65CB\u8F6C\"><i class=\"iconfont icon-xuanzhuan1\"></i></button>\n                            <button id=\"reset\" data-tooltip=\"\u91CD\u7F6E\"><i class=\"iconfont icon-zhongzhi\"></i></button>\n                            <button id=\"close\" data-tooltip=\"\u5173\u95ED\"><i class=\"iconfont icon-account-practice-lesson-close\"></i></button>\n                        </div>\n                    </div>\n                    <div class=\"image-container\">\n                        <button id=\"prev\" data-tooltip=\"\u4E0A\u4E00\u5F20\"><i class=\"iconfont icon-shangyige\"></i></button>\n                        <div class=\"img-content\" id=\"image-content\"><img id=\"preview-image\" src=\"\" alt=\"\" /></div>\n                        <button id=\"next\" data-tooltip=\"\u4E0B\u4E00\u5F20\"><i class=\"iconfont icon-xiayige\"></i></button>\n                    </div>";
        var el = document.getElementById('image-preview-container');

        if (!el) {
          previewContainer = document.createElement('div');
          previewContainer.classList.add('image-preview-container');
          previewContainer.id = 'image-preview-container';
          previewContainer.innerHTML = template;

          _BODY.appendChild(previewContainer);
        } else {
          previewContainer = el;
        }

        imageEl = document.getElementById('preview-image');
      } // 初始化

    }, {
      key: "init",
      value: function init() {
        _BODY = document && document.body || document.getElementsByTagName('body')[0];
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        this.imageElements = document.querySelectorAll("".concat(this.selector, " img"));

        for (var i = 0, len = this.imageElements.length; i < len; i++) {
          this.imageElements[i].classList.add('zoom-in');
        }

        this.render();
        this.updateIndex(this.index);
        this.bindEvent(this.imageElements);
        this.options.onInited && this.options.onInited();
      }
    }], [{
      key: "setImageAnimationParams",
      value: function setImageAnimationParams(historyInfo) {
        imageEl.style.setProperty('--offsetX', "".concat(historyInfo.endX, "px"));
        imageEl.style.setProperty('--offsetY', "".concat(historyInfo.endY + 30, "px"));
        imageEl.style.setProperty('--scale', "".concat(historyInfo.scale));
        imageEl.style.setProperty('--rotate', "".concat(historyInfo.rotate, "deg"));
      }
    }]);

    return ImagePreviewer;
  }();

  return ImagePreviewer;

})));
