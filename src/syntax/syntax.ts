import { ColumnType } from '../data/column'

export const RE_SYNTAXCONTAINER = /{{([^}]+)}}/g

export const SYNTAX_ATTRIBUTE = 'data-dvg'

export const RE_NOVALUEKEY = /(?:^|,)(\w+)(?:$|,)/g
export const RE_NONJSONCHAR = /([^:,]+)/g
export const RE_NUMBER = /[-+]?[0-9]*\.?[0-9]+/g
export const RE_NUMBERONLY = /^[-+]?[0-9]*\.?[0-9]+$/g
export const RE_COLUMNID = /^[@#$?][0-9]+$/g
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

export const COLUMN_SYMBOL_TO_DATA_TYPE: Record<string, ColumnType> = {
  '@': ColumnType.String,
  '#': ColumnType.Number,
  $: ColumnType.Date,
  '?': ColumnType.Any,
}

// Syntax literals
export const JUSTIFICATIONS = ['start', 'middle', 'end', 'between', 'around', 'evenly'] as const
export const ARRANGEMENTS = ['both', 'x', 'y', 'wrap', 'slots'] as const
export const DIMENSIONS = ['both', 'x', 'y'] as const
export const COLUMN_TYPES = ['number', 'string', 'date', 'any'] as const
export const COLUMN_SYMBOLS: Record<string, string> = { '@': 'string', '#': 'number', $: 'date', '?': 'any' }
export const COMPARISONS = ['=', '<', '>', '<=', '>='] as const

// Syntax type definitions
export type SyntaxColumn = {
  column:
    | {
        type: 'index'
        index: { type: typeof COLUMN_TYPES[number]; value: number }
      }
    | {
        type: 'name'
        name: string
      }
}
type SyntaxCondition = {
  condition:
    | {
        type: 'comparison'
        comparison: typeof COMPARISONS[number]
        value: number | string
      }
    | {
        type: 'index'
        index: number
      }
}
type SyntaxDimension = { dimension: typeof DIMENSIONS[number] }
type SyntaxCoord = {
  coord: {
    x: number
    y: number
  }
}
type SyntaxReference = { reference: string }
type SyntaxArrange = { arrange: typeof ARRANGEMENTS[number] }
type SyntaxJustify = { justify: typeof JUSTIFICATIONS[number] }
type SyntaxRatio = { ratio: number }
type SyntaxKeyed = { keys: string[] }
type SyntaxEnableable = { enabled: boolean }
type SyntaxComponent = SyntaxKeyed & SyntaxEnableable & SyntaxColumn

export type Syntax = {
  [index: string]: any
  name?: string
  guide?: SyntaxKeyed & SyntaxReference
  unify?: SyntaxComponent
  filter?: SyntaxComponent & SyntaxCondition
  visible?: SyntaxComponent & SyntaxCondition
  origin?: SyntaxKeyed & SyntaxCoord
  position?: SyntaxComponent & SyntaxDimension
  scale?: SyntaxComponent & SyntaxDimension
  rotate?: SyntaxComponent
  duplicate?: SyntaxComponent & SyntaxArrange
  fill?: SyntaxComponent
  line?: SyntaxComponent
  lineWidth?: SyntaxComponent
  textWeight?: SyntaxComponent
  textSize?: SyntaxComponent
  alpha?: SyntaxComponent
  fillAlpha?: SyntaxComponent
  lineAlpha?: SyntaxComponent
  lineDash?: SyntaxComponent
  rotateRatio?: SyntaxKeyed & SyntaxRatio
  justify?: SyntaxKeyed & SyntaxJustify
  textAlign?: SyntaxKeyed & SyntaxJustify
}

// Default syntax values, also used for runtime type evaluation
const DEFAULT_SYNTAX_KEYED: SyntaxKeyed = { keys: [] }
export const DEFAULT_SYNTAX_COLUMN: SyntaxColumn = {
  column: {
    type: 'index',
    index: { type: 'number', value: 0 },
  },
}
export const DEFAULT_SYNTAX_CONDITION: SyntaxCondition = {
  condition: {
    type: 'comparison',
    comparison: COMPARISONS[0],
    value: 0,
  },
}
export const DEFAULT_SYNTAX_DIMENSION: SyntaxDimension = { dimension: DIMENSIONS[0] }
export const DEFAULT_SYNTAX_COORD: SyntaxCoord = { coord: { x: 0, y: 0 } }
export const DEFAULT_SYNTAX_RATIO: SyntaxRatio = { ratio: 1.0 }
export const DEFAULT_SYNTAX_REFERENCE: SyntaxReference = { reference: '' }
export const DEFAULT_SYNTAX_ARRANGE: SyntaxArrange = { arrange: ARRANGEMENTS[0] }
export const DEFAULT_SYNTAX_JUSTIFY: SyntaxJustify = { justify: JUSTIFICATIONS[0] }
export const DEFAULT_SYNTAX_ENABLEABLE: SyntaxEnableable = { enabled: false }
const DEFAULT_SYNTAX_COMPONENT: SyntaxEnableable & SyntaxColumn = {
  ...DEFAULT_SYNTAX_ENABLEABLE,
  ...DEFAULT_SYNTAX_COLUMN,
}
export const DEFAULT_SYNTAX: Syntax = {
  name: '',
  guide: { keys: ['guide', 'g'], ...DEFAULT_SYNTAX_REFERENCE },
  unify: { keys: ['unify', 'u'], ...DEFAULT_SYNTAX_COMPONENT },
  filter: { keys: ['filter', 'f'], ...DEFAULT_SYNTAX_COMPONENT, ...DEFAULT_SYNTAX_CONDITION },
  visible: { keys: ['visible', 'v'], ...DEFAULT_SYNTAX_COMPONENT, ...DEFAULT_SYNTAX_CONDITION },
  origin: { keys: ['origin', 'o'], ...DEFAULT_SYNTAX_COORD },
  position: {
    keys: ['position', 'p', 'positionX', 'px', 'positionY', 'py'],
    ...DEFAULT_SYNTAX_COMPONENT,
    ...DEFAULT_SYNTAX_DIMENSION,
  },
  scale: {
    keys: ['scale', 's', 'scaleX', 'sx', 'scaleY', 'sy'],
    ...DEFAULT_SYNTAX_COMPONENT,
    ...DEFAULT_SYNTAX_DIMENSION,
  },
  rotate: { keys: ['rotate', 'r'], ...DEFAULT_SYNTAX_COMPONENT },
  duplicate: {
    keys: ['duplicate', 'd', 'duplicateX', 'dx', 'duplicateY', 'dy', 'duplicateWrap', 'dw', 'duplicateSlots', 'ds'],
    ...DEFAULT_SYNTAX_COMPONENT,
    ...DEFAULT_SYNTAX_ARRANGE,
  },
  fill: { keys: ['fill', 'f'], ...DEFAULT_SYNTAX_COMPONENT },
  line: { keys: ['line', 'l'], ...DEFAULT_SYNTAX_COMPONENT },
  lineWidth: { keys: ['lineWidth', 'lw'], ...DEFAULT_SYNTAX_COMPONENT },
  textWeight: { keys: ['textWeight', 'tw'], ...DEFAULT_SYNTAX_COMPONENT },
  textSize: { keys: ['textSize', 'ts'], ...DEFAULT_SYNTAX_COMPONENT },
  alpha: { keys: ['alpha', 'a'], ...DEFAULT_SYNTAX_COMPONENT },
  fillAlpha: { keys: ['fillAlpha', 'fa'], ...DEFAULT_SYNTAX_COMPONENT },
  lineAlpha: { keys: ['lineAlpha', 'la'], ...DEFAULT_SYNTAX_COMPONENT },
  lineDash: { keys: ['lineDash', 'ld'], ...DEFAULT_SYNTAX_COMPONENT },
  rotateRatio: { keys: ['rotateRatio', 'rr'], ratio: 1.0 },
  justify: { keys: ['justify', 'j'], justify: 'start' },
  textAlign: { keys: ['textAlign', 'ta'], justify: 'start' },
}
