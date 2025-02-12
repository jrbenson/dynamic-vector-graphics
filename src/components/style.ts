import * as syntax from '../syntax/syntax'
import * as markup from '../syntax/markup'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Easer from '../utils/easer'
import Component from './component'
import { DVG } from '../dvg'
import chroma from 'chroma-js'

interface Style {
  keys: Array<string>
  set: (e: SVGGraphicsElement, t: number, dynStyle: StyleComponent) => void
}

class Gradient {
  private stops: { offset: number; color: string }[]

  constructor(stops: { offset: number; color: string }[] = []) {
    this.stops = stops
    this.sortStops()
  }

  addStop(offset: number, color: string) {
    this.stops.push({ offset, color })
    this.sortStops()
  }

  sortStops() {
    this.stops.sort((a, b) => a.offset - b.offset)
  }

  get(value: number): string {
    if (this.stops.length === 0 || value < 0.0 || value > 1.0) {
      return '#FF0000'
    } else if (this.stops.length === 1) {
      return this.stops[0].color
    } else if (value < this.stops[0].offset) {
      return this.stops[0].color
    } else if (value > this.stops[this.stops.length - 1].offset) {
      return this.stops[this.stops.length - 1].color
    } else {
      let stopA = this.stops[0]
      let stopB = this.stops[1]
      for (let i = 1; i < this.stops.length; i++) {
        stopA = this.stops[i - 1]
        stopB = this.stops[i]
        if (value < this.stops[i].offset) {
          break
        }
      }
      const mixValue = (value - stopA.offset) / (stopB.offset - stopA.offset)
      return chroma.mix(stopA.color, stopB.color, mixValue, 'lab').hex()
    }
  }
}

export default class StyleComponent extends Component {
  static styles: Array<Style> = [
    {
      // Fill color
      keys: markup.KEYS.style.fill,
      set: function (e, t, dynStyle) {
        if (dynStyle.fillColorGradient) {
          e.style.fill = dynStyle.fillColorGradient.get(t)
        } else {
          e.style.fill = '#FF0000'
        }
      },
    },
    {
      // Stroke color
      keys: markup.KEYS.style.stroke,
      set: function (e, t, dynStyle) {
        e.style.stroke = dynStyle.strokeColorGradient?.get(t) || '#FF0000'
      },
    },
    {
      // Stroke width
      keys: markup.KEYS.style.strokeWidth,
      set: function (e, t, dynStyle) {
        e.style.strokeWidth = (dynStyle.baseStrokeWidth * t).toString()
      },
    },
    {
      // Opacity
      keys: markup.KEYS.style.opacity,
      set: function (e, t, dynStyle) {
        e.style.opacity = (dynStyle.baseOpacity * t).toString()
      },
    },
    {
      // Fill opacity
      keys: markup.KEYS.style.fillOpacity,
      set: function (e, t, dynStyle) {
        e.style.fillOpacity = (dynStyle.baseFillOpacity * t).toString()
      },
    },
    {
      // Stroke opacity
      keys: markup.KEYS.style.strokeOpacity,
      set: function (e, t, dynStyle) {
        e.style.strokeOpacity = (dynStyle.baseStrokeOpacity * t).toString()
      },
    },
    {
      // Dash array
      keys: markup.KEYS.style.strokeDash,
      set: function (e, t, dynStyle) {
        if (dynStyle.baseDashArray.length <= 1) {
          let baseWidth = dynStyle.baseStrokeWidth * 2
          if (dynStyle.baseDashArray.length === 1) {
            baseWidth = dynStyle.baseDashArray[0]
          }
          const dashLength = t * baseWidth
          e.style.strokeDasharray = `${dashLength} ${baseWidth - dashLength}`
        } else {
          let dashArray = ''
          for (let i = 0; i < dynStyle.baseDashArray.length; i += 2) {
            const baseWidth = dynStyle.baseDashArray[i]
            const gapWidth = dynStyle.baseDashArray[i + 1]
            dashArray += `${baseWidth * t} ${gapWidth * (1 - t)} `
          }
          e.style.strokeDasharray = dashArray
        }
      },
    },
    {
      // Font weight
      keys: markup.KEYS.style.fontWeight,
      set: function (e, t, dynStyle) {
        e.style.fontWeight = (dynStyle.baseFontWeight * t).toString()
      },
    },
    {
      // Font size
      keys: markup.KEYS.style.fontSize,
      set: function (e, t, dynStyle) {
        e.style.fontSize = (dynStyle.baseFontSize * t).toString()
      },
    },
  ]

  static getComponent(svg: Element): Array<Component> {
    const allKeys = ([] as string[]).concat(...StyleComponent.styles.map((s) => s.keys))
    return markup.elementsWithOptions(svg, allKeys).map((e) => new StyleComponent(e))
  }

  baseOpacity: number = 1.0
  baseFillOpacity: number = 1.0
  baseStrokeOpacity: number = 1.0
  baseStrokeWidth: number = 4.0
  baseFontWeight: number = 700
  baseFontSize: number = 16
  baseDashArray: number[] = []

  fillColorGradient: Gradient | undefined
  strokeColorGradient: Gradient | undefined

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    let transProps = svgElem.style.transitionProperty.split(',')
    transProps.push('fill')
    transProps.push('stroke')
    transProps.push('opacity')
    svgElem.style.transitionProperty = transProps.join(',')
    svgElem.style.transitionDuration = '1s'

    this.intializeStyleContext()
  }

  intializeStyleContext() {
    const svgElem = this.element as SVGGraphicsElement
    if (svgElem.hasAttribute('opacity')) {
      this.baseOpacity = Number(svgElem.getAttribute('opacity'))
    }
    if (svgElem.hasAttribute('fill-opacity')) {
      this.baseFillOpacity = Number(svgElem.getAttribute('fill-opacity'))
    }
    if (svgElem.hasAttribute('stroke-opacity')) {
      this.baseStrokeOpacity = Number(svgElem.getAttribute('stroke-opacity'))
    }
    if (svgElem.hasAttribute('stroke-width')) {
      this.baseStrokeWidth = Number(svgElem.getAttribute('stroke-width'))
    }
    if (svgElem.hasAttribute('font-weight')) {
      this.baseFontWeight = Number(svgElem.getAttribute('font-weight'))
    }
    if (svgElem.hasAttribute('font-size')) {
      this.baseFontSize = Number(svgElem.getAttribute('font-size'))
    }
    if (svgElem.hasAttribute('stroke-dasharray')) {
      const dashArray = svgElem.getAttribute('stroke-dasharray')?.split(' ')
      if (dashArray) {
        this.baseDashArray = dashArray.map((d) => Number(d))
      }
    }
    if (svgElem.hasAttribute('fill')) {
      const gradientId = svg.getURLId(svgElem, 'fill')
      if (gradientId) {
        const gradientElem = svgElem.ownerDocument.getElementById(gradientId)
        if (gradientElem && gradientElem.tagName === 'linearGradient') {
          this.fillColorGradient = this.getGradient(gradientElem)
        }
      }
    }
    if (svgElem.hasAttribute('stroke')) {
      const gradientId = svg.getURLId(svgElem, 'stroke')
      if (gradientId) {
        const gradientElem = svgElem.ownerDocument.getElementById(gradientId)
        if (gradientElem && gradientElem.tagName === 'linearGradient') {
          this.strokeColorGradient = this.getGradient(gradientElem)
        }
      }
    }
  }

  getGradient(element: Element): Gradient {
    const stopElements = Array.from(element.children)
    const stops = stopElements.map((s) => {
      return {
        offset: Number(s.getAttribute('offset')),
        color: s.getAttribute('stop-color') || '#000000',
      }
    })
    return new Gradient(stops)
  }

  apply(data: DataView, dynSVG: DVG) {
    const svgElem = this.element as SVGGraphicsElement
    for (let style of StyleComponent.styles) {
      const [key, value] = this.getKeyAndAdjustedValue(style.keys, data)
      if (value !== undefined) {
        style.set(svgElem, value, this)
      }
    }
  }
}
