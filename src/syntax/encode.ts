import { objIsSubset } from '../utils/obj'
import { toTitleCase } from '../utils/string'
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
  Syntax,
  SyntaxColumn,
} from './syntax'

export function encodeSyntax(syntax: Syntax) {
  let codeLines = []

  const defaultSyntax = structuredClone(DEFAULT_SYNTAX)

  for (const key in syntax) {
    let codeKey = key
    let codeValue = ''
    if (syntax.hasOwnProperty(key)) {
      const comp = syntax[key]
      if (objIsSubset(DEFAULT_SYNTAX_ENABLEABLE, comp) && !comp.enabled) {
        continue
      }
      if (objIsSubset(DEFAULT_SYNTAX_CONDITION, comp)) {
        codeValue += `${encodeColumnAndCondition(comp)}`
      } else if (objIsSubset(DEFAULT_SYNTAX_COLUMN, comp)) {
        codeValue += `${encodeColumn(comp.column)}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_COORD, comp)) {
        codeValue += `${encodeRange(comp.coord.x, comp.coord.y)}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_ARRANGE, comp)) {
        codeKey += `${encodeArrangementSuffix(comp.arrange)}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_DIMENSION, comp)) {
        codeKey += `${encodeDimensionSuffix(comp.dimension)}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_REFERENCE, comp)) {
        codeValue += `${comp.reference}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_JUSTIFY, comp)) {
        codeValue += `${comp.justify}`
      }
      if (objIsSubset(DEFAULT_SYNTAX_RATIO, comp)) {
        codeValue += `${comp.ratio}`
      }
      if (comp.hasOwnProperty('value')) {
        codeValue += `${comp.value},`
      }
    }
    if (codeKey && codeValue) {
      codeLines.push(`${codeKey}:${codeValue}`)
    }
  }

  let mergedCode = ''
  if (syntax.name || codeLines.length > 0) {
    mergedCode += '{{'
    if (syntax.name) {
      mergedCode += syntax.name
      if (codeLines.length > 0) {
        mergedCode += '|'
      }
    }
    if (codeLines.length > 0) {
      mergedCode += codeLines.join(',')
    }
    mergedCode += '}}'
  }

  return mergedCode
}

function encodeColumn(column: any) {
  let code = ''
  if (column.type === 'index') {
    const typeSymbol = getKeyByValue(COLUMN_SYMBOLS, column.index.type)
    code += `${typeSymbol}${column.index.value}`
  } else if (column.type === 'name') {
    code += `${column.name}`
  }
  return code
}

function encodeCondition(condition: any) {
  let code = ''
  if (condition.type === 'index') {
    code += `${condition.index}`
  } else if (condition.type === 'comparison') {
    code += `${condition.comparison}${condition.value}`
  }
  return code
}

function encodeColumnAndCondition(component: any) {
  let code = ''
  if (component.condition && component.condition.type === 'index') {
    code += encodeCondition(component.condition)
  } else if (component.condition && component.column) {
    code += `${encodeColumn(component.column)}${encodeCondition(component.condition)}`
  }
  return code
}

function encodeDimensionSuffix(dimension: string) {
  let suffix = ''
  if (dimension !== 'both') {
    suffix = dimension.toUpperCase()
  }
  return suffix
}

function encodeArrangementSuffix(arrangement: string) {
  let suffix = ''
  if (arrangement !== 'both') {
    suffix = toTitleCase(arrangement)
  }
  return suffix
}

function encodeRange(start: number, end: number) {
  let code = ''
  if (start !== undefined && end !== undefined) {
    code = `${start};${end}`
  }
  return code
}

function getKeyByValue(COLUMN_SYMBOLS: Record<string, string>, value: string) {
  for (let key in COLUMN_SYMBOLS) {
    if (COLUMN_SYMBOLS[key] === value) {
      return key
    }
  }
}
