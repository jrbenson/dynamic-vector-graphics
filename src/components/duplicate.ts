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
import { SYNTAX_ATTRIBUTE } from '../utils/syntax'
import VisibilityComponent from './visibilty'

/**
 * The duplicate component creates a copy of a an element for each value in the data.
 */
export default class DuplicateComponent extends Component {
  // Instance variables
  static keys: string[] = [
    'duplicate',
    'duplicateX',
    'duplicateY',
    'duplicateWrap',
    'duplicateSlots',
    'd',
    'dx',
    'dy',
    'dw',
    'ds',
  ]

  guide: Guide | undefined = undefined

  private template: string = ''
  private tileLayout: { x: number; y: number }[] = []
  private duplicates: SVGElement[] = []
  private uuid: string = uuidv4()

  private guideBounds: DOMRect | undefined = undefined
  private templateBounds: DOMRect | undefined = undefined

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

    if (!this.guideBounds && this.guide) {
      this.guideBounds = this.guide.getBBox()
    }
    if (!this.templateBounds) {
      this.templateBounds = svg.getBBox(svgElem)
    }

    let justify = 'start'
    const justifyKey = parse.firstObjectKey(this.opts, ['justify', 'j'])
    if (justifyKey) {
      justify = this.opts[justifyKey].toString()
    }

    const slotLayout = this.getSlotLayout(this.guide)
    // console.log(slotLayout)

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
        if (this.guideBounds && this.templateBounds) {
          this.tileLayout = this.getWrappedLayout(this.guideBounds, this.templateBounds, vals.length, justify)
        }
        for (let val of vals) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          group.setAttribute(SYNTAX_ATTRIBUTE, `{{f:${col.name}=${val}}}`)
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
              case 'duplicateWrap':
              case 'dw':
                if (this.tileLayout.length > index) {
                  group.style.transform = `translate(${this.tileLayout[index].x}px,${this.tileLayout[index].y}px)`
                }
                break
              case 'duplicateSlots':
              case 'ds':
                if (slotLayout.length > index) {
                  group.style.transform = `translate(${slotLayout[index].x}px,${slotLayout[index].y}px)`
                }
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
    dvg.addComponents(VisibilityComponent.getComponent(this.element), ['visibility', this.uuid])
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

  private getWrappedLayout(
    boundsRect: DOMRect,
    itemRect: DOMRect,
    totalItems: number,
    justifyItems: string = 'start',
    justifyRows: string = 'start'
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []

    let perRow = Math.floor(boundsRect.width / itemRect.width)
    if (perRow === 0) {
      perRow = 1
    }
    let rows = Math.floor(boundsRect.height / itemRect.height)
    if (totalItems <= perRow) {
      rows = 1
    } else {
      rows = Math.ceil(totalItems / perRow)
    }

    let itemsInLastRow = totalItems % perRow
    if (itemsInLastRow === 0) {
      itemsInLastRow = perRow
    }
    // console.log(boundsRect.width, itemRect.width, boundsRect.width / itemRect.width, perRow)
    // console.log(perRow, rows, itemsInLastRow)

    function getOffsetAndGap(items: number, justify: string) {
      let offset = 0
      let gap = 0
      switch (justify) {
        case 'middle':
          offset = (boundsRect.width - items * itemRect.width) / 2
          break
        case 'end':
          offset = boundsRect.width - items * itemRect.width
          break
        case 'between':
          gap = (boundsRect.width - items * itemRect.width) / (items - 1)
          break
        case 'around':
          gap = (boundsRect.width - items * itemRect.width) / items
          offset = gap / 2
          break
        case 'evenly':
          gap = (boundsRect.width - items * itemRect.width) / (items + 1)
          offset = gap
          break
      }
      return { inRowOffset: offset, inRowGap: gap }
    }

    for (let row = 0; row < rows; row++) {
      let items = perRow
      if (row === rows - 1) {
        items = itemsInLastRow
      }
      const { inRowOffset, inRowGap } = getOffsetAndGap(items, justifyItems)
      for (let col = 0; col < perRow; col++) {
        const x = inRowOffset + col * itemRect.width + col * inRowGap
        const y = row * itemRect.height

        positions.push({ x, y })
      }
    }

    // console.log(justifyItems, positions)

    return positions
  }

  private getSlotLayout(guide: Guide | undefined): { x: number; y: number }[] {
    const slots: { x: number; y: number }[] = []
    if (guide) {
      const guideBox = guide.getBBox()
      for (let i = 0; i < guide.element.children.length; i++) {
        const child = guide.element.children[i] as SVGGraphicsElement
        const bbox = child.getBBox()
        slots.push({ x: bbox.x - guideBox.x, y: bbox.y - guideBox.y })
      }
    }
    return slots
  }
}
