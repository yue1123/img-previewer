export interface ImgPreviewerOptionsZoom {
    /** minimum zoom ratio */
    min?: number;
    /** maximum zoom ratio, relative to the fitted scale */
    max?: number;
    /** zoom ratio change per wheel tick */
    step?: number;
}
export interface ImgPreviewerOptionsStyle {
    /** backdrop opacity */
    modalOpacity?: number;
    /** toolbar background opacity */
    headerOpacity?: number;
    zIndex?: number;
}
export interface Ii18n {
    RESET: string;
    ROTATE_LEFT: string;
    ROTATE_RIGHT: string;
    CLOSE: string;
    NEXT: string;
    PREV: string;
    ZOOM_IN?: string;
    ZOOM_OUT?: string;
}
export interface ImgPreviewerHookContext {
    /** index of the image in the list */
    index: number;
    /** the original image element on the page */
    img: HTMLImageElement;
}
export interface ImgPreviewerChangeContext extends ImgPreviewerHookContext {
    /** index of the previous image */
    prevIndex: number;
}
export interface ImgPreviewerOptions {
    /** the proportion of the viewport the image fills */
    fillRatio?: number;
    /** attribute that holds the (large) image url, falls back to `src` */
    dataUrlKey?: string;
    triggerEvent?: 'click' | 'dblclick';
    imageZoom?: ImgPreviewerOptionsZoom;
    style?: ImgPreviewerOptionsStyle;
    i18n?: Ii18n;
    /** levels to look up when checking whether the image is hidden by css */
    bubblingLevel?: number;
    /** hide the original image on the page while it is being previewed */
    hideOriginal?: boolean;
    /** show the toolbar, when `false` only the close and prev/next buttons are shown */
    toolbar?: boolean;
    /** duration of the open and close animations in ms, image switching and zooming are scaled by it */
    duration?: number;
    /** before the previewer opens, return `false` to cancel */
    onBeforeShow?: (context: ImgPreviewerHookContext) => boolean | void;
    /** the previewer starts opening */
    onShow?: (context: ImgPreviewerHookContext) => void;
    /** the open animation finished */
    onShown?: (context: ImgPreviewerHookContext) => void;
    /** switched to another image while open */
    onChange?: (context: ImgPreviewerChangeContext) => void;
    /** before the previewer closes, return `false` to cancel */
    onBeforeHide?: (context: ImgPreviewerHookContext) => boolean | void;
    /** the previewer starts closing */
    onHide?: (context: ImgPreviewerHookContext) => void;
    /** alias of `onHide` */
    onClose?: (context: ImgPreviewerHookContext) => void;
    /** the close animation finished */
    onHidden?: (context: ImgPreviewerHookContext) => void;
}
export interface ResolvedOptions extends Omit<ImgPreviewerOptions, 'imageZoom' | 'style'> {
    fillRatio: number;
    dataUrlKey: string;
    triggerEvent: 'click' | 'dblclick';
    bubblingLevel: number;
    hideOriginal: boolean;
    toolbar: boolean;
    duration: number;
    imageZoom: Required<ImgPreviewerOptionsZoom>;
    style: Required<ImgPreviewerOptionsStyle>;
}
