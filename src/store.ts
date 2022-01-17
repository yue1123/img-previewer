import type { runtimeStore } from '../type.d'
function createStore(): runtimeStore {
    return {
        rootEl: null,
        container: null,
        imgList: [],
        currentImgElement: null,
        totalIndex: 0,
        index: 0,
        width: 0,
        height: 0,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        scale: 0,
        _scale: 0,
        rotate: 0,
        currentClickEl: null
    }
}
export default createStore