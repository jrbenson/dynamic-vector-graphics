import * as parse from '../utils/syntax'
import { DataView } from '../data/data'
import Component from './component'
import { DVG } from '../dvg'
import { getBBox } from '../utils/svg'
import { FORMAT_FAIL_OUTPUT } from '../data/formats'

/**
 * The text component replaces mustache style double brace tags with a value from the data.
 */
export default class TextComponent extends Component {
  template: string | null
  initialX: number
  initialY: number
  anchor: string | undefined

  constructor(element: Element) {
    super(element)
    this.template = this.element.textContent

    const svgElem = this.element as SVGGraphicsElement
    const bbox = getBBox(svgElem)
    this.initialX = bbox.x
    this.initialY = bbox.y

    this.setAnchor()
    this.setOffset()
  }

  private setAnchor() {
    const svgElem = this.element as SVGGraphicsElement
    this.anchor = parse.textAlignmentForElement(svgElem)
    if (this.anchor !== undefined) {
      svgElem.setAttribute('text-anchor', this.anchor)
    }
  }

  private setOffset() {
    const svgElem = this.element as SVGGraphicsElement
    const bbox = getBBox(svgElem)
    if (this.anchor !== undefined) {
      switch (this.anchor) {
        case 'start':
          break
        case 'middle':
          svgElem.setAttribute('x', this.initialX + bbox.width / 2 + 'px')
          break
        case 'end':
          svgElem.setAttribute('x', this.initialX + bbox.width + 'px')
          break
      }
    }
  }

  static getComponent(svg: Element): Array<Component> {
    let elems: Array<Element> = []
    svg.querySelectorAll('text').forEach(function (text) {
      if (text.children.length) {
        elems.push(...text.children)
      } else {
        elems.push(text)
      }
    })
    elems = elems.filter((e) => e.textContent && e.textContent.match(parse.RE_DOUBLEBRACE))
    return elems.map((e) => new TextComponent(e))
  }

  apply(data: DataView, dynSVG: DVG) {
    this.element.textContent = this.template
    this.setOffset()
    if (this.template) {
      this.element.textContent = this.template.replace(
        parse.RE_DOUBLEBRACE,
        function (match: string) {
          const syntax = parse.markup(match)
          const col = parse.columnFromData(syntax.name, data)
          if (col) {
            const nkey = parse.firstObjectKey(syntax.opts, ['name', 'n'])
            const rkey = parse.firstObjectKey(syntax.opts, ['range', 'r'])
            if (nkey && syntax.opts[nkey]) {
              return col.name
            } else if (rkey) {
              let ratio = 1.0
              if (syntax.opts[rkey] !== undefined) {
                ratio = Number(syntax.opts[rkey])
                const format = data.getColumnFormat(col.name)
                const min = data.min(col.name)
                const max = data.max(col.name)
                if (min !== undefined && max !== undefined) {
                  const value = min + ratio * (max - min)
                  let str_value
                  const ckey = parse.firstObjectKey(syntax.opts, ['compact', 'c'])
                  if (ckey && syntax.opts[ckey]) {
                    str_value = format.compactFormat(value)
                  } else {
                    str_value = format.format(value)
                  }
                  if (str_value !== undefined) {
                    return str_value
                  }
                }
              }
              return FORMAT_FAIL_OUTPUT
            } else {
              const ckey = parse.firstObjectKey(syntax.opts, ['compact', 'c'])
              if (ckey && syntax.opts[ckey]) {
                return data.getFormatted(0, col.name, true)
              } else {
                return data.getFormatted(0, col.name)
              }
            }
          } else {
            return FORMAT_FAIL_OUTPUT
          }
        }.bind({ data: data })
      )
    }
  }
}
