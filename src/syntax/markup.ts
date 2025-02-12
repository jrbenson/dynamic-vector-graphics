import { Column, ColumnType } from '../data/column'
import { DataView } from '../data/data'
import { Condition, Filter } from '../data/filter'
import { trimChars } from '../utils/string'
import { getOfficialKey, jsonEncodeLiteral } from './parse'
import {
  COLUMN_SYMBOL_TO_DATA_TYPE,
  RE_COLUMNID,
  RE_CONDITION,
  RE_SYNTAXCONTAINER,
  SYNTAX_ATTRIBUTE,
  TRIM_CHARS,
} from './syntax'

export const KEYS = {
  duplicate: {
    x: ['duplicateX', 'dx'],
    y: ['duplicateY', 'dy'],
    wrap: ['duplicateWrap', 'dw'],
    slots: ['duplicateSlots', 'ds'],
  },
  unify: ['unify', 'u'],
  filter: ['filter', 'f'],
  origin: ['origin', 'o'],
  textAlign: ['textAlign', 'ta'],
  guide: {
    color: ['guideColor', 'gc'],
    position: ['guidePosition', 'gp'],
    both: ['guide', 'g'],
  },
  style: {
    fill: ['fill', 'f'],
    stroke: ['line', 'l'],
    strokeWidth: ['lineWidth', 'lw'],
    fontWeight: ['textWeight', 'tw'],
    fontSize: ['textSize', 'ts'],
    opacity: ['alpha', 'a'],
    fillOpacity: ['fillAlpha', 'fa'],
    strokeOpacity: ['lineAlpha', 'la'],
    strokeDash: ['lineDash', 'ld'],
  },
  transform: {
    translate: {
      x: ['positionX', 'px'],
      y: ['positionY', 'py'],
      both: ['position', 'p'],
    },
    scale: {
      x: ['scaleX', 'sx'],
      y: ['scaleY', 'sy'],
      both: ['scale', 's'],
    },
    rotate: ['rotate', 'r'],
    opts: {
      rotateRatio: ['rotateRatio', 'rr'],
      justify: ['justify', 'j'],
    },
  },
  visibility: ['visible', 'v'],
}

export function extractStringArrays(obj: any) {
  const result: string[][] = []
  function recurse(currentObj: any) {
    if (Array.isArray(currentObj) && currentObj.every((item) => typeof item === 'string')) {
      result.push(currentObj)
    } else if (typeof currentObj === 'object' && currentObj !== null) {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          recurse(currentObj[key])
        }
      }
    }
  }
  recurse(obj)
  return result
}
const KEYS_ARRAYS = extractStringArrays(KEYS)

export function setOfficialKeys(obj: any) {
  function recurse(currentObj: any) {
    if (typeof currentObj === 'object' && currentObj !== null) {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const officialKey = getOfficialKey(key)
          if (officialKey !== key) {
            currentObj[officialKey] = currentObj[key]
            delete currentObj[key]
          }
          recurse(currentObj[officialKey])
        }
      }
    }
  }
  recurse(obj)
}
export interface Markup {
  name: string
  opts: Record<string, string | number | boolean>
}
/**
 * Creates an object from a string in the format {{param|opt:val,opt:val}}.
 *
 * @param code The text to decode.
 */

export function parseMarkup(code: string): Markup {
  let obj: Markup = {
    name: '',
    opts: {},
  }
  const matches = code.match(RE_SYNTAXCONTAINER)
  if (matches) {
    code = matches[0].slice(2, -2)
    if (code.includes('|')) {
      const name_opts = code.split('|')
      obj.name = trimChars(name_opts[0], TRIM_CHARS)
      obj.opts = JSON.parse(jsonEncodeLiteral(name_opts[1]))
    } else if (code.includes(':')) {
      obj.opts = JSON.parse(jsonEncodeLiteral(code))
    } else {
      obj.name = trimChars(code, TRIM_CHARS)
    }
    setOfficialKeys(obj.opts)
  }
  return obj
}
export function stringifyMarkup(markup: Markup) {
  let str = ''
  if (markup.name) {
    str += markup.name
  }
  if (Object.keys(markup.opts).length > 0) {
    let opts = JSON.stringify(markup.opts).slice(1, -1)
    opts = opts.replace(/"/g, '')
    opts = opts.replace(/:true/g, '')
    str += '|' + opts
  }
  return `{{${str}}}`
}
export function elementMarkup(element: Element): Markup {
  let str = element.id
  if (element.hasAttribute(SYNTAX_ATTRIBUTE)) {
    str = element.getAttribute(SYNTAX_ATTRIBUTE) || ''
  }
  return parseMarkup(str)
}
export function hasMarkup(element: Element) {
  return element.hasAttribute(SYNTAX_ATTRIBUTE) && element.getAttribute(SYNTAX_ATTRIBUTE)?.match(RE_SYNTAXCONTAINER)
}
/**
 * Check each SVGElement of a given (SVG) Element for given options and returns
 * a list of all SVGElements that have the requested options.
 *
 * @param svg The parent element to search through the children of.
 * @param options List of option strings to match against.
 * @returns List of SVGElements that have the requested options.
 */

export function elementsWithOptions(svg: Element, options: string[]): Array<Element> {
  return Array.from(svg.querySelectorAll<SVGElement>(`*[${SYNTAX_ATTRIBUTE}]`))
    .filter((e) => hasMarkup(e))
    .filter(function (e) {
      let syn = elementMarkup(e)
      for (let option in syn.opts) {
        if (options.includes(option)) {
          return true
        }
      }
      return false
    })
}
/**
 * Returns a map of the name (in annotation syntax) of an element to a reference to that element.
 *
 * @param svg The parent element to search through the children of.
 */

export function elementsByName(svg: Element) {
  const elements: Map<string, Element> = new Map()
  Array.from(svg.querySelectorAll<SVGElement>(`*[${SYNTAX_ATTRIBUTE}]`))
    .filter((e) => e.getAttribute(SYNTAX_ATTRIBUTE)?.match(RE_SYNTAXCONTAINER))
    .forEach(function (e) {
      let syn = parseMarkup(e.getAttribute(SYNTAX_ATTRIBUTE) || '')
      if (syn.name) {
        elements.set(syn.name, e)
      }
    })
  return elements
}
export function firstObjectKey(object: Record<string, any>, keys: Array<string>) {
  for (let key of keys) {
    if (object.hasOwnProperty(key)) {
      return key
    }
  }
}
/**
 * Detects type from @, #, and $ prefixes for string, number, and time and position.
 *
 * @param col_id The column id to parse.
 */

export function columnIdentifier(col_id: string): [ColumnType, number] | undefined {
  let match = col_id.match(RE_COLUMNID)
  if (match) {
    const prefix = col_id.charAt(0)
    const index = col_id.substring(1)
    if (COLUMN_SYMBOL_TO_DATA_TYPE.hasOwnProperty(prefix)) {
      return [COLUMN_SYMBOL_TO_DATA_TYPE[prefix], Number.parseInt(index)]
    }
  }
}
export function textAlignmentForElement(element: Element | null) {
  while (element && element.tagName !== 'SVG') {
    if (elementHasOptions(element, KEYS.textAlign)) {
      let syn = elementMarkup(element)
      let key = firstObjectKey(syn.opts, KEYS.textAlign)
      if (key) {
        return syn.opts[key].toString()
      }
    }
    element = element.parentElement
  }
}
export function condition(text: string, clean: boolean = true): Condition | undefined {
  const matches = text.match(RE_CONDITION)
  if (matches && matches.length >= 4) {
    let value = matches[3]
    if (clean) {
      value = value.replace(/_/g, ' ')
    }
    const indColParse = columnIdentifier(matches[1])
    let indexColumn = undefined
    if (indColParse) {
      indexColumn = { type: matches[1][0], index: indColParse[1] }
    }
    if (matches[1])
      return {
        column: matches[1],
        indexColumn: indexColumn,
        value: value,
        comparison: matches[2],
      }
  }
}
/**
 * Returns column from data from either a name or type and index.
 *
 * @param col_str The string that is either a name or type/index.
 */

export function columnFromData(col_str: string, data: DataView) {
  const col_id = columnIdentifier(col_str)
  let col: Column | undefined
  if (col_id) {
    const [type, index] = col_id
    col = data.getColumn(index, type)
  } else {
    col = data.getColumn(col_str)
  }
  return col
}
export function filter(text: string, clean: boolean = true): Filter | undefined {
  const cond = condition(text, clean)
  if (cond) {
    return {
      condition: cond,
    }
  } else if (isFinite(Number(text))) {
    return {
      index: Number(text),
    }
  }
}
export function filtersForElement(element: Element | null) {
  const filters: Filter[] = []
  while (element && element.tagName !== 'SVG') {
    if (elementHasOptions(element, KEYS.filter)) {
      let syn = elementMarkup(element)
      let key = firstObjectKey(syn.opts, KEYS.filter)
      if (key) {
        const filter_str = syn.opts[key].toString()
        const f = filter(filter_str)
        if (f) {
          filters.unshift(f)
        }
      }
    }
    element = element.parentElement
  }
  return filters
}
export function elementHasOptions(element: Element, options: string[]) {
  if (hasMarkup(element)) {
    let syn = elementMarkup(element)
    for (let option in syn.opts) {
      if (options.includes(option)) {
        return true
      }
    }
  }
  return false
}
