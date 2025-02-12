import * as syntax from '../syntax/syntax'
import * as markup from '../syntax/markup'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Component from './component'
import { DVG } from '../dvg'
import { compare, Filter } from '../data/filter'

export default class VisibilityComponent extends Component {
  static getComponent(svg: Element): Array<Component> {
    return markup.elementsWithOptions(svg, markup.KEYS.visibility).map((e) => new VisibilityComponent(e))
  }

  static HIDDEN_VALUES = ['false', 'f', 'no']

  visibiltyFilter: Filter | undefined = undefined
  staticallyHidden: boolean = false

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    // let transProps = svgElem.style.transitionProperty.split(',')
    // transProps.push('visibility')
    // svgElem.style.transitionProperty = transProps.join(',')
    // svgElem.style.transitionDuration = '1s'

    this.intializeContext()
  }

  intializeContext() {
    let key = markup.firstObjectKey(this.opts, markup.KEYS.visibility)
    if (key) {
      this.visibiltyFilter = markup.filter(this.opts[key].toString())
      if (!this.visibiltyFilter) {
        if (VisibilityComponent.HIDDEN_VALUES.includes(this.opts[key].toString())) {
          this.staticallyHidden = true
        }
      }
    }
  }

  apply(data: DataView, dvg: DVG) {
    const svgElem = this.element as SVGGraphicsElement
    if (this.visibiltyFilter && this.visibiltyFilter.condition) {
      const col = markup.columnFromData(this.visibiltyFilter.condition.column, data)
      if (col) {
        const curValue = data.get(0, col.name)
        if (compare(curValue, this.visibiltyFilter.condition.value, this.visibiltyFilter.condition.comparison)) {
          svgElem.style.visibility = 'visible'
        } else {
          svgElem.style.visibility = 'hidden'
        }
      }
    } else if (this.staticallyHidden) {
      svgElem.style.visibility = 'hidden'
    }
  }
}
