// bundle entry: pulls in the stylesheet so rollup can extract dist/index.css,
// while keeping the less import out of the published type declarations
import './index.less'

export { default } from './index'
