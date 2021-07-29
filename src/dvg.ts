import Component from './components/component'
import { Data, DataView } from './data/data'
import { SourceData } from './data/data'
import { cleanSVG, initFonts } from './utils/svg'
import * as parse from './utils/syntax'
import { getLoader } from './loader'

import TextComponent from './components/text'
import TransformComponent from './components/transform'
import StyleComponent from './components/style'
import DuplicateComponent from './components/duplicate'

interface DVGOptions {
  svg: string
  clean: string
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
  private components: Component[] = []
  private componentsStatus: Boolean = false
  private svg: SVGSVGElement | undefined // Main/outer SVG of the DVG
  private content: SVGElement | undefined // Group container for 
  private loader: SVGElement | undefined

  /**
   * Attach to the indicate element DOM element and fill it with the target SVG. Also
   * perform all parsing and precomputation steps.
   * @param element The root DOM element to use for placement of SVG.
   */
  constructor(element?: Element, opts?: Partial<DVGOptions>) {
    if (element !== undefined) {
      this.element = element
    } else {
      this.element = document.body
    }

    this.opts = {
      svg: 'index.svg',
      clean: 'all',
    }
    this.opts = { ...this.opts, ...opts }

    console.log(this.opts)

    this.init()
  }

  /**
   * Handle initialiation of page based on URL options.
   */
  private init() {
    if (this.element.tagName.toLowerCase() === 'svg') {
      this.initSVG(this.element as SVGSVGElement)
    } else {
      ; (this.element as HTMLElement).style.opacity = '0'
      fetch(this.opts.svg.toString(), { method: 'GET' })
        .then((response) => response.text())
        .then((text) => {
          const htmlElement = this.element as HTMLElement
          htmlElement.innerHTML = text
          const svg = htmlElement.querySelector('svg')
          if (svg) {
            this.initSVG(svg)
          }
          htmlElement.style.transition = 'opacity 0.5s ease 1s'
          htmlElement.style.opacity = '1'
        })
        .catch((error) => console.error('Error: ', error))
    }
  }

  private initSVG(svg: SVGSVGElement) {
    this.svg = svg

    cleanSVG(svg, this.opts.clean.toString().split(','))
    const fontsNeeded = initFonts(svg)

    this.content = document.createElementNS('http://www.w3.org/2000/svg', 'g') // content = <g></g>
    this.content.append(...[...svg.children].filter((e) => e.tagName !== 'style')) // content = <g>***Any child of given <svg></svg>***</g>
    svg.append(this.content) // <svg>content</svg>
    this.content.style.transition = 'opacity 0.5s ease'

    this.loader = getLoader(this.svg)
    this.loader.style.transition = 'opacity 0.5s ease'

    this.refs = parse.elementsByName(svg) // stores object references for each HTML element of given SVG

    let components: Array<Component> = []
    components.push(...DuplicateComponent.getComponent(svg))
    components.push(...TextComponent.getComponent(svg))
    components.push(...TransformComponent.getComponent(svg))
    components.push(...StyleComponent.getComponent(svg))
    this.components = components // maps a component to each element of a given SVG based on the element's options

    if (fontsNeeded) {
      window.setTimeout(this.apply.bind(this), 1000)
    }
    this.initComplete = true
    this.apply()
  }

  /**
   * Applies the current data to all dynamics.
   */
  private apply(): void {
    if (!this.initComplete) {
      window.setTimeout(this.apply.bind(this), 100)
    } else {
      const full = this.data.fullView()

      for (let comp of this.components) {
        if (comp.filters.length <= 0) {
          comp.apply(full, this)
        } else {
          let dv = this.data.fullView()

          for (let filter of comp.filters) {
            dv = dv.filteredView(filter)
          }

          comp.apply(dv, this)
        }
      }

      this.componentsStatus = true

      // Set loader if data has no columns
      if (this.content && this.loader) {
        if (this.data.cols.length <= 0) {
          this.content.style.opacity = '0.5'
          this.loader.style.opacity = '1.0'
        } else {
          this.content.style.opacity = '1.0'
          this.loader.style.opacity = '0.0'
        }
      }
    }
  }

  /**
   * Handle resize events or other layout changes.
   */
  private draw(): void {
    for (let comp of this.components) {
      comp.draw(this)
    }

    this.apply()
    // this.initComplete = false
    // const htmlElement = this.element as HTMLElement
    // htmlElement.style.transition = ''
    // htmlElement.style.opacity = '0'
    // this.init()
  }

  /**
   * Sets a new base data object for the dynamic object.
   * @param data Data object to apply
   */
  update(data: SourceData): void {
    this.data = new Data(data)
    this.apply()
  }

  getComponentsStatus() {
    return this.componentsStatus
  }
}
