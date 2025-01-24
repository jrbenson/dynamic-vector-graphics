import { getBBox } from '../utils/svg'
import { KEYS } from '../utils/syntax'

export class Guide {
  static keys: string[] = KEYS.guide.both
  element: SVGGraphicsElement
  tag: string = ''
  linear: boolean = true

  /**
   * Creates a new Guide component and instantiates its instance variables using a given element of an SVG
   * @param element
   */
  constructor(element: SVGGraphicsElement) {
    this.element = element
    if (this.element) {
      this.tag = this.element.tagName
      switch (this.tag) {
        case 'polyline':
        case 'path':
          this.linear = false
          break
        default:
          this.linear = true
      }
    }
  }

  /**
   * @param t
   * @returns
   */
  get(t: number) {
    if (this.element) {
      switch (this.tag) {
        case 'polyline':
        case 'path':
        case 'line':
          const geom = this.element as SVGGeometryElement
          let end_length = 0
          try {
            if (isFinite(t)) {
              end_length = geom.getTotalLength() * t
            }
          } catch {}
          let cur_pos = geom.getPointAtLength(end_length)
          let beg_pos = geom.getPointAtLength(0)
          return { x: cur_pos.x - beg_pos.x, y: cur_pos.y - beg_pos.y }
        default:
          const gbox = getBBox(this.element)
          return { x: gbox.width * t, y: gbox.height * t }
      }
    }
    return { x: 0, y: 0 }
  }

  getBBox() {
    return getBBox(this.element)
  }
}
