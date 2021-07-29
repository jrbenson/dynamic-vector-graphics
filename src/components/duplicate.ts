import * as parse from '../utils/syntax'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Easer from '../utils/easer'
import Component from './component'
import { DVG } from '../dvg'
import { Guide } from './guide'
// import TransformComponent from '../components/transform'
// import StyleComponent from '../components/style'
// import * as comps from '../utils/components'


/**
 * The duplicate component creates a copy of a an element for each value in the data.
 */
export default class DuplicateComponent extends Component {

  // Instance variables
  static keys: string[] = [ 'duplicate', 'd' ]
  guide: Guide | undefined = undefined

  /**
   * Maps each qualified SVGElement of a given SVG to a new DuplicateComponent and
   * retuns an array of the newly mapped DuplicateComponents
   * @param svg - SVG being searched for applicable SVGElements
   * @returns - Array of duplicate components for each SVGElement in DVG
   */
  static getComponent(svg: Element): Array<Component> {
    return parse.elementsWithOptions(svg, DuplicateComponent.keys).map((e) => new DuplicateComponent(e))
  }

  /**
   * Creates a new Duplicate Component from a given SVG Element to manipulate
   * its SVGGraphicsElement.
   * @param element - SVGGraphicsElement to be duplicated
   */
  constructor(element: Element) {
    super(element)

    // Set up component's element for apply() call
    const svgElem = this.element as SVGGraphicsElement
    svg.wrapWithGroup(svgElem)
  }

  /**
   * 
   * @param data 
   * @param dynSVG 
   */
  apply(data: DataView, dynSVG: DVG) {
    if (dynSVG.getComponentsStatus()) {
      //const svgElem = this.element as SVGGraphicsElement
      const svgElem = this.copy(this.element as SVGGraphicsElement)
      console.log(true)
  
      const gkey = parse.firstObjectKey(this.opts, Guide.keys)
      if (gkey && !this.guide) {
        this.guide = new Guide(dynSVG.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
      }
  
      const key = parse.firstObjectKey(this.opts, DuplicateComponent.keys)
      if (key) {
        const col_str = this.opts[key].toString()
        const col = parse.columnFromData(col_str, data)
        
        // if (col?.stats) {
        //   const val = data.get(0, col.name) as number
        //   if (val !== undefined) {   
        //     const norm = (val - col.stats.min) / (col.stats.max - col.stats.min)
        //     style.set(svgElem, norm, svgElem)
        //   }
        // }

        
      }

    }
  }

  /**
   * 
   * Makes a structural copy a given SVG element
   * @param source SVGGraphicElement to be replicated
   * @returns Copy of a given SVGGraphicsElement
   */
  private copy(source: SVGGraphicsElement) {
    // Note that element is wrapped with group when called
    const dest = this.element as Element

    if (!source.children) {
      const attributes = source.getAttributeNames()
      for (let a in attributes) {
        dest.setAttribute(a, source.getAttribute(a) as string) 
      }

      dest.insertAdjacentElement('beforeend', source)
    } else {
      for (let node of source.children) {
        dest.append(this.copy(source.firstElementChild as SVGGraphicsElement))
      }
    }

    return dest;
  }

}
