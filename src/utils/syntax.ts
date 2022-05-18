import { DataView } from '../data/data'
import { Column, ColumnType } from '../data/column'
import { Condition, Filter } from '../data/filter'
import { trimChars } from './string'

export const RE_DOUBLEBRACE = /{{([^}]+)}}/g

export const RE_NOVALUEKEY = /(?:^|,)(\w+)(?:$|,)/g
export const RE_NONJSONCHAR = /([^:,]+)/g
export const RE_NUMBER = /[-+]?[0-9]*\.?[0-9]+/g
export const RE_NUMBERONLY = /^[-+]?[0-9]*\.?[0-9]+$/g
export const RE_COLUMNID = /^[@#$][0-9]+$/g
export const RE_CONDITION = /([^<>=]+)([<>=]+)([^<>=]+)/
export const RE_FONTFAMILY = /font-family:['"]*([^'";]*)['"]*/g

export const TRIM_CHARS = [' ', '_']
export const RANGE_TRIM_CHARS = [' ', '_', '-']

export const GENERIC_FONT_FAMILIES = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  'times',
  'times new roman',
]

const COL_ID_TYPE_PREFIXES: Record<string, ColumnType> = {
  '@': ColumnType.String,
  '#': ColumnType.Number,
  $: ColumnType.Date,
}



/**
 * Encodes simplpified object literal into formal JSON syntax with quotes.
 *
 * @param text The text to encode to proper JSON.
 */
function jsonEncodeLiteral(text: string) {
  return (
    '{' +
    text
      .replace(RE_NOVALUEKEY, function (match, g1) {
        return match.replace(g1, trimChars(g1, TRIM_CHARS) + ':true')
      })
      .replace(RE_NONJSONCHAR, function (match, g1) {
        if (match !== 'true' && match !== 'false' && !RE_NUMBERONLY.test(match)) {
          return '"' + trimChars(match, TRIM_CHARS) + '"'
        }
        return trimChars(match, TRIM_CHARS)
      }) +
    '}'
  )
}



interface Markup {
  name: string
  opts: Record<string, string | number | boolean>
}

/**
 * Creates an object from a string in the format {{param|opt:val,opt:val}}.
 *
 * @param text The text to decode.
 */
export function markup(text: string): Markup {
  let obj: Markup = {
    name: '',
    opts: {},
  }
  const matches = text.match(RE_DOUBLEBRACE)
  if (matches) {
    text = matches[0].slice(2, -2)
    if (text.includes('|')) {
      const name_opts = text.split('|')
      obj.name = trimChars(name_opts[0], TRIM_CHARS)
      obj.opts = JSON.parse(jsonEncodeLiteral(name_opts[1]))
    } else if (text.includes(':')) {
      obj.opts = JSON.parse(jsonEncodeLiteral(text))
    } else {
      obj.name = trimChars(text, TRIM_CHARS)
    }
  }
  return obj
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
  return Array.from(svg.querySelectorAll<SVGElement>('*[id]'))
    .filter((e) => e.id?.match(RE_DOUBLEBRACE))
    .filter(function (e) {
      let syn = markup(e.id)
      for (let option in syn.opts) {
        if (options.includes(option)) {
          return true
        }
      }
      return false
    })
}

export function elementHasOptions(element: Element, options: string[]) {
  if (element.id?.match(RE_DOUBLEBRACE)) {
    let syn = markup(element.id)
    for (let option in syn.opts) {
      if (options.includes(option)) {
        return true
      }
    }
  }
  return false
}

/**
 * Returns a map of the name (in annotation syntax) of an element to a refernce to that element.
 *
 * @param svg The parent element to search through the children of.
 */
export function elementsByName(svg: Element) {
  const elements: Map<string, Element> = new Map()
  Array.from(svg.querySelectorAll<SVGElement>('*[id]'))
    .filter((e) => e.id?.match(RE_DOUBLEBRACE))
    .forEach(function (e) {
      let syn = markup(e.id)
      console.log( syn )
      if (syn.name) {
        elements.set(syn.name, e)
      }
    })
  return elements
}

/**
 * Parses the various range syntax into its two numbers if possible.
 *
 * @param text The text to parse into a tupled range.
 */
export function range(text: string) {
  let delim = undefined
  text = text.replace(/_/g, ' ')
  if (text.includes('..')) {
    delim = '..'
  } else if (text.includes('to')) {
    delim = 'to'
  } else if (text.includes(';')) {
    delim = ';'
  }
  if (delim) {
    let vals = text.split(delim)
    if (delim === ';') {
      vals = vals.map((v) => trimChars(v, RANGE_TRIM_CHARS))
    } else {
      vals = vals.map(function (v) {
        while (v.includes('--')) {
          v = v.replace('--', '-')
        }
        if (v.charAt(v.length - 1) === '-') {
          v = v.substr(0, v.length - 1)
        }
        return v
      })
    }
    if (vals.length > 1) {
      return { 0: Number(vals[0].trim()), 1: Number(vals[1].trim()) }
    }
  } else {
    return { 0: Number(text.trim()), 1: undefined }
  }
  return { 0: undefined, 1: undefined }
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
    if (COL_ID_TYPE_PREFIXES.hasOwnProperty(prefix)) {
      return [COL_ID_TYPE_PREFIXES[prefix], Number.parseInt(index)]
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

export function textAlignmentForElement(element: Element | null) {
  while (element && element.tagName !== 'SVG') {
    if (elementHasOptions(element, ['textAlign', 'ta'])) {
      let syn = markup(element.id)
      let key = firstObjectKey(syn.opts, ['textAlign', 'ta'])
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
    return {
      column: matches[1],
      value: value,
      comparison: matches[2],
    }
  }
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
    if (elementHasOptions(element, ['filter', 'f'])) {
      let syn = markup(element.id)
      let key = firstObjectKey(syn.opts, ['filter', 'f'])
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


