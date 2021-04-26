import * as parse from '../utils/parse'
import { DataView } from '../data/data'
import { DVG } from '../dvg'
import { Filter } from "../data/filter"




/**
 * Base class for components, which are called during update to apply data to the SVG.
 */
export default class Component {
  element: Element
  opts: Record<string, string | number | boolean>
  filters: Filter[] = []

  /**
   * Override with dynamic specific parsing and precomputation.
   * @param element The SVG element that the dynamic will act on.
   */
  constructor(element: Element) {
    this.element = element
    this.opts = parse.syntax(element.id).opts
    this.filters = parse.filtersForElement( this.element )
  }

  /**
   * Override with static method for selecting viable elements for this dynamic from SVG.
   * @param svg The root SVG element to start the search from.
   * @return Array of components that match the desired pattern.
   */
  static getComponents(svg: Element): Array<Component> {
    return []
  }

  apply(data: DataView, state: DVG ) {}

  draw(state: DVG ) {}
}





