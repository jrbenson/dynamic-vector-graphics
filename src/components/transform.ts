import * as syntax from '../syntax/syntax'
import * as markup from '../syntax/markup'
import * as parse from '../syntax/parse'
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
 * The transform component applies transform attributes to an element based on data values.
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
        const key = markup.firstObjectKey(opts, ['rotateRatio', 'rr'])
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
    return markup.elementsWithOptions(svg, options).map((e) => new TransformComponent(e))
  }

  bbox: { x: number; y: number; width: number; height: number } | undefined
  origin: { x: number; y: number } | undefined
  base_transforms: Array<string> = []
  guide: Guide | undefined = undefined
  mainGroup: SVGGElement
  nonlinearPosGroup: SVGGElement
  nonlinearPosEaser: Easer = new Easer(this.setNonlinearPosition.bind(this))
  firstApply = true

  constructor(element: Element) {
    super(element)

    const svgElem = this.element as SVGGraphicsElement

    this.bbox = svg.getBBox(svgElem)
    this.origin = this.getOrigin()
    this.base_transforms = svg.getBaseTransforms(svgElem)
    this.mainGroup = svg.wrapWithGroup(svgElem)
    this.nonlinearPosGroup = svg.wrapWithGroup(svgElem)

    svgElem.setAttribute('vector-effect', 'non-scaling-stroke')
    svg.setPropertyTransitions(svgElem, ['transform'])
    if (this.origin) {
      svgElem.style.transformOrigin = this.origin.x + 'px ' + this.origin.y + 'px'
    }
  }

  getOrigin() {
    let relOrigin = { x: 0, y: 0 }
    const key = markup.firstObjectKey(this.opts, ['origin', 'o'])
    if (key) {
      const origin_range = parse.parseRange(this.opts[key]?.toString())
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
    if (this.firstApply) {
      svgElem.remove()
    }

    const gkey = markup.firstObjectKey(this.opts, Guide.keys)
    if (gkey && !this.guide) {
      this.guide = new Guide(dynSVG.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    }

    let transform_strs: Array<string> = []

    if (this.base_transforms.length > 0 && this.origin) {
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
      const [key, value] = this.getKeyAndAdjustedValue(transform.keys, data)
      if (key && value !== undefined) {
        if (this.guide) {
          transform_strs.push(transform.get(value, this.opts, this.guide))
        } else {
          transform_strs.push(transform.get(value, this.opts))
        }
        if (pos_keys.includes(key) && this.guide && !this.guide.linear) {
          this.nonlinearPosEaser.ease(this.nonlinearPosEaser.curT, value)
        }
      }
    }
    svgElem.style.transform = transform_strs.join(' ')

    if (this.firstApply) {
      this.firstApply = false
      this.nonlinearPosGroup.appendChild(svgElem)
    }
  }

  setNonlinearPosition(t: number) {
    if (this.guide) {
      const coord = this.guide.get(t)
      this.nonlinearPosGroup.style.transform = 'translate(' + coord.x + 'px,' + coord.y + 'px)'
    }
  }

  draw(state: DVG) {
    // console.log( this.origin, this.bbox, this.guide )

    const svgElem = this.element as SVGGraphicsElement
    svgElem.style.transform = ''
    this.bbox = svg.getBBox(svgElem)
    this.origin = this.getOrigin()
    if (this.origin) {
      svgElem.style.transformOrigin = this.origin.x + 'px ' + this.origin.y + 'px'
    }
    // const gkey = parse.firstObjectKey(this.opts, Guide.keys)
    // if (gkey) {
    //   console.log( 'YES')
    //   this.guide = new Guide(state.refs.get(this.opts[gkey].toString()) as SVGGraphicsElement)
    // }
    // console.log( this.origin, this.bbox, this.guide )
  }
}
