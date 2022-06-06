import { requiredFonts } from "./font"
import { decodeUnicode } from './string'
import WebFont from 'webfontloader'

const iri_tags = ['clipPath', 'color-profile', 'cursor', 'filter',
                  'linearGradient', 'marker', 'mask', 'pattern',
                  'radialGradient']

export function getBBox( element: SVGGraphicsElement ) {
  const mask = getMask( element )
  if ( mask != undefined ) {
    const copy = element.cloneNode( true )
    mask.before( copy )
    const bbox = (copy as SVGGraphicsElement).getBBox()
    mask?.parentNode?.removeChild( copy )
    return bbox
  }
  return element.getBBox()
}

export function getMask( element: Element | null ) {
  while (element && element.tagName !== 'SVG') {
    if ( element.tagName == 'mask' ) {
      return element
    }
    element = element.parentElement
  }
  return undefined
}

export function getAbsoluteOrigin(element: SVGGraphicsElement, relativeOrigin: { x: number; y: number }) {
  const bbox = getBBox( element )
  return { x: bbox.x + bbox.width * relativeOrigin.x, y: bbox.y + bbox.height * relativeOrigin.y }
}

/**
 * Wraps a given SVGGraphicsElement in an SVG group element (<g>) before tranferring its style
 * attributes to the group element and returning the new group element (the wrapped SVGGraphicsElement).
 * @param element - SVG Element to be wrapped in a group element
 * @param transferStyles - boolean indicating if the SVG has style atrributes to transfer
 * @returns SVGGraphicsElement wrapped in group container
 */
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
      elem.id = decodeUnicode(elem.id)
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

export function sanitizeSVG(svg: Element) {
  var propName;
  //For replacement purposes
  var IriUrl = /url\("?#([a-zA-Z][w:.-]*)"?\)/g;
  const iri_tag_map = new Map<string, number>();
  let iri_prop:string[] = [];
  // Will make both of these global vars
  var counter;
  let suffix = 'uniqueid_no';
  // SVG element
  var elem = svg;
  // Retrieve all id's from SVG
  var allIdElements = elem.querySelectorAll('[id');
  var len = allIdElements.length;
  let iriProp = new Set;
  // Iterate through id's, creates mapping of elems with iri properties (includes mask and others)
  if (1) {
    for (let i = 0; i < len; i++) {
      propName = allIdElements[i].localName;
      if (propName in iri_tags) {
        iri_tag_map.set(propName, 1);
      }
    }
    // Seems redundant, but is separated in inject. May combine later
    for (propName in iri_tag_map) {
      if (iri_tag_map.get(propName) == 1) {
        if (propName in iri_prop == false) {
          iri_prop.push(propName);
        }
      }
    }
  }
  if (1) {
    iri_prop.push('style');
  }
  //Replacing the actual id's begis here
  
  
  //Code here
}
