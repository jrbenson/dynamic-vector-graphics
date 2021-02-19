import Data from '../../src/data/data'
import { dataStats } from '../../src/utils/parse'

export const DATA_MINIMAL = {
  values: [
    ['Alpha', 1, 2.8, '6'],
    ['Beta', 6, 4.4, '1'],
    ['Gamma', 3, 8.3, '3'],
  ],
  columns: ['ColumnStr', 'ColumnInt', 'ColumnFloat', 'ColumnStrInt'],
}

export const DATA_RANGES = {
  values: [
    ['Alpha', 1, 2.8, '6'],
    ['Beta', 6, 4.4, '1'],
    ['Gamma', 3, 8.3, '3'],
  ],
  columns: ['ColumnStr', 'ColumnInt {{0..10}}', 'ColumnFloat {{0.0..10.0}}', 'ColumnStrInt {{0..10}}'],
}

export const DATA_RANGES_FORMATS = {
  values: [
    ['Alpha', 1, 2.8, '6'],
    ['Beta', 6, 4.4, '1'],
    ['Gamma', 3, 8.3, '3'],
  ],
  columns: ['ColumnStr', 'ColumnInt {{0..10}}', 'ColumnFloat {{0.0..10.0}}', 'ColumnStrInt {{0..10}}'],
}

export const DATA_RANGES_CSV = `
ColumnStr, ColumnInt {{0..10}}, ColumnFloat {{0.0..10.0}}, ColumnStrInt {{0..10}}
"Alpha", 1, 2.8, "6"
"Beta", 6, 4.4, "1"
"Gamma", 3, 8.3, "3"
`

export const DATA_RANGES_FORMATS_CSV = `
"ColumnStr", "ColumnInt {{0..10,format:DOLLAR2}}", "ColumnFloat {{0.0..10.0}}", "ColumnStrInt {{0..10}}"
"Alpha", 1, 2.8, "6"
"Beta", 6, 4.4, "1"
"Gamma", 3, 8.3, "3"
`

test('Data Construction', () => {
  let d = new Data(DATA_RANGES)

  expect(d.get(0, 'ColumnStr')).toBe('Alpha')
  expect(d.get(1, 'ColumnStr')).toBe('Beta')
  expect(d.get(2, 'ColumnStr')).toBe('Gamma')
  expect(d.get(12, 'ColumnStr')).toBeUndefined()

  expect(d.get(0, 'ColumnInt')).toBe(1)
  expect(d.get(1, 'ColumnInt')).toBe(6)
  expect(d.get(2, 'ColumnInt')).toBe(3)
  expect(d.get(12, 'ColumnInt')).toBeUndefined()
  expect(d.get(0, 'NonExistent')).toBeUndefined()

  expect(d.getFormatted(0, 'ColumnStr')).toBe('Alpha')
  expect(d.getFormatted(1, 'ColumnStr')).toBe('Beta')
  expect(d.getFormatted(2, 'ColumnStr')).toBe('Gamma')
  expect(d.getFormatted(12, 'ColumnStr')).toBe('???')

  expect(d.getFormatted(0, 'ColumnInt')).toBe('1')
  expect(d.getFormatted(1, 'ColumnInt')).toBe('6')
  expect(d.getFormatted(2, 'ColumnInt')).toBe('3')
  expect(d.getFormatted(12, 'ColumnInt')).toBe('???')

  expect(d.getFormatted(0, 'NonExistent')).toBe('???')
})

// test('Data Construction from VA', () => {
//   let d = Data.fromVA(SAMPLE_MESSAGE_1)

//   expect(d.get(0, 'Revenue')).toBeCloseTo(403611.52993069455)
//   expect(d.min('Revenue')).toBeCloseTo(403611.52993069455)

//   expect(d.get(0, 'Expenses')).toBeCloseTo(120.37471949000783)
//   expect(d.min('Expenses')).toBeCloseTo(120.37471949000783)

//   expect(d.getFormatted(0, 'Department')).toBe('Beach')
//   expect(d.getFormatted(9999, 'Department')).toBe('???')

//   expect(d.getFormatted(0, 'Revenue')).toBe('$403,611.53')
//   expect(d.getFormatted(9999, 'Revenue')).toBe('???')

//   expect(d.getFormatted(0, 'Revenue', true)).toBe('$404K')
//   expect(d.getFormatted(9999, 'Revenue', true)).toBe('???')

//   expect(d.getFormatted(0, 'Date')).toBe('Jul')
//   expect(d.getFormatted(9999, 'Date')).toBe('???')
// })

// test('Data Parsing from VA - Column Tags', () => {
//   let d = Data.fromVA(SAMPLE_MESSAGE_1)
//   d = dataStats(d)

//   expect(d.min('Revenue')).toBeCloseTo(140.48547547574043)
//   expect(d.max('Revenue')).toBeCloseTo(2595.146703562358)

//   expect(d.min('Expenses')).toBeCloseTo(14.51235099824859)
//   expect(d.max('Expenses')).toBeCloseTo(885.5554616588712)

//   expect(d.cols).not.toContain('Expenses {{min}}')
// })

// test('Data Parsing from VA - Column Stats', () => {
//   let d = Data.fromVA(SAMPLE_MESSAGE_2)
//   d = dataStats(d)

//   expect(d.cols).toContain('Revenue')
//   expect(d.cols).toContain('Expenses')

//   expect(d.min('Revenue')).toBeCloseTo(0.5)
//   expect(d.max('Revenue')).toBeCloseTo(4820.5)

//   expect(d.min('Expenses')).toBeCloseTo(0)
//   expect(d.max('Expenses')).toBeCloseTo(300)
// })
