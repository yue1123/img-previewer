/*!
 * ImgPreviewer v1.0.5
 * https://github.com/yue1123/img-previewer
 *
 * Copyright 2021-present dh
 * Released under the MIT license
 *
 * Date: 2021-12-15T10:05:44.488Z
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImgPreviewer = factory());
})(this, (function () { 'use strict';

    function ImgPreviewer(selector, options) {
        // check use new
        if (!(this instanceof ImgPreviewer)) {
            return console.error(new Error('ImagePreviewerue is a constructor and should be called with the `new` keyword'));
        }
        // check required params is correct incoming
        if (selector && typeof selector === 'string') {
            if (!document.querySelector(selector))
                return console.error(new Error('selector is invalid'));
        }
        else {
            return console.error(new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el'));
        }
        var template = "\n        <div class=\"preview-header\">\n            <div class=\"nums\">\n                <p>\n                    <span id=\"current-index\"></span>\n                    &nbsp;/&nbsp;\n                    <span id=\"total-nums\"></span>\n                </p>\n            </div>\n            <div class=\"tool-btn\">\n                <button id=\"rotate-left\" data-tooltip=\"\u5411\u53F3\u65CB\u8F6C\"><i class=\"iconfont icon-xuanzhuan\"></i></button>\n                <button id=\"rotate-right\" data-tooltip=\"\u5411\u5DE6\u65CB\u8F6C\"><i class=\"iconfont icon-xuanzhuan1\"></i></button>\n                <button id=\"reset\" data-tooltip=\"\u91CD\u7F6E\"><i class=\"iconfont icon-zhongzhi\"></i></button>\n                <button id=\"close\" data-tooltip=\"\u5173\u95ED\"><i class=\"iconfont icon-account-practice-lesson-close\"></i></button>\n            </div>\n        </div>\n        <div class=\"image-container\">\n            <button id=\"prev\" data-tooltip=\"\u4E0A\u4E00\u5F20\"><i class=\"iconfont icon-shangyige\"></i></button>\n            <div class=\"img-content\" id=\"image-content\"><img id=\"preview-image\" src=\"\" alt=\"\" /></div>\n            <button id=\"next\" data-tooltip=\"\u4E0B\u4E00\u5F20\"><i class=\"iconfont icon-xiayige\"></i></button>\n        </div>";
        var defaultOptions = {
            ratio: 0.7,
            zoom: {
                min: 0.1,
                max: 5,
                step: 0.1
            },
            opacity: 0.6,
            scrollbar: false
        };
        var config = {};
        var previewContainer = null;
        var _BODY = document.body || document.getElementsByTagName('body')[0];
        // init methods
        function _init(selector, options) {
            if (options) {
                options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {});
                config = Object.assign({}, defaultOptions, options);
            }
            else {
                config = defaultOptions;
            }
            render();
        }
        function render() {
            var el = document.getElementById('image-preview-container');
            if (!el) {
                previewContainer = document.createElement('div');
                previewContainer.classList.add('image-preview-container');
                previewContainer.id = 'image-preview-container';
                previewContainer.innerHTML = template;
                _BODY.appendChild(previewContainer);
            }
            else {
                previewContainer = el;
            }
        }
        ImgPreviewer.prototype.reset = function () {
            console.log(config, options);
        };
        _init(selector, options);
    }

    return ImgPreviewer;

}));
