export interface ImgPreviewerOptionsZoom {
	/** minimum zoom ratio */
	min?: number
	/** maximum zoom ratio, relative to the fitted scale */
	max?: number
	/** zoom ratio change per wheel tick */
	step?: number
}

export interface ImgPreviewerOptionsStyle {
	/** backdrop opacity */
	modalOpacity?: number
	/** toolbar background opacity */
	headerOpacity?: number
	zIndex?: number
}

export interface Ii18n {
	RESET: string
	ROTATE_LEFT: string
	ROTATE_RIGHT: string
	CLOSE: string
	NEXT: string
	PREV: string
	ZOOM_IN?: string
	ZOOM_OUT?: string
}

export interface ImgPreviewerOptions {
	/** the proportion of the viewport the image fills */
	fillRatio?: number
	/** attribute that holds the (large) image url, falls back to `src` */
	dataUrlKey?: string
	triggerEvent?: 'click' | 'dblclick'
	imageZoom?: ImgPreviewerOptionsZoom
	style?: ImgPreviewerOptionsStyle
	i18n?: Ii18n
	/** levels to look up when checking whether the image is hidden by css */
	bubblingLevel?: number
	/** hide the original image on the page while it is being previewed */
	hideOriginal?: boolean
	onShow?: () => void
	onHide?: () => void
	/** alias of `onHide` */
	onClose?: () => void
}

export interface ResolvedOptions extends Omit<ImgPreviewerOptions, 'imageZoom' | 'style'> {
	fillRatio: number
	dataUrlKey: string
	triggerEvent: 'click' | 'dblclick'
	bubblingLevel: number
	hideOriginal: boolean
	imageZoom: Required<ImgPreviewerOptionsZoom>
	style: Required<ImgPreviewerOptionsStyle>
}
