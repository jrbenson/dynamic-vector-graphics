import { range } from '../../src/utils/parse'

test('Range Parsing', () => {
  let r: { 0: number | undefined; 1: number | undefined }

  r = range('-40.3to-36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = range('-40.3 to -36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = range('-40.3..-36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = range('-40.3     .. -36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = range('1..2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('1to2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('1 to 2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('  1   ..    2   ')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('1;2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('1;2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('1 ; 2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('  1   ;    2   ')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = range('.1;.2')
  expect(r[0]).toBeCloseTo(0.1)
  expect(r[1]).toBeCloseTo(0.2)

  r = range('-0.5-;--5--')
  expect(r[0]).toBeCloseTo(0.5)
  expect(r[1]).toBeCloseTo(5)

  r = range('-5-to--.5--')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(-0.5)

  r = range('-5-..--.5--')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(-0.5)

  r = range('_____.5_;___0.5___')
  expect(r[0]).toBeCloseTo(0.5)
  expect(r[1]).toBeCloseTo(0.5)

  r = range('_____5_;___75.4___')
  expect(r[0]).toBeCloseTo(5)
  expect(r[1]).toBeCloseTo(75.4)

  r = range('_____-5_to___0.75___')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(0.75)

  r = range('_____-5_..___0.75___')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(0.75)
})
