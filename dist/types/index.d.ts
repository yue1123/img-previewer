import type { ImgPreviewerOptions } from './types';
export type { ImgPreviewerOptions, ImgPreviewerOptionsZoom, ImgPreviewerOptionsStyle, ImgPreviewerHookContext, ImgPreviewerChangeContext, Ii18n } from './types';
declare class ImgPreviewer {
    static version: string;
    version: string;
    private options;
    private rootEl;
    private container;
    private wrapper;
    private currentItem;
    private currentImg;
    private currentIndexEl;
    private totalIndexEl;
    private prevButton;
    private nextButton;
    private imgList;
    private index;
    private currentClickEl;
    private hiddenEl;
    private hiddenElVisibility;
    private width;
    private height;
    private startX;
    private startY;
    private scale;
    private baseScale;
    private rotate;
    private isOpen;
    private openId;
    private isAnimating;
    private movable;
    private disposers;
    constructor(selector: string, options?: ImgPreviewerOptions);
    /** re-collect image elements under the root element */
    update(): void;
    /** index of the last image */
    getTotalIndex(): number;
    /** show the image at index */
    show(index: number): void;
    next(): void;
    prev(): void;
    /** close the previewer */
    hide(): void;
    /** remove all listeners and DOM created by this instance */
    destroy(): void;
    private render;
    private on;
    private bindEvents;
    private bindDrag;
    private bindTouch;
    private handleAction;
    private setIndex;
    private setScale;
    private zoomTo;
    private setRotate;
    private placeAtStart;
    private layout;
    private hideOriginal;
    private restoreOriginal;
    private context;
    private getImageSrc;
    private watchLoading;
    private open;
    private slideTo;
}
export default ImgPreviewer;
