import { requiredFonts } from './font'
import { decodeUnicode } from './string'
import WebFont from 'webfontloader'
import { SYNTAX_ATTRIBUTE, RE_SYNTAXCONTAINER } from './syntax'

var IRI_TAG_PROPERTIES_MAP = {
  clipPath: ['clip-path'],
  'color-profile': null,
  cursor: null,
  filter: null,
  linearGradient: ['fill', 'stroke'],
  marker: ['marker', 'marker-end', 'marker-mid', 'marker-start'],
  mask: null,
  pattern: ['fill', 'stroke'],
  radialGradient: ['fill', 'stroke'],
}

let iriMap = new Map<string, string[]>([
  ['clipPath', ['clip-path']],
  ['color-profile', ['color-profile']],
  ['cursor', ['cursor']],
  ['filter', ['filter']],
  ['linearGradient', ['fill', 'stroke']],
  ['marker', ['marker', 'marker-end', 'marker-mid', 'marker-start']],
  ['mask', ['mask']],
  ['pattern', ['fill', 'stroke']],
  ['radialGradient', ['fill', 'stroke']],
])

let suffix = 'id_no:'

export function getBBox(element: SVGGraphicsElement) {
  const mask = getMask(element)
  if (mask != undefined) {
    const copy = element.cloneNode(true)
    mask.before(copy)
    const bbox = (copy as SVGGraphicsElement).getBBox()
    mask?.parentNode?.removeChild(copy)
    return bbox
  }
  return element.getBBox()
}

export function getMask(element: Element | null) {
  while (element && element.tagName !== 'SVG') {
    if (element.tagName == 'mask') {
      return element
    }
    element = element.parentElement
  }
  return undefined
}

export function getAbsoluteOrigin(element: SVGGraphicsElement, relativeOrigin: { x: number; y: number }) {
  const bbox = getBBox(element)
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
    svg.querySelectorAll('use').forEach(function (elem) {
      const href = elem.getAttribute('xlink:href')
      if (href) {
        elem.setAttribute('xlink:href', decodeUnicode(href))
      }
    })
  }

  svg.querySelectorAll('*[id]').forEach(function (elem) {
    let markup = ''
    if (elem.id.match(RE_SYNTAXCONTAINER)) {
      markup = elem.id.match(RE_SYNTAXCONTAINER)![0]
    }
    if (markup) {
      elem.setAttribute(SYNTAX_ATTRIBUTE, markup)
    }
  })
}

export function initFonts(svg: Element) {
  const fonts = requiredFonts(svg)
  if (fonts.length > 0) {
    WebFont.load({
      google: {
        families: fonts,
      },
    })
    return true
  }
  return false
}

/**
 * Retrieves the attribute of an SVG and appends a suffix to ensure uniqueness.
 *
 * @param attr String representing the name of the attribute to modify
 * @param desc SVG to perform the modification on
 * @param count Number representing the current value of the counter
 */
export function replaceAttr(attr: string, desc: Element, count: number) {
  var iri = desc.getAttribute(attr)
  if (/^\s*#/.test(iri!)) {
    // Check if iri is non-null and internal reference
    iri = iri?.trim()!
    desc.setAttribute(attr, iri! + suffix + count)
  }
}

/**
 * "Mangles" the SVG by appending a SVG-specific suffix to each element's ID to ensure
 * each SVG component has an ID unique from other SVGs.
 *
 * @param svg SVG element to "mangle"
 */
export function mangleSVG(svg: Element) {
  // Variable declarations
  let tagLabel = ''
  let idRegex = /url\("?#([a-zA-Z][\w:.-]*)"?\)/g
  let iri_tag_map = new Map<string, number>()
  let id_map = []
  let iriProperties = []
  let currentProp
  var idElem
  let ranVal = Math.random()

  // Retrieve all id's from SVG
  let allIdElements = svg.querySelectorAll('[id]')
  let len = allIdElements.length
  let iriProp = new Array()

  // Iterate through id's, creates mapping of elems with iri properties (includes mask and others)
  if (allIdElements.length >= 0) {
    for (let i = 0; i < len; i++) {
      tagLabel = allIdElements[i].localName
      id_map.push(allIdElements[i].id)
      if (tagLabel in IRI_TAG_PROPERTIES_MAP) {
        iri_tag_map.set(tagLabel, 1)
      }
    }

    // Properties list creation
    for (let props of iri_tag_map.keys()) {
      let lengthProp = iriMap.get(props)?.length!
      currentProp = iriMap.get(props)
      for (let k = 0; k < lengthProp; k++) {
        if (iriProp.indexOf(currentProp![k]) < 0) {
          iriProperties.push(currentProp![k])
        }
      }
    }
    if (iriProperties.length >= 0) {
      iriProperties.push('style')
    }

    // Replacing the actual ids begins here
    let propertyName = ''
    let value = ''
    let newValue = ''
    let descElem = svg.querySelectorAll('*')

    for (let i = 0; descElem[i] != null; i++) {
      if (descElem[i].localName == 'style') {
        value = allIdElements[i].textContent!
        newValue =
          value &&
          value.replace(idRegex, (match, id) => {
            return 'url(#' + id + suffix + ranVal + ')'
          })
      } else if (descElem[i].hasAttributes()) {
        for (let j = 0; j < iriProperties.length; j++) {
          propertyName = iriProperties[j]!
          value = descElem[i].getAttribute(propertyName)!
          newValue =
            value &&
            value.replace(idRegex, (match, id) => {
              return 'url(#' + id + suffix + ranVal + ')'
            })
          if (newValue !== value) {
            descElem[i].setAttribute(propertyName, newValue)
          }
        }
        replaceAttr('xlink:href', descElem[i], ranVal)
        replaceAttr('href', descElem[i], ranVal)
      }
    }
    for (let f = 0; f < allIdElements.length; f++) {
      idElem = allIdElements[f]
      idElem.id += suffix + ranVal
    }
  }
}
