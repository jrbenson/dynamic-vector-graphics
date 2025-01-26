import * as parse from '../utils/syntax'
import { DataView } from '../data/data'
import { DVG } from '../dvg'
import { Filter } from '../data/filter'
import { Unifier } from './unifier'

/**
 * Base class for components, which are called during update to apply data to the SVG.
 */
export default class Component {
  element: Element
  opts: Record<string, string | number | boolean>
  filters: Filter[] = []
  unifiers: Unifier[] = []

  /**
   * Override with dynamic specific parsing and precomputation.
   * @param element The SVG element that the dynamic will act on.
   */
  constructor(element: Element) {
    this.element = element
    this.opts = parse.getMarkup(element).opts
    this.filters = parse.filtersForElement(this.element)
  }

  /** CHANGE: Renamed to clarify that each component is retrieved by this
   * method individually even though it returns an array
   *
   * Override with static method for selecting viable elements for this dynamic from SVG.
   * @param svg The root SVG element to start the search from.
   * @return Array of components that match the desired pattern.
   */
  static getComponent(svg: Element): Array<Component> {
    return []
  }

  /**
   * Override with element
   * @param data
   * @param state
   */
  apply(data: DataView, state: DVG) {}

  /**
   *
   * @param state
   */
  draw(state: DVG) {}

  getUnifierByColumn(column: string) {
    return this.unifiers.find((u) => u.cols.includes(column))
  }

  getKeyAndAdjustedValue(keys: string[], data: DataView): [string | undefined, number | undefined] {
    const key = parse.firstObjectKey(this.opts, keys)
    if (key) {
      const col_str = this.opts[key].toString()
      const col = parse.columnFromData(col_str, data)
      if (col?.stats) {
        let norm = data.getNormalized(0, col.name) as number
        const unifier = this.getUnifierByColumn(col_str)
        if (unifier) {
          norm = unifier.adjustNorm(norm)
        }
        return [key, norm]
      }
    }
    return [key, undefined]
  }
}
