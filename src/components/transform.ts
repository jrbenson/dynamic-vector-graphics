import * as parse from '../utils/syntax'
import * as svg from '../utils/svg'
import { DataView } from '../data/data'
import Easer from '../utils/easer'
import Component from './component'
import { DVG } from '../dvg'
import { Guide } from './guide'

interface Transform {
  keys: Array<string>
  get: (x: number, opts: Record<string, string | number | boolean>, guide?: Guide) => string
}

/**
 * The transform component replaces mustache style double brace tags with a value from the data.
 */
export default class TransformComponent extends Component {
  static transforms: Array<Transform> = [
    {
      keys: ['scale', 's'],
      get: function (t, opts, guide?) {
        return 'scale(' + t + ',' + t + ')'
      },
    },
    {
      keys: ['scaleX', 'sx'],
      get: function (t, opts, guide?) {
        return 'scaleX(' + t + ')'
      },
    },
    {
      keys: ['scaleY', 'sy'],
      get: function (t, opts, guide?) {
        return 'scaleY(' + t + ')'
      },
    },
    {
      keys: ['rotate', 'r'],
      get: function (t, opts, guide?) {
        let limit = 1.0
        const key = parse.firstObjectKey(opts, ['rotateRatio', 'rr'])
        if (key) {
          limit = Number(opts[key])
        }
        return 'rotate(' + t * 360 * limit + 'deg)'
      },
    },
    {
      keys: ['position', 'p'],
      get: function (t, opts, guide?) {
        if (guide && guide.linear) {
          const coords = guide.get(t)
          return 'translate(' + coords.x + 'px,' + coords.y + 'px)'
        }
        return ''
      },
    },
    {
      keys: ['positionX', 'px'],
      get: function (t, opts, guide?) {
        if (guide && guide.linear) {
          const coords = guide.get(t)
          return 'translateX(' + coords.x + 'px)'
        }
        return ''
      },
    },
    {
      keys: ['positionY', 'py'],
      get: function (t, opts, guide?) {
        if (guide && guide.linear) {
          const coords = guide.get(t)
          return 'translateY(' + coords.y + 'px)'
        }
        return ''
      },
    },
  ]

  static getComponent(svg: Element): Array<Component> {
    const options = ([] as string[]).concat(...TransformComponent.transforms.map((t) => t.keys))
    return parse.elementsWithOptions(svg, options).map((e) => new TransformComponent(e))
  }

  bbox: { x: number; y: number; width: number; height: number }
  origin: { x: number; y: number }
  base_transforms: Array<string> = []
  guide: Guide | undefined = undefined
  nonlinear_pos_group: SVGGElement
  nonlinear_pos_easer: Easer = new Easer(this.setNonlinearPosition.bind(this))

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    this.bbox = svg.getBBox(svgElem)
    this.origin = this.getOrigin()
    this.base_transforms = svg.getBaseTransforms(svgElem)
    svg.wrapWithGroup(svgElem)
    this.nonlinear_pos_group = svg.wrapWithGroup(svgElem)

    svgElem.setAttribute('vector-effect', 'non-scaling-stroke')
    let transProps: Array<string> = []
    transProps.concat(...svgElem.style.transitionProperty.split(','))
    transProps.push('transform')
    svgElem.style.transitionProperty = transProps.join(',')
    svgElem.style.transitionDuration = '1s'
    svgElem.style.transitionTimingFunction = 'cubic-bezier(0.25, .1, 0.25, 1)'
    svgElem.style.transformOrigin = this.origin.x + 'px ' + this.origin.y + 'px'
  }

  getOrigin() {
    let relOrigin = { x: 0, y: 0 }
    const key = parse.firstObjectKey(this.opts, ['origin', 'o'])
    if (key) {
      const origin_range = parse.range(this.opts[key]?.toString())
      if (origin_range[1] !== undefined) {
        relOrigin.x = origin_range[0]
        relOrigin.y = origin_range[1]
      } else if (origin_range[0] !== undefined) {
        relOrigin.x = relOrigin.y = origin_range[0]
      }
    }
    return svg.getAbsoluteOrigin(this.element as SVGGraphicsElement, relOrigin)
  }

  apply(data: DataView, dynSVG: DVG) {
    const svgElem = this.element as SVGGraphicsElement

    const gkey = parse.firstObjectKey(this.opts, Guide.keys)
    if (gkey && !this.guide) {
      this.guide = new Guide(dynSVG.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    }

    let transform_strs: Array<string> = []

    if (this.base_transforms.length > 0) {
      transform_strs.push('translate(' + -this.origin.x + 'px,' + -this.origin.y + 'px)')
      transform_strs.push(...this.base_transforms)
      transform_strs.push('translate(' + this.origin.x + 'px,' + this.origin.y + 'px)')
    }

    const pos_transforms = TransformComponent.transforms.filter((t) => t.keys[0].startsWith('p'))
    const pos_keys = pos_transforms
      .map((t) => t.keys)
      .flat()
      .filter((k) => k.startsWith('p'))

    for (let transform of TransformComponent.transforms) {
      const key = parse.firstObjectKey(this.opts, transform.keys)
      if (key) {
        let norm = 0
        const col_str = this.opts[key].toString()
        const col = parse.columnFromData(col_str, data)
        if (col !== undefined) {
          const val = data.get(0, col.name) as number
          const stats = col?.stats
          if (stats !== undefined && val !== undefined) {
            norm = (val - stats.min) / (stats.max - stats.min)
            if (!isFinite(norm)) {
              norm = 0
            }
          }
        }
        if (this.guide) {
          transform_strs.push(transform.get(norm, this.opts, this.guide))
        } else {
          transform_strs.push(transform.get(norm, this.opts))
        }
        if (pos_keys.includes(key) && this.guide && !this.guide.linear) {
          this.nonlinear_pos_easer.ease(this.nonlinear_pos_easer.curT, norm)
        }
      }
    }

    svgElem.style.transform = transform_strs.join(' ')
  }

  setNonlinearPosition(t: number) {
    if (this.guide) {
      const coord = this.guide.get(t)
      this.nonlinear_pos_group.style.transform = 'translate(' + coord.x + 'px,' + coord.y + 'px)'
    }
  }

  draw(state: DVG) {
    // console.log( this.origin, this.bbox, this.guide )
    const svgElem = this.element as SVGGraphicsElement
    svgElem.style.transform = ''
    this.bbox = svg.getBBox(svgElem)
    if (!this.origin) {
      this.getOrigin()
    }
    //this.origin = this.getOrigin()
    svgElem.style.transformOrigin = this.origin.x + 'px ' + this.origin.y + 'px'

    // const gkey = parse.firstObjectKey(this.opts, Guide.keys)
    // if (gkey) {
    //   console.log( 'YES')
    //   this.guide = new Guide(state.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    // }
    // console.log( this.origin, this.bbox, this.guide )
  }
}
