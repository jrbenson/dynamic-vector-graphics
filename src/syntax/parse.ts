import {
  DEFAULT_SYNTAX,
  DEFAULT_SYNTAX_ARRANGE,
  DEFAULT_SYNTAX_COLUMN,
  DEFAULT_SYNTAX_CONDITION,
  DEFAULT_SYNTAX_COORD,
  DEFAULT_SYNTAX_DIMENSION,
  DEFAULT_SYNTAX_ENABLEABLE,
  DEFAULT_SYNTAX_JUSTIFY,
  DEFAULT_SYNTAX_RATIO,
  DEFAULT_SYNTAX_REFERENCE,
  JUSTIFICATIONS,
  SYNTAX_ATTRIBUTE,
  RE_SYNTAXCONTAINER,
  TRIM_CHARS,
  RANGE_TRIM_CHARS,
  COLUMN_SYMBOLS,
  RE_COLUMNID,
  RE_CONDITION,
  RE_NONJSONCHAR,
  RE_NOVALUEKEY,
  RE_NUMBERONLY,
} from './syntax'
import { trimChars } from '../utils/string'
import { objIsSubset, trimObjProperties } from '../utils/obj'

/**
 * Parses the syntax from an element's data attribute.
 *
 * @param element The element to parse the syntax from.
 */
export function parseElementSyntax(element: Element) {
  let text = element.id
  if (element.hasAttribute(SYNTAX_ATTRIBUTE)) {
    text = element.getAttribute(SYNTAX_ATTRIBUTE) || ''
  }
  return parseSyntax(text)
}

/**
 * Parses the syntax from a string.
 *
 * @param text The text to parse the syntax from.
 */
export function parseSyntax(text: string) {
  const syntax = structuredClone(DEFAULT_SYNTAX)
  const [name, opts] = parseNameAndComps(text)
  const usedKeys: (keyof typeof DEFAULT_SYNTAX)[] = []
  if (name) {
    syntax.name = name
    usedKeys.push('name')
  }
  for (let opt of opts) {
    const key = opt[0]
    const code = opt[1] + ''
    const syntaxKey = getOfficialKey(key) as keyof typeof syntax
    if (syntax.hasOwnProperty(syntaxKey)) {
      usedKeys.push(syntaxKey)
      const syntaxEntry: any = syntax[syntaxKey]
      if (objIsSubset(DEFAULT_SYNTAX_ENABLEABLE, syntaxEntry)) {
        syntaxEntry.enabled = true
      }
      if (objIsSubset(DEFAULT_SYNTAX_CONDITION, syntaxEntry)) {
        const condition = parseCondition(code)
        syntaxEntry.condition = condition?.condition
        if (condition?.hasOwnProperty('column')) {
          syntaxEntry.column = condition.column
        } else {
          delete syntaxEntry.column
        }
      } else if (objIsSubset(DEFAULT_SYNTAX_COLUMN, syntaxEntry)) {
        syntaxEntry.column = parseColumn(code)
      }
      if (objIsSubset(DEFAULT_SYNTAX_DIMENSION, syntaxEntry)) {
        syntaxEntry.dimension = parseDimension(key)
      }
      if (objIsSubset(DEFAULT_SYNTAX_COORD, syntaxEntry)) {
        const coord = parseRange(code)
        if (coord[0] != undefined && coord[1] != undefined) {
          syntaxEntry.coord.x = coord[0]
          syntaxEntry.coord.y = coord[1]
        } else {
          console.error(`Error parsing range from ${code}`)
        }
      }
      if (objIsSubset(DEFAULT_SYNTAX_REFERENCE, syntaxEntry)) {
        syntaxEntry.reference = code
      }
      if (objIsSubset(DEFAULT_SYNTAX_RATIO, syntaxEntry)) {
        syntaxEntry.ratio = Number(code)
      }
      if (objIsSubset(DEFAULT_SYNTAX_ARRANGE, syntaxEntry)) {
        syntaxEntry.arrange = parseArrangement(key)
      }
      if (objIsSubset(DEFAULT_SYNTAX_JUSTIFY, syntaxEntry)) {
        if (JUSTIFICATIONS.includes(code as any)) {
          syntaxEntry.justify = code as typeof JUSTIFICATIONS[number]
        } else {
          console.error(`Justification ${code} not valid`)
        }
      }
      // Remove keys from syntax object
      if (syntaxEntry.hasOwnProperty('keys')) {
        delete syntaxEntry.keys
      }
    }
  }
  trimObjProperties(syntax, usedKeys as string[])
  return syntax
}

/**
 * Parses the dimension from a key. A dimension is either 'x', 'y', or 'both' and is parsed from the last characters of the key.
 *
 * @param key The key to parse the dimension from.]
 * @returns The extracted dimension.
 */
export function parseDimension(key: string) {
  const lastChar = key.charAt(key.length - 1).toLowerCase()
  if (lastChar === 'x' || lastChar === 'y') {
    return lastChar
  }
  return 'both'
}

/**
 * Parses the arrangement from a key. An arrangement is either 'x', 'y', 'wrap', 'slots', or 'both' and is parsed from the last characters of the key.
 *
 * @param key The key to parse the arrangement from.
 * @returns The extracted arrangement.
 */
export function parseArrangement(key: string) {
  const lcKey = key.toLowerCase()
  if (lcKey.endsWith('x')) {
    return 'x'
  } else if (lcKey.endsWith('y')) {
    return 'y'
  } else if (lcKey.endsWith('wrap') || lcKey.endsWith('w')) {
    return 'wrap'
  } else if (lcKey.endsWith('slots') || lcKey.endsWith('s')) {
    return 'slots'
  } else {
    return 'both'
  }
}

/**
 * Parses the name and components from a string. The name and components are separated by a pipe character.
 *
 * @param text The text to parse the name and components from.
 * @returns A tuple containing the name and components.
 */
export function parseNameAndComps(text: string): [string, [string, string][]] {
  let name = ''
  let comps: [string, string][] = []
  const matches = text.match(RE_SYNTAXCONTAINER)
  if (matches) {
    const code = matches[0].slice(2, -2)
    if (code.includes('|')) {
      const name_opts = code.split('|')
      name = trimChars(name_opts[0], TRIM_CHARS)
      comps = parseComps(name_opts[1])
    } else if (code.includes(':')) {
      comps = parseComps(code)
    } else {
      name = trimChars(code, TRIM_CHARS)
    }
  }
  return [name, comps]
}
export function parseComps(text: string) {
  const parseComps: [string, string][] = []
  const jsonObj = JSON.parse(jsonEncodeLiteral(text))
  for (const key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      parseComps.push([key, jsonObj[key]])
    }
  }
  return parseComps
}

/**
 * Parses the various range syntax into its two numbers if possible.
 *
 * @param text The text to parse into a tupled range.
 * @returns A tuple containing the two numbers. A number can be undefined if it could not be parsed.
 */
export function parseRange(text: string) {
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
          v = v.substring(0, v.length - 1)
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

/**
 * Parses the column from a string.
 *
 * @param text The text to parse the column from.
 * @returns The parsed column as either an index or name type.
 */
export function parseColumn(text: string) {
  const column = parseIndexedColumn(text)
  if (column) {
    return { type: 'index', index: column }
  } else {
    return { type: 'name', name: text }
  }
}

/**
 * Attempts to parse an indexed column from a string, meaning it has a type symbol followed by a number.
 *
 * @param text The text to parse the indexed column from.
 * @returns An object containing the type and value of the column. Returns undefined if the column is not an indexed type.
 */
export function parseIndexedColumn(text: string) {
  let match = text.match(RE_COLUMNID)
  if (match) {
    const sym = text.charAt(0)
    const index = text.substring(1)
    if (COLUMN_SYMBOLS.hasOwnProperty(sym) && Number.isInteger(Number.parseInt(index))) {
      return { type: COLUMN_SYMBOLS[sym], value: Number.parseInt(index) }
    }
  }
}

/**
 * Parses the condition from a string.
 *
 * @param text The text to parse the condition from.
 * @returns The parsed condition as either a comparison or index type, including the column if a comparison type.
 */
export function parseCondition(text: string) {
  const matches = text.match(RE_CONDITION)
  if (matches && matches.length >= 4) {
    let value = matches[3]
    value = value.replace(/_/g, ' ')
    const column = parseColumn(matches[1])
    if (matches[1])
      return {
        column: column,
        condition: {
          type: 'comparison',
          comparison: matches[2],
          value: value,
        },
      }
  } else {
    return { condition: { type: 'index', index: Number(text) } }
  }
}
/**
 * Encodes simplpified object literal into formal JSON syntax with quotes.
 *
 * @param text The text to encode to proper JSON.
 * @returns The JSON encoded text.
 */

export function jsonEncodeLiteral(text: string) {
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

/**
 * Returns the official key for a given key. Uses the default syntax object to resolve the keys.
 *
 * @param key The key to get the official key for.
 * @returns The official key.
 */
export function getOfficialKey(key: string) {
  for (const officialKey in DEFAULT_SYNTAX) {
    if (DEFAULT_SYNTAX.hasOwnProperty(officialKey)) {
      const syntaxKey = officialKey as keyof typeof DEFAULT_SYNTAX
      const syntaxEntry: any = DEFAULT_SYNTAX[syntaxKey]
      if (syntaxEntry.keys && syntaxEntry.keys.includes(key)) {
        return officialKey
      }
    }
  }
  return key
}
