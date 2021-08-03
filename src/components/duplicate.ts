import * as parse from '../utils/syntax'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Component from './component'
import { DVG } from '../dvg'
import { Guide } from './guide'
import { v4 as uuidv4 } from 'uuid'

import TextComponent from '../components/text'
import TransformComponent from '../components/transform'
import StyleComponent from '../components/style'

/**
 * The duplicate component creates a copy of a an element for each value in the data.
 */
export default class DuplicateComponent extends Component {
  // Instance variables
  static keys: string[] = ['duplicate', 'duplicateX', 'duplicateY', 'd', 'dx', 'dy']

  guide: Guide | undefined = undefined

  private template: string = ''
  private duplicates: SVGElement[] = []
  private uuid: string = uuidv4()

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
    this.template = svgElem.innerHTML
  }

  /**
   *
   * @param data
   * @param dynSVG
   */
  apply(data: DataView, dvg: DVG) {
    const svgElem = this.element as SVGGraphicsElement

    const gkey = parse.firstObjectKey(this.opts, Guide.keys)
    if (gkey && !this.guide) {
      this.guide = new Guide(dvg.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    }

    // Clear existing duplicate content
    svgElem.innerHTML = ''
    dvg.removeComponents(this.uuid)

    // Create duplicates by iterating through unique values
    const key = parse.firstObjectKey(this.opts, DuplicateComponent.keys)
    if (key) {
      const col_str = this.opts[key].toString()
      const col = parse.columnFromData(col_str, data)
      if (col) {
        const vals = data.unique(col.name)
        let index = 0
        for (let val of vals) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          group.id = `{{f:${col.name}=${val}}}`
          group.innerHTML = this.template
          if (this.guide) {
            const coord = this.guide.get(index / (vals.length - 1))
            switch (key) {
              case 'duplicateX':
              case 'dx':
                group.style.transform = `translateX(${coord.x}px)`
                break
              case 'duplicateY':
              case 'dy':
                group.style.transform = `translateY(${coord.y}px)`
                break
              default:
                group.style.transform = `translate(${coord.x}px,${coord.y}px)`
                break
            }
          }
          this.element.append(group)
          index += 1
        }
      }
    }

    // Run component addition and tag with uuid, should probably abstract this set eventually.
    dvg.addComponents(TextComponent.getComponent(this.element), ['text', this.uuid])
    dvg.addComponents(TransformComponent.getComponent(this.element), ['transform', this.uuid])
    dvg.addComponents(StyleComponent.getComponent(this.element), ['style', this.uuid])

    
    //   const svgElem = this.copy(this.element as SVGGraphicsElement)
    //   console.log(true)

    //   const key = parse.firstObjectKey(this.opts, DuplicateComponent.keys)
    //   if (key) {
    //     const col_str = this.opts[key].toString()
    //     const col = parse.columnFromData(col_str, data)

    //   if (col?.stats) {
    //     const val = data.get(0, col.name) as number
    //     if (val !== undefined) {
    //       const norm = (val - col.stats.min) / (col.stats.max - col.stats.min)
    //       style.set(svgElem, norm, svgElem)
    //     }
    //   }
  
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

    return dest
  }
}
