import { Data } from '../../src/data/data'

import { DATA_MINIMAL } from './data-construction.test'

test('Row Condition Evaluation', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.getRow(1)?.evaluate('ColumnStr', 'Beta')).toBeTruthy()
  expect(d.getRow(1)?.evaluate('ColumnStr', 'Alpha')).toBeFalsy()
  expect(d.getRow(2)?.evaluate('ColumnStr', 'Gamma', '=')).toBeTruthy()

  expect(d.getRow(0)?.evaluate('ColumnInt', '1')).toBeTruthy()
  expect(d.getRow(0)?.evaluate('ColumnInt', 1)).toBeTruthy()

  expect(d.getRow(0)?.evaluate('ColumnInt', 1, '>=')).toBeTruthy()
  expect(d.getRow(0)?.evaluate('ColumnInt', 1, '>')).toBeFalsy()
  expect(d.getRow(0)?.evaluate('ColumnInt', 0, '>')).toBeTruthy()

  expect(d.getRow(1)?.evaluate('ColumnInt', 6, '<=')).toBeTruthy()
  expect(d.getRow(1)?.evaluate('ColumnInt', 6, '<')).toBeFalsy()
  expect(d.getRow(1)?.evaluate('ColumnInt', 7, '<')).toBeTruthy()
})

test('Data View Filtering', () => {
  let d = new Data(DATA_MINIMAL)

  expect(d.filteredView('ColumnStr=Gamma').get(0, 'ColumnInt')).toBe(3)
  expect(d.filteredView('@0=Gamma').get(0, 'ColumnInt')).toBe(3)
  expect(d.filteredView('@0==Alpha').get(0, 'ColumnInt')).toBe(1)

  expect(d.filteredView('ColumnInt>1').get(0, 'ColumnFloat')).toBeCloseTo(4.4)
  expect(d.filteredView('#0>1').get(1, 'ColumnFloat')).toBeCloseTo(8.3)
})
