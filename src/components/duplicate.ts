import * as parse from '../utils/parse'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Easer from '../utils/easer'
import Component from './component'
import { DVG } from '../dvg'
import { Guide } from './guide'



/**
 * The duplicate component creates a copy of a an element for each value in the data.
 */
export default class DuplicateComponent extends Component {

  static keys: string[] = [ 'duplicate', 'd' ]
  static getComponents(svg: Element): Array<Component> {
    return parse.elementsWithOptions(svg, DuplicateComponent.keys).map((e) => new DuplicateComponent(e))
  }

  guide: Guide | undefined = undefined

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    svg.wrapWithGroup(svgElem)
  }

  apply(data: DataView, dynSVG: DVG) {
    const svgElem = this.element as SVGGraphicsElement

    const gkey = parse.firstObjectKey(this.opts, Guide.keys)
    if (gkey && !this.guide) {
      this.guide = new Guide(dynSVG.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    }

      const key = parse.firstObjectKey(this.opts, DuplicateComponent.keys)
      if (key) {
        const col_str = this.opts[key].toString()
        const col = parse.columnFromData(col_str, data)
      }

  }
}
