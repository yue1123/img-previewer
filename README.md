# Img-previewer Js

[![GitHub license](https://img.shields.io/github/license/yue1123/img-previewer?style=flat-square)](https://github.com/yue1123/img-previewer/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yue1123/img-previewer?style=flat-square)](https://github.com/yue1123/img-previewer/stargazers)
<a href="https://www.npmjs.com/package/img-previewer">
<img src="https://img.shields.io/bundlephobia/minzip/img-previewer?color=%234ec820&style=flat-square" alt="npm bundle size">
</a>
<a href="https://github.com/yue1123/img-previewer/releases">
<img src="https://img.shields.io/github/package-json/v/yue1123/img-previewer?color=f90&style=flat-square" alt="GitHub package.json version (subfolder of monorepo)">
</a>

Lightweight and powerful `javascript` image preview plug-in, silky animation allows you to elegantly preview the images in your website. Out of the box, you don't need extra configuration (by default) or change the page `html` code structure, you can easily enable the plugin in any type of website and upgrade your user experience

These functions are provided:

1. Silky, interruptible transition animation
2. Use mouse wheel to zoom picture
3. Icon drag picture
4. Previous & Next
5. Shortcut key support
6. Support for mobile gestures (zoom in with two fingers)
7. Multi-language internationalization support
8. Picture loading monitor

Other languages: [English](./README.md), [简体中文](./README.zh_cn.md).

**tips: For performance reasons, the mobile terminal does not do swiper**

# Example

[Preview](https://yue1123.github.io/img-previewer/demo/index.es.html)

# how to use

### NPM

```bash
npm i img-previewer
# or
yarn add img-previewer
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/img-previewer@2.0.4/dist/img-previewer.min.js"></script>
```

### Enable

```js
//js
import ImgPreviewer from'img-previewer'
//css
import'img-previewer/dist/index.css'

const imgpreviewer = new ImgPreviewer(css selector,{options...})
```

# Property list

|            | Type   | Description                                             | Default Value                                   |
| ---------- | ------ | ------------------------------------------------------- | ----------------------------------------------- |
| fillRatio  | number | The proportion of the image that fills the preview area | 0.9(90%)                                        |
| dataUrlKey | string | The key of the image address value                      | src                                             |
| imageZoom  | object | Zoom image configuration                                | {min: 0.1,max: 5,step: 0.1}                     |
| style      | object | Style configuration                                     | {modalOpacity: 0.6,headerOpacity: 0,zIndex: 99} |
| i18n       | object | tooltips International configuration                    | zh_cn or es                                     |

## options.imageZoom

|      | Description                                    | Default value |
| ---- | ---------------------------------------------- | ------------- |
| min  | Minimum zoom ratio                             | 0.1(10%)      |
| max  | Maximum zoom ratio                             | 5(500%)       |
| step | The change ratio of the scroll wheel each time | 0.1           |

## options.style

|               | Description                    | Default value |
| ------------- | ------------------------------ | ------------- |
| modalOpacity  | Preview area mask transparency | 0.6           |
| headerOpacity | Toolbar transparency           | 0             |
| zIndex        | Level of plug-in rendering     | 99            |

## options.i18n

Simplified Chinese and English are supported by default, others need to be configured by themselves

|              | Description   |
| ------------ | ------------- |
| RESET        | Reset         |
| ROTATE_LEFT  | Rotate Left   |
| ROTATE_RIGHT | Rotate right  |
| CLOSE        | Close preview |
| NEXT         | Next          |
| PREV         | Previous      |

### hot key

| Button | Description   |
| ------ | ------------- |
| Esc    | Close preview |
| <=     | Previous      |
| =>     | Next          |

# Update picture

Some dynamically updated picture lists use

```js
const a = new ImgPreviewer('body')
// Called after the image is rendered on the page
a.update()
```
