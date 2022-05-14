# Img-previewer Js

[![GitHub license](https://img.shields.io/github/license/yue1123/img-previewer?style=flat-square)](https://github.com/yue1123/img-previewer/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yue1123/img-previewer?style=flat-square)](https://github.com/yue1123/img-previewer/stargazers)
<a href="https://www.npmjs.com/package/img-previewer">
<img src="https://img.shields.io/bundlephobia/minzip/img-previewer?color=%234ec820&style=flat-square" alt="npm bundle size">
</a>
<a href="https://github.com/yue1123/img-previewer/releases">
<img src="https://img.shields.io/github/package-json/v/yue1123/img-previewer?color=f90&style=flat-square" alt="GitHub package.json version (subfolder of monorepo)">
</a>

轻量且强大的 `javascript` 图片预览插件,丝滑的动画让你可以优雅的预览你的网站中的图片。开箱即用,你无需多余的配置(默认情况下)或改变页面 `html` 代码结构,即可在任何类型的网站中轻松启用该插件,升级你的用户体验

提供了这些功能:

1. 丝滑的可打断过渡动画
2. 鼠标滚轮缩放图片
3. 图标拖动图片
4. 上一张&下一张
5. 快捷键支持
6. 移动端手势(双指放大)支持
7. 多语言国际化支持
8. 图片加载监听

其他语言: [English](./README.md), [简体中文](./README.zh_cn.md).

**tips: 出于性能考虑,移动端没有做 swiper**

# 示例

[预览](https://yue1123.github.io/img-previewer/demo/)

# 如何使用

### NPM

```bash
npm i img-previewer
# 或者
yarn add img-previewer
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/img-previewer@2.1.6/dist/img-previewer.min.js"></script>
```

### 启用

```js
//js
import ImgPreviewer from 'img-previewer'
//css
import 'img-previewer/dist/index.css'

const imgPreviewer = new ImgPreviewer(css selector,{options...})
```

# 属性列表

|               | 类型   | 说明                                        | 默认值                                          |
| ------------- | ------ | ------------------------------------------- | ----------------------------------------------- |
| fillRatio     | number | 图片铺满预览区域的比例                      | 0.9(90%)                                        |
| dataUrlKey    | string | 图片地址取值的 key                          | src                                             |
| triggerEvent  | string | 触发事件                                    | click                                           |
| imageZoom     | object | 缩放图片的配置                              | {min: 0.1,max: 5,step: 0.1}                     |
| style         | object | 样式配置                                    | {modalOpacity: 0.6,headerOpacity: 0,zIndex: 99} |
| i18n          | object | tooltips 国际化配置                         | null                                            |
| bubblingLevel | number | 冒泡检测图片父元素是否被 css 样式隐藏的层级 | 0                                               |

> triggerEvent 的可选值有: click 和 dblclick
## bubblingLevel 说明

当你察觉到图片隐藏动画异常时,你应该尝试使用该属性。因为图片或图片父元素被某些 css 样式隐藏时,通过 js 的 api 是无法检测到的,所以需要自己根据实际情况,传入正确的向上查找层级来帮助插件完成正确的隐藏动画。如下所示,正确的 bubblingLevel 至少是 3

**为了性能考虑,不建议随意填写该属性值**

```html
<div style="opacity:0">
	<!-- 3 -->
	<div>
		<!-- 2 -->
		<img src="" alt="" />
		<!-- 1 -->
	</div>
</div>
```

**注意:**
目前检测元素或父元素被 css 样式隐藏只支持以下样式:

- opacity: 0;
- height: 0;
- width: 0;
- visibility: hidden;

## options.imageZoom

|      | 说明                   | 默认值   |
| ---- | ---------------------- | -------- |
| min  | 最小缩放比例           | 0.1(10%) |
| max  | 最大缩放比例           | 5(500%)  |
| step | 滚轮每次滚动变化的比例 | 0.1      |

## options.style

|               | 说明               | 默认值 |
| ------------- | ------------------ | ------ |
| modalOpacity  | 预览区域蒙版透明度 | 0.6    |
| headerOpacity | 工具栏透明度       | 0      |
| zIndex        | 插件渲染的层级     | 99     |

## options.i18n

默认支持简体中文和英语,其他的需要自行配置
|              | 说明     |
| ------------ | -------- |
| RESET        | 重置     |
| ROTATE_LEFT  | 左旋转   |
| ROTATE_RIGHT | 右旋转   |
| CLOSE        | 关闭预览 |
| NEXT         | 下一张   |
| PREV         | 上一张   |

## 实例方法

|                    | Description          |
| ------------------ | -------------------- |
| update()           | 更新图片             |
| getTotalIndex()    | 获取实例预览图片张数 |
| show(index:number) | 显示                 |
| next()             | 下一张               |
| prev()             | 上一张               |

### 快捷键

| 按键 | 说明     |
| ---- | -------- |
| Esc  | 关闭预览 |
| <=   | 上一张   |
| =>   | 下一张   |

# 更新图片

一些动态更新图片列表使用

```js
const imgPreviewer = new ImgPreviewer('body')
// 图片渲染到页面后调用
imgPreviewer.update()
```

# 幻灯片

```js
let timer = null
function play() {
	timer && clearInterval(timer)
	let index = 0
	a.show(index)
	timer = setInterval(() => {
		if (index < a.getTotalIndex()) {
			index++
		} else {
			index = 0
		}
		a.show(index)
	}, 2000)
}
play()
```
