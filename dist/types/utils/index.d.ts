export declare function debounce<T>(fn: (arg: T) => void, delay: number): (arg: T) => void;
export declare function preventDefault(e: Event): void;
export declare function clamp(value: number, min: number, max: number): number;
/**
 * check element is not hidden by css
 * @param el check el
 * @param bubblingLevel The level to look up from the current element
 * @returns {boolean}
 */
export declare function isElementVisibleByCss(el: Element | null, bubblingLevel: number): boolean;
/**
 * 判断一个元素是否出现在当前视口中
 * @param el 要判断的元素
 * @returns {boolean}
 */
export declare function isElementInViewport(el: Element | null, bubblingLevel: number): boolean;
/**
 * 计算让 (width, height) 以 ratio 比例填充 (containerWidth, containerHeight) 的缩放值
 */
export declare function getFitScale(containerWidth: number, width: number, containerHeight: number, height: number, ratio: number): number;
export declare function nextTick(fn: () => void): void;
export declare function setStyle(el: HTMLElement, styleObj: Partial<Record<'top' | 'left' | 'width' | 'height', string>>): void;
export declare function setProperties(el: HTMLElement, properties: Record<string, string>): void;
/**
 * run fn once when the transition/animation ends, with a timeout fallback
 * in case the event never fires (e.g. nothing actually changed)
 */
export declare function onceEnd(el: HTMLElement, type: 'transitionend' | 'animationend', fn: () => void, timeout?: number): void;
export declare function lockScroll(): () => void;
