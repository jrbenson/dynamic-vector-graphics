import { Data } from '../../src/data/data'
import { ColumnType } from '../../src/data/column'

import { DATA_MINIMAL } from './data-construction.test'

test('Automatic Column Statistics', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.min('ColumnInt')).toBe(1)
  expect(d.max('ColumnInt')).toBe(6)
  expect(d.sum('ColumnInt')).toBe(10)
  expect(d.avg('ColumnInt')).toBeCloseTo(10 / 3)
})

test('Manual Column Statistics', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.min('ColumnInt')).toBe(1)
  expect(d.max('ColumnInt')).toBe(6)

  d.setColumnStats('ColumnInt', { min: -20 })
  d.calcColumnStats()

  expect(d.min('ColumnInt')).toBe(-20)
  expect(d.max('ColumnInt')).toBe(6)
})

test('Column Renaming', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.cols).toContain('ColumnInt')

  d.renameColumn('ColumnInt', 'IntColumn')

  expect(d.cols).not.toContain('ColumnInt')
  expect(d.cols).toContain('IntColumn')

  expect(d.get(0, 'IntColumn')).toBe(1)
})

test('Column Dropping', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.cols).toContain('ColumnInt')

  d.dropColumn('ColumnInt')

  expect(d.get(0, 'ColumnFloat')).toBeCloseTo(2.8)

  expect(d.cols).not.toContain('ColumnInt')

  expect(d.get(0, 'ColumnInt')).toBeUndefined()
  expect(d.min('ColumnInt')).toBeUndefined()
})

test('Column Casting', () => {
  let d = new Data(DATA_MINIMAL)

  d.castColumn('ColumnStrInt', ColumnType.Number)

  expect(d.getColumn('ColumnStrInt')?.type).toBe(ColumnType.Number)
  expect(d.get(0, 'ColumnStrInt')).toBe(6)
  expect(d.min('ColumnStrInt')).toBe(1)
})

test('Column Access', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.getColumn('ColumnInt')?.name).toBe('ColumnInt')
  expect(d.getColumn(1)?.name).toBe('ColumnInt')

  expect(d.getColumn(0, ColumnType.Number)?.name).toBe('ColumnInt')
  expect(d.getColumn(1, ColumnType.Number)?.name).toBe('ColumnFloat')
  expect(d.getColumn(1, ColumnType.String)?.name).toBe('ColumnStrInt')

  d.castColumn('ColumnStrInt', ColumnType.Number)

  expect(d.getColumn(2, ColumnType.Number)?.name).toBe('ColumnStrInt')
  expect(d.getColumn(1, ColumnType.String)?.name).toBeUndefined()
})
