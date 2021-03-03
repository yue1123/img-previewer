# img-previewer

小巧且易用的 javascript 图片预览插件,开箱即用,无需多余的配置.适用于任何网页页面,无需改变页面html代码结构

功能:

1. 鼠标滚轮缩放图片
2. 图标拖动图片
3. 流畅的过渡动画
4. 上一张&下一张

# demo

[预览](https://yue1123.github.io/img-previewer/demo/)

# 快速使用

```js
const a = new ImgPreviewer('body')
```

# options

|           | 说明                   | 默认值                      |
| --------- | ---------------------- | --------------------------- |
| ratio     | 图片铺满预览区域的比例 | 0.9(90%)                    |
| scrollbar | 是否自动隐藏滚动条     | false                       |
| zoom      | 缩放图片的配置         | {min: 0.1,max: 5,step: 0.1} |
| onInited  | 初始化完成后触发事件   | -                           |

## options.zoom

|      | 说明                   | 默认值   |
| ---- | ---------------------- | -------- |
| min  | 最小缩放比例           | 0.1(10%) |
| max  | 最大缩放比例           | 5(500%)  |
| step | 滚轮每次滚动变化的比例 | 0.1      |

# 更新图片

一些动态更新图片列表使用

```js
const a = new ImgPreviewer('body', {
	scrollbar: true
})
//
a.update()
```
