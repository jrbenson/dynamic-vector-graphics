import * as parse from '../utils/parse'
import { Data } from '../data/data'
import Component from './component'
import { DVG } from '../dvg'

/**
 * The text component replaces mustache style double brace tags with a value from the data.
 */
export default class TextComponent extends Component {
  template: string | null

  constructor(element: Element) {
    super(element)
    this.template = this.element.textContent

    const svgElem = this.element as SVGGraphicsElement
    const bbox = svgElem.getBBox()
    let anchor = undefined
    let key = parse.firstObjectKey(this.opts, ['align', 'a'])
    if (key) {
      anchor = this.opts[key].toString()
    } else {
      const p = this.element.parentElement
      if (p) {
        const pOpts = parse.syntax(p.id)?.opts
        if (pOpts) {
          key = parse.firstObjectKey(pOpts, ['align', 'a'])
          if (key) {
            anchor = pOpts[key].toString()
          }
        }
      }
    }
    if (anchor !== undefined) {
      svgElem.setAttribute('text-anchor', anchor)
      switch (anchor) {
        case 'start':
          break
        case 'middle':
          svgElem.setAttribute('x', bbox.x + bbox.width / 2 + 'px')
          break
        case 'end':
          svgElem.setAttribute('x', bbox.x + bbox.width + 'px')
          break
      }
    }
  }

  static getDynamics(svg: Element): Array<Component> {
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

  apply(data: Data, dynSVG: DVG) {
    if (this.template) {
      this.element.textContent = this.template.replace(
        parse.RE_DOUBLEBRACE,
        function (match: string) {
          const syntax = parse.syntax(match)
          // const col_id = parse.columnIdentifier(syntax.name)
          //let col
          // if (col_id) {
          //   const [type, index] = col_id
          //   col = data.getColumn(index, type)
          // } else {
          //   col = data.getColumn(syntax.name)
          // }
          const col = parse.columnFromData(syntax.name, data)
          if (col) {
            const nkey = parse.firstObjectKey(syntax.opts, ['name', 'n'])
            if (nkey && syntax.opts[nkey]) {
              return col.name
            } else {
              const ckey = parse.firstObjectKey(syntax.opts, ['compact', 'c'])
              if (ckey && syntax.opts[ckey]) {
                return data.getFormatted(0, col.name, true)
              } else {
                return data.getFormatted(0, col.name)
              }
            }
          } else {
            return '???'
          }
        }.bind({ data: data })
      )
    }
  }
}
