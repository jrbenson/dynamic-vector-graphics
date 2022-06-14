import { requiredFonts } from './font'
import { decodeUnicode } from './string'
import WebFont from 'webfontloader'

const iri_tags = ['clipPath', 'color-profile', 'cursor', 'filter',
                  'linearGradient', 'marker', 'mask', 'pattern',
                  'radialGradient']

var IRI_TAG_PROPERTIES_MAP = {
    clipPath: ['clip-path'],
    'color-profile': null,
    cursor: null,
    filter: null,
    linearGradient: ['fill', 'stroke'],
    marker: ['marker', 'marker-end', 'marker-mid', 'marker-start'],
    mask: null,
    pattern: ['fill', 'stroke'],
    radialGradient: ['fill', 'stroke']
  };

var counter = 0;
let suffix = 'san';


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
  }
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

export function sanitizeSVG(svg: Element) {
  //IRI property map creation
  let iriMap = new Map<string, string[]>();
  iriMap.set("clipPath", ["clip-path"]);
  iriMap.set("color-profile", ["color-profile"]);
  iriMap.set("cursor", ["cursor"]);
  iriMap.set("filter", ["filter"]);
  iriMap.set("linearGradient", ["fill", "stroke"]);
  iriMap.set("marker", ["marker", "marker-end", "marker-mid", "marker-start"]);
  iriMap.set("mask", ["mask"]);
  iriMap.set("pattern", ["fill", "stroke"]);
  iriMap.set("radialGradient", ["fill", "stroke"]);

  console.log("mapping created");

  let propName = "";
  // For replacement purposes
  let iriUrl = /url\("?#([a-zA-Z][\w:.-]*)"?\)/g;
  let iri_tag_map = new Map<string, number>();
  let iriProperties = [];
  var currentProp;
  var idElem;
  // SVG element
  let elem = svg;
  // Retrieve all id's from SVG
  let allIdElements = svg.querySelectorAll('[id]');
  let len = allIdElements.length;
  let iriProp = new Array;
  // Iterate through id's, creates mapping of elems with iri properties (includes mask and others)
  if (allIdElements.length >= 0) {
    for (let i = 0; i < len; i++) {
      propName = allIdElements[i].localName;
      //console.log(propName);
      if (propName in IRI_TAG_PROPERTIES_MAP) {
        iri_tag_map.set(propName, 1);
        //console.log(propName + " " + iri_tag_map.get(propName));
      }
    }
    // Properties list creation
    for (let props of iri_tag_map.keys()) {
      //console.log("next loop " + props);
      let lengthProp = iriMap.get(props)?.length!;
      //console.log(props + " " + len);
      currentProp = iriMap.get(props);
      for (let k = 0; k < lengthProp; k++) {
        if (iriProp.indexOf(currentProp![k]) < 0) {
          iriProperties.push(currentProp![k]);
          console.log("push " + currentProp![k]);
        }
      }
    }
    if (iriProperties.length >= 0) {
      iriProperties.push('style');
    }
    //Replacing the actual id's begis here
  
    //allIDElements == descElements
    //elem == element
  
    let propertyName = "";
    let value = "";
    let newValue = "";
    let element = svg;
    let descElem = svg.querySelectorAll('*');
  
    for (let i = 0; descElem[i] != null; i++) {
      if (descElem[i].localName == 'style') {
        value = allIdElements[i].textContent!;
        newValue = value && value.replace(iriUrl, suffix + value + counter);
        counter++;
      }
      else if (descElem[i].hasAttributes()){
        console.log(descElem[i].localName);
        for (let j = 0; j < iriProperties.length; j++) {
          propertyName = iriProperties[j]!;
          value = descElem[i].getAttribute(propertyName)!;
          //console.log(counter + " " + value);
          newValue = value && value.replace(iriUrl, (match, id) => {return 'url(#' + id + suffix + counter + ')'});
          console.log(propertyName + " " + value + "   " + newValue);
          counter++;
          if (newValue !== value) {
            descElem[i].setAttribute(propertyName, newValue);
          }
        }
        // replaceAttr('xlink:href', descElem[i]);
        // replaceAttr('href', descElem[i]);
      }
    }
    // for (let f = 0; f < allIdElements.length; f++) {
    //   idElem = allIdElements[f];
    //   console.log(idElem.id);
    //   idElem.id += suffix + counter;
    // }
  }
}

export function replaceAttr(attr: string, desc: Element) {
  var iri = desc.getAttribute(attr);
  if (/^\s*#/.test(iri!)) { // Check if iri is non-null and internal reference
    iri = iri?.trim()!;
    desc.setAttribute(attr, iri! + suffix + counter)
    counter++;
  }
}

