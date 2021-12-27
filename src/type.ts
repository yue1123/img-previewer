// export interface IImagePreviewer {
// 	_init: () => void
// }

export interface ImgPreviewerOptionsZoom {
    min?: number
    max?: number
    step?: number
}
export interface ImgPreviewerOptions {
    fillRatio?: number
    // scrollBar?: boolean
    // onInited?: () => void
    imageZoom?: ImgPreviewerOptionsZoom
    i18n?: object,
    style?: {
        modalOpacity: number,
        headerOpacity: number,
        zIndex: number
    }
}

export interface runtimeStore {
    rootEl: null | HTMLElement
    container: null | HTMLElement
    imgList: HTMLImageElement[]
    totalIndex: number
    index: number
    width: number
    height: number
    currentImgElement: null | HTMLImageElement
    startX: number
    startY: number
    endX: number
    endY: number
    scale: number
    _scale: number
    rotate: number
    currentClickEl: null | HTMLImageElement
}

export type objectKeyOnlyCss = {
    [k in keyof CSSStyleDeclaration]?: any
}
