import { Data } from '../../src/data/data'
import { ColumnType } from '../../src/data/column'

import { DATA_RANGES } from './data-construction.test'

test('Value Normalization', () => {
  let d = new Data(DATA_RANGES)

  expect(d.getNormalized(0, 'ColumnInt')).toBeCloseTo(0.1)
  expect(d.getNormalized(2, 'ColumnFloat')).toBeCloseTo(0.83)
})
