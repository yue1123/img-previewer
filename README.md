# Img-previewer Js

轻巧且强大的 javascript 图片预览插件,开箱即用,无需多余的配置.适用于任何网页页面,无需改变页面 html 代码结构

提供了常用的功能:

1. 鼠标滚轮缩放图片
2. 图标拖动图片
3. 丝滑的可打断过渡动画
4. 上一张&下一张
5. 快捷键支持
6. 移动端手势(双指放大)支持

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
<script src="https://cdn.jsdelivr.net/npm/img-previewer@1.0.1/dist/img-previewer.min.js"></script>
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

|           | 说明                   | 默认值                                          |
| --------- | ---------------------- | ----------------------------------------------- |
| fillRatio | 图片铺满预览区域的比例 | 0.9(90%)                                        |
| imageZoom | 缩放图片的配置         | {min: 0.1,max: 5,step: 0.1}                     |
| style     | 样式配置               | {modalOpacity: 0.6,headerOpacity: 0,zIndex: 99} |

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
