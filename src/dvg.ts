import Component from './components/component'
import TextComponent from './components/text'
import TransformComponent from './components/transform'
import StyleComponent from './components/style'
import { Data } from './data/data'
import * as parse from './utils/parse'

interface DVGOptions {
  svg: string
  clean: string
  dynamics: string
}

/**
 * The main class that controls the initialization and lifecycle of making the SVG
 * dynamic and responding to message events from the VA Data-driven Content framework.
 */
export class DVG {
  opts: DVGOptions
  data: Data = new Data('') // DataFrame for data response
  refs: Map<string, Element> = new Map()

  private element: Element
  private initComplete: boolean = false // Flag to help delay update execution
  private dynamics: Component[] = []

  /**
   * Attach to the indicate element DOM element and fill it with the target SVG. Also
   * perform all parsing and precomputation steps.
   * @param element The root DOM element to use for placement of SVG.
   */
  constructor(element: Element, opts: Partial<DVGOptions>) {
    this.element = element

    this.opts = {
      svg: 'index.svg',
      clean: 'all',
      dynamics: 'all',
    }
    this.opts = { ...this.opts, ...opts }

    this.init()
  }

  /**
   * Handle initialiation of page based on URL options.
   */
  private init() {
    const htmlElement = this.element as HTMLElement
    htmlElement.style.opacity = '0'

    fetch(this.opts.svg.toString(), { method: 'GET' })
      .then((response) => response.text())
      .then((text) => {
        const htmlElement = this.element as HTMLElement
        htmlElement.innerHTML = text
        const svg = htmlElement.querySelector('svg')
        if (svg) {
          cleanSVG(svg, this.opts.clean.toString().split(','))

          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          group.classList.add('__instance__')
          group.id = '__instance_0001__'
          group.append(...[...svg.children].filter((e) => e.tagName !== 'style'))

          svg.append(group)

          this.refs = parse.elementsByName(svg)

          this.dynamics = DVG.getDynamics(group)
          //this.instanceSVG = group.innerHTML
        }
        this.initComplete = true
        htmlElement.style.transition = 'opacity 0.5s ease 1s'
        htmlElement.style.opacity = '1'
      })
      .catch((error) => console.error('Error: ', error))

    // ddc.setOnDataReceivedCallback(this.onDataReceived.bind(this))
    // ddc.setupResizeListener(this.draw.bind(this))
  }

  /**
   * Performs cleaning tasks on SVG to allow for better dynamic behavior.
   * @param svg SVG element to perform cleaning on.
   * @param types Values: all | text
   */
  static getDynamics(svg: Element, types: string[] | undefined = ['all']): Array<Component> {
    let dynamics: Array<Component> = []
    if (types.includes('all') || types.includes('text')) {
      dynamics.push(...TextComponent.getDynamics(svg))
    }
    if (types.includes('all') || types.includes('transforms')) {
      dynamics.push(...TransformComponent.getDynamics(svg))
    }
    if (types.includes('all') || types.includes('styles')) {
      dynamics.push(...StyleComponent.getDynamics(svg))
    }
    return dynamics
  }

  /**
   * Applies the current _data to all dynamics.
   */
  private apply(): void {
    if (!this.initComplete) {
      window.setTimeout(this.apply.bind(this), 100)
    } else {
      this.dynamics.forEach((d) => d.apply(this.data, this))
    }
  }

  /**
   * Handle resize events or other layout changes.
   */
  private draw(): void {
    return
  }

  /**
   * Callback to handle data update from VA DDC.
   * @param message Message object from VA DDC data update.
   */
  // onDataReceived2(message: ddc.VAMessage): void {
  //   //console.log(JSON.stringify(message))
  //   this.message = message
  //   this.resultName = this.message.resultName
  //   this.data = Data.fromVA(this.message)

  //   this.data = parse.dataStats( this.data )

  //   this.apply()

  // }

  /**
   * Callback to handle data update from VA DDC.
   * @param data Data object to apply
   */
  udpate(data: Data): void {
    console.log(data)
    this.data = data
    this.data = parse.dataStats(this.data)
    this.apply()
  }
}

/**
 * Performs cleaning tasks on SVG to allow for better dynamic behavior.
 *
 * @param svg SVG element to perform cleaning on.
 * @param methods Values: all | text
 */
export function cleanSVG(svg: Element, methods: string[] = ['all']) {
  if (methods.includes('all') || methods.includes('text')) {
    svg.querySelectorAll('tspan').forEach(function (elem) {
      if (elem.parentElement && elem.parentElement.hasAttribute('x')) {
        elem.removeAttribute('x')
      }
      if (elem.parentElement && elem.parentElement.hasAttribute('y')) {
        elem.removeAttribute('y')
      }
    })
  }
  if (methods.includes('all') || methods.includes('decode')) {
    svg.querySelectorAll('*[id]').forEach(function (elem) {
      elem.id = parse.decodeIllustrator(elem.id)
    })
  }
}
