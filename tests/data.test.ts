import { Data, ColumnType } from '../src/data'
import { SAMPLE_MESSAGE_1, SAMPLE_MESSAGE_2 } from '../src/samples'
import { dataStats } from '../src/parse'

const COLS1 = ['ColumnStr', 'ColumnInt', 'ColumnFloat', 'ColumnStrInt']
const DATA1 = [
  ['Alpha', 1, 2.8, '6'],
  ['Beta', 6, 4.4, '1'],
  ['Gamma', 3, 8.3, '3'],
]

test('Data Construction', () => {
  let d = new Data(DATA1, COLS1)

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

test('Automatic Column Statistics', () => {
  let d = new Data(DATA1, COLS1)

  expect(d.min('ColumnInt')).toBe(1)
  expect(d.max('ColumnInt')).toBe(6)
  expect(d.sum('ColumnInt')).toBe(10)
  expect(d.avg('ColumnInt')).toBeCloseTo(10 / 3)
})

test('Manual Column Statistics', () => {
  let d = new Data(DATA1, COLS1)

  expect(d.min('ColumnInt')).toBe(1)
  expect(d.max('ColumnInt')).toBe(6)

  d.setColumnStats('ColumnInt', { min: -20 })
  d.calcColumnStats()

  expect(d.min('ColumnInt')).toBe(-20)
  expect(d.max('ColumnInt')).toBe(6)
})

test('Column Renaming', () => {
  let d = new Data(DATA1, COLS1)

  expect(d.cols).toContain('ColumnInt')

  d.renameColumn('ColumnInt', 'IntColumn')

  expect(d.cols).not.toContain('ColumnInt')
  expect(d.cols).toContain('IntColumn')

  expect(d.get(0, 'IntColumn')).toBe(1)
})

test('Column Dropping', () => {
  let d = new Data(DATA1, COLS1)

  expect(d.cols).toContain('ColumnInt')

  d.dropColumn('ColumnInt')

  expect(d.get(0, 'ColumnFloat')).toBeCloseTo(2.8)

  expect(d.cols).not.toContain('ColumnInt')

  expect(d.get(0, 'ColumnInt')).toBeUndefined()
  expect(d.min('ColumnInt')).toBeUndefined()
})

test('Column Casting', () => {
  let d = new Data(DATA1, COLS1)

  d.castColumn('ColumnStrInt', ColumnType.Number)

  expect(d.getColumn('ColumnStrInt')?.type).toBe(ColumnType.Number)
  expect(d.get(0, 'ColumnStrInt')).toBe(6)
  expect(d.min('ColumnStrInt')).toBe(1)
})

test('Column Access', () => {
  let d = new Data(DATA1, COLS1)

  expect(d.getColumn('ColumnInt')?.name).toBe('ColumnInt')
  expect(d.getColumn(1)?.name).toBe('ColumnInt')

  expect(d.getColumn(0, ColumnType.Number)?.name).toBe('ColumnInt')
  expect(d.getColumn(1, ColumnType.Number)?.name).toBe('ColumnFloat')
  expect(d.getColumn(1, ColumnType.String)?.name).toBe('ColumnStrInt')

  d.castColumn('ColumnStrInt', ColumnType.Number)

  expect(d.getColumn(2, ColumnType.Number)?.name).toBe('ColumnStrInt')
  expect(d.getColumn(1, ColumnType.String)?.name).toBeUndefined()
})

test('Data Construction from VA', () => {
  let d = Data.fromVA(SAMPLE_MESSAGE_1)

  expect(d.get(0, 'Revenue')).toBeCloseTo(403611.52993069455)
  expect(d.min('Revenue')).toBeCloseTo(403611.52993069455)

  expect(d.get(0, 'Expenses')).toBeCloseTo(120.37471949000783)
  expect(d.min('Expenses')).toBeCloseTo(120.37471949000783)

  expect(d.getFormatted(0, 'Department')).toBe('Beach')
  expect(d.getFormatted(9999, 'Department')).toBe('???')

  expect(d.getFormatted(0, 'Revenue')).toBe('$403,611.53')
  expect(d.getFormatted(9999, 'Revenue')).toBe('???')

  expect(d.getFormatted(0, 'Revenue', true)).toBe('$404K')
  expect(d.getFormatted(9999, 'Revenue', true)).toBe('???')

  expect(d.getFormatted(0, 'Date')).toBe('Jul')
  expect(d.getFormatted(9999, 'Date')).toBe('???')
})

test('Data Parsing from VA - Column Tags', () => {
  let d = Data.fromVA(SAMPLE_MESSAGE_1)
  d = dataStats(d)

  expect(d.min('Revenue')).toBeCloseTo(140.48547547574043)
  expect(d.max('Revenue')).toBeCloseTo(2595.146703562358)

  expect(d.min('Expenses')).toBeCloseTo(14.51235099824859)
  expect(d.max('Expenses')).toBeCloseTo(885.5554616588712)

  expect(d.cols).not.toContain('Expenses {{min}}')
})

test('Data Parsing from VA - Column Stats', () => {
  let d = Data.fromVA(SAMPLE_MESSAGE_2)
  d = dataStats(d)

  expect(d.cols).toContain('Revenue')
  expect(d.cols).toContain('Expenses')

  expect(d.min('Revenue')).toBeCloseTo(0.5)
  expect(d.max('Revenue')).toBeCloseTo(4820.5)

  expect(d.min('Expenses')).toBeCloseTo(0)
  expect(d.max('Expenses')).toBeCloseTo(300)
})
