
interface ImgPreviewer {
	/**
	 * update image els
	 */
	update: () => void
	/**
	 * get total image el numbers
	 */
	getTotalIndex: () => number
	/**
	 * show index image 
	 * @param {number} index
	 */
	show: (index: number) => void
	/**
	 * goto next
	 */
	next: () => void
	/**
	 * goto prev
	 */
	prev: () => void
}

declare const ImgPreviewer: {
	/**
	 * update image els
	 */
	update: () => void
	/**
	 * get total image el numbers
	 */
	getTotalIndex: () => number
	/**
	 * show index image
	 * @param {number} index
	 */
	show: (index: number) => void
	/**
	 * goto next
	 */
	next: () => void
	/**
	 * goto prev
	 */
	prev: () => void
	new (selector: string, options?: ImgPreviewerOptions): ImgPreviewer
}

export interface ImgPreviewerOptionsZoom {
    min?: number
    max?: number
    step?: number
}
export interface Ii18n {
    RESET: string,
    ROTATE_LEFT: string,
    ROTATE_RIGHT: string,
    CLOSE: string,
    NEXT: string,
    PREV: string
}


export interface ImgPreviewerOptions {
	fillRatio?: number
	imageZoom?: ImgPreviewerOptionsZoom
	i18n?: Ii18n
	style?: {
		modalOpacity: number
		headerOpacity: number
		zIndex: number
	}
	bubblingLevel: number
	onShow: () => void
	onClose: () => void
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
export default ImgPreviewer