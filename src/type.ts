export interface IImagePreviewer {
    _init: () => void
}

export interface ImgPreviewerOptionsZoom {
    min?: number,
    max?: number,
    step?: number
}
export interface ImgPreviewerOptions {
    ratio?: number,
    opacity?: number,
    scrollBar?: boolean,
    onInited?: () => void,
    zoom?: ImgPreviewerOptionsZoom,
    i18n?: object
}


export interface runtimeStore {
    rootEl: null | HTMLElement,
    container: null | HTMLElement,
    imgEls: NodeList | undefined,
    index: number,
    currentImgElement: null | HTMLImageElement,
    startX: number
    startY: number
    endX: number
    endY: number
    scale: number,
    rotate: number,
    currentClickEl: null | HTMLImageElement,
}


export type objectKeyOnlyCss = {
    [k in keyof CSSStyleDeclaration]?: any
}