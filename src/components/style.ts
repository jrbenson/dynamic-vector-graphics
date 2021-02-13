import * as parse from '../utils/parse'
import * as svg from '../utils/svg'
import { Data } from '../data/data'
import Easer from '../utils/easer'
import Component from './component'
import { DVG } from '../dvg'

interface Style {
  keys: Array<string>
  set: (e: SVGGraphicsElement, t: number, dynStyle: StyleComponent) => void
}

export default class StyleComponent extends Component {
  static styles: Array<Style> = [
    {
      keys: ['fill', 'f'],
      set: function (e, t, dynStyle) {
        e.style.fill = '#ff0000'
      },
    },
    {
      keys: ['line', 'l'],
      set: function (e, t, dynStyle) {
        e.style.stroke = '#ff0000'
      },
    },
    {
      keys: ['alpha', 'a'],
      set: function (e, t, dynStyle) {
        e.style.opacity = (dynStyle.baseAlpha * t).toString()
      },
    },
  ]

  static getDynamics(svg: Element): Array<Component> {
    const options = ([] as string[]).concat(...StyleComponent.styles.map((s) => s.keys))
    return parse.elementsWithOptions(svg, options).map((e) => new StyleComponent(e))
  }

  baseAlpha: number = 1.0
  // baseFill: string
  // baseStroke: string

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    let transProps = svgElem.style.transitionProperty.split(',')
    transProps.push('fill')
    transProps.push('stroke')
    transProps.push('opacity')
    console.log( transProps )
    svgElem.style.transitionProperty = transProps.join(',')
    svgElem.style.transitionDuration = '1s'

    this.setBaseStyles()
  }

  setBaseStyles() {
    const svgElem = this.element as SVGGraphicsElement
    if ( svgElem.hasAttribute('opacity') ) {
      this.baseAlpha = Number( svgElem.getAttribute('opacity') )
    }
  }

  apply(data: Data, dynSVG: DVG) {
    const svgElem = this.element as SVGGraphicsElement
    for (let style of StyleComponent.styles) {
      const key = parse.firstObjectKey(this.opts, style.keys)
      if (key) {
        const col_str = this.opts[key].toString()
        const col = parse.columnFromData(col_str, data)
        if (col?.stats) {
          const val = data.get(0, col.name) as number
          if (val !== undefined) {
            const norm = (val - col.stats.min) / (col.stats.max - col.stats.min)
            style.set(svgElem, norm, this)
          }
        }
      }
    }
  }
}
