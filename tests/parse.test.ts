import { SAMPLE_MESSAGE_1 } from '../src/samples'
import * as parse from '../src/parse'

test('Range Parsing', () => {
  let range

  range = parse.range('-40.3to-36.5')
  expect(range[0]).toBeCloseTo(-40.3)
  expect(range[1]).toBeCloseTo(-36.5)

  range = parse.range('-40.3 to -36.5')
  expect(range[0]).toBeCloseTo(-40.3)
  expect(range[1]).toBeCloseTo(-36.5)

  range = parse.range('-40.3..-36.5')
  expect(range[0]).toBeCloseTo(-40.3)
  expect(range[1]).toBeCloseTo(-36.5)

  range = parse.range('-40.3     .. -36.5')
  expect(range[0]).toBeCloseTo(-40.3)
  expect(range[1]).toBeCloseTo(-36.5)

  range = parse.range('1..2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('1to2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('1 to 2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('  1   ..    2   ')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('1;2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('1;2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('1 ; 2')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('  1   ;    2   ')
  expect(range[0]).toBeCloseTo(1)
  expect(range[1]).toBeCloseTo(2)

  range = parse.range('.1;.2')
  expect(range[0]).toBeCloseTo(0.1)
  expect(range[1]).toBeCloseTo(0.2)

  range = parse.range('-0.5-;--5--')
  expect(range[0]).toBeCloseTo(0.5)
  expect(range[1]).toBeCloseTo(5)

  range = parse.range('-5-to--.5--')
  expect(range[0]).toBeCloseTo(-5)
  expect(range[1]).toBeCloseTo(-0.5)

  range = parse.range('-5-..--.5--')
  expect(range[0]).toBeCloseTo(-5)
  expect(range[1]).toBeCloseTo(-0.5)

  range = parse.range('_____.5_;___0.5___')
  expect(range[0]).toBeCloseTo(0.5)
  expect(range[1]).toBeCloseTo(0.5)

  range = parse.range('_____5_;___75.4___')
  expect(range[0]).toBeCloseTo(5)
  expect(range[1]).toBeCloseTo(75.4)

  range = parse.range('_____-5_to___0.75___')
  expect(range[0]).toBeCloseTo(-5)
  expect(range[1]).toBeCloseTo(0.75)

  range = parse.range('_____-5_..___0.75___')
  expect(range[0]).toBeCloseTo(-5)
  expect(range[1]).toBeCloseTo(0.75)
})
