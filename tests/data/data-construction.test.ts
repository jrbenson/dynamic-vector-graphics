import { Data } from '../../src/data/data'

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

export const DATA_RANGES_CSV = `ColumnStr,ColumnInt {{0..10}},ColumnFloat {{0.0..10.0}},ColumnStrInt {{0..10}}
"Alpha",1,2.8,"6"
"Beta",6,4.4,"1"
"Gamma",3,8.3,"3"`

export const DATA_RANGES_FORMATS_CSV = `"ColumnStr","ColumnInt {{0..10|format:DOLLAR2}}","ColumnFloat {{0.0..10.0}}","ColumnStrInt {{0..10}}"
"Alpha",1,2.8,"6"
"Beta",6,4.4,"1"
"Gamma",3,8.3,"3"`

test('Structured Data Construction', () => {
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

test('CSV Data Construction', () => {
  let d = new Data(DATA_RANGES_FORMATS_CSV)

  expect(d.getFormatted(0,0)).toBe('Alpha')

  expect(d.getFormatted(0,'ColumnInt')).toBe('$1.00')
})