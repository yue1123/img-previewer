/**
 * {
 *   start:10,
 *   end:10,
 *   step:1,
 *   style:'font-size'
 *   template:'$px'
 * }
 */

interface Ioptions {
    start: number,
    end: number,
    step: number,
    styleAttr: string,
    template: string
}

export default function runAnimation(el: any, options: Ioptions, callback: () => void): void {
    const requestAnimationFrame: (callback: FrameRequestCallback) => number = window.requestAnimationFrame
    const cancelAnimationFrame: ((handle: number) => void) & ((handle: number) => void) = window.cancelAnimationFrame
    let start: Ioptions['start'] = options.start || 0
    let end: Ioptions['end'] = options.end || 0
    let step: Ioptions['step'] = options.step
    let playing: number = 0
    let styleAttr: Ioptions['styleAttr'] = options.styleAttr
    let template: Ioptions['template'] = options.template
    function running() {
        if ((step > 0 && start < end) || (step < 0 && start > end)) {
            start += step
            el.style[styleAttr] = template.replace('$', String(step))
            playing = requestAnimationFrame(running)
        } else {
            callback && callback()
            cancelAnimationFrame(playing)
        }
    }
    running()
}
