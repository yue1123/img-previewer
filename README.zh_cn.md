# Img-previewer Js

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
<script src="https://cdn.jsdelivr.net/npm/img-previewer@2.0.4/dist/img-previewer.min.js"></script>
```

### 启用

```js
//js
import ImgPreviewer from 'img-previewer'
//css
import 'img-previewer/dist/index.css'

const imgpreviewer = new ImgPreviewer(css selector,{options...})
```

# 属性列表

|            | 类型   | 说明                   | 默认值                                          |
| ---------- | ------ | ---------------------- | ----------------------------------------------- |
| fillRatio  | number | 图片铺满预览区域的比例 | 0.9(90%)                                        |
| dataUrlKey | string | 图片地址取值的 key     | src                                             |
| imageZoom  | object | 缩放图片的配置         | {min: 0.1,max: 5,step: 0.1}                     |
| style      | object | 样式配置               | {modalOpacity: 0.6,headerOpacity: 0,zIndex: 99} |
| i18n       | object | tooltips 国际化配置    | zh_cn 或者 es                                   |

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
| | 说明 |
| ------------ | -------- |
| RESET | 重置 |
| ROTATE_LEFT | 左旋转 |
| ROTATE_RIGHT | 右旋转 |
| CLOSE | 关闭预览 |
| NEXT | 下一张 |
| PREV | 上一张 |

### 快捷键

| 按键 | 说明     |
| ---- | -------- |
| Esc  | 关闭预览 |
| <=   | 上一张   |
| =>   | 下一张   |

# 更新图片

一些动态更新图片列表使用

```js
const a = new ImgPreviewer('body')
// 图片渲染到页面后调用
a.update()
```
