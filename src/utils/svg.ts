import { decodeIllustrator, requiredFonts } from './parse'
import WebFont from 'webfontloader'

export function getAbsoluteOrigin(element: SVGGraphicsElement, relativeOrigin: { x: number; y: number }) {
  const bbox = element.getBBox()
  return { x: bbox.x + bbox.width * relativeOrigin.x, y: bbox.y + bbox.height * relativeOrigin.y }
}

export function wrapWithGroup(element: SVGGraphicsElement, transferStyles: boolean = true) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  element.insertAdjacentElement('afterend', group)
  group.append(element)
  if (transferStyles) {
    if (element.classList.length > 0) {
      group.classList.add(...element.classList)
      element.classList.remove(...element.classList)
    }
    if (element.style.cssText) {
      group.style.cssText = element.style.cssText
      element.style.cssText = ''
    }
    const cPath = element.getAttribute('clip-path')
    if (cPath) {
      group.setAttribute('clip-path', cPath)
      element.removeAttribute('clip-path')
    }
  }
  return group
}

export function getBaseTransforms(element: SVGGraphicsElement) {
  let base_transforms = []
  if (element.transform.baseVal.numberOfItems > 0) {
    for (let i = 0; i < element.transform.baseVal.numberOfItems; i += 1) {
      const transform = element.transform.baseVal.getItem(i)
      base_transforms.push(
        'matrix(' +
          transform.matrix.a +
          ',' +
          transform.matrix.b +
          ',' +
          transform.matrix.c +
          ',' +
          transform.matrix.d +
          ',' +
          transform.matrix.e +
          ',' +
          transform.matrix.f +
          ')'
      )
    }
  }
  return base_transforms
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
      elem.id = decodeIllustrator(elem.id)
    })
  }
}

export function initFonts(svg: Element) {
  const fonts = requiredFonts(svg)
  if (fonts.length > 0) {
    WebFont.load({
      google: {
        families: fonts,
      }
    })
    return true
  }
  return false
}
