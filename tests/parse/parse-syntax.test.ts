import { parseSyntax } from '../../src/syntax/parse'
import { encodeSyntax } from '../../src/syntax/encode'

global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

const testSyntax1 = `{{test01|unify:#0,positionX:#1,duplicateSlots:@1,filter:@0<=42,origin:0.5;0.5}}`

test('Syntax Parsing', () => {
  const syntax = parseSyntax(testSyntax1)
  expect(syntax).toEqual({
    name: 'test01',
    unify: {
      enabled: true,
      column: {
        type: 'index',
        index: { type: 'number', value: 0 },
      },
    },
    position: {
      enabled: true,
      dimension: 'x',
      column: {
        type: 'index',
        index: { type: 'number', value: 1 },
      },
    },
    duplicate: {
      enabled: true,
      column: {
        type: 'index',
        index: { type: 'string', value: 1 },
      },
      arrange: 'slots',
    },
    filter: {
      enabled: true,
      column: {
        type: 'index',
        index: { type: 'string', value: 0 },
      },
      condition: {
        type: 'comparison',
        comparison: '<=',
        value: '42',
      },
    },
    origin: {
      coord: {
        x: 0.5,
        y: 0.5,
      },
    },
  })
})

const BASIC_ENCODES = [
  `{{nameOnly}}`,
  `{{name|position:#0}}`,
  `{{unify:#2}}`,
  `{{filter:@0=42}}`,
  `{{filter:4}}`,
  `{{positionX:#0}}`,
  `{{duplicateSlots:@1}}`,
  `{{origin:0.5;0.5}}`,
  `{{justify:end}}`,
  `{{scale:#0}}`,
  `{{scaleY:#1}}`,
  `{{rotate:#2}}`,
  `{{guide:mypath}}`,
  `{{fill:#3}}`,
  `{{alpha:#4}}`,
  `{{textAlign:end}}`,
  `{{rotateRatio:0.2}}`,
]
test('Basic Syntax Encoding', () => {
  for (let code of BASIC_ENCODES) {
    expect(encodeSyntax(parseSyntax(code))).toEqual(code)
  }
})

const SHORTHAND_ENCODES = [
  [`{{px:#0}}`, `{{positionX:#0}}`],
  [`{{py:#0}}`, `{{positionY:#0}}`],
  [`{{sx:#0}}`, `{{scaleX:#0}}`],
  [`{{sy:#0}}`, `{{scaleY:#0}}`],
  [`{{r:#0}}`, `{{rotate:#0}}`],
  [`{{p:#0}}`, `{{position:#0}}`],
]
test('Shorthand Syntax Encoding', () => {
  for (let [shorthand, full] of SHORTHAND_ENCODES) {
    expect(encodeSyntax(parseSyntax(shorthand))).toEqual(full)
  }
})
