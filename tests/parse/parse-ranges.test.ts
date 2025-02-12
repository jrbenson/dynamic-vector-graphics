import { parseRange } from '../../src/syntax/parse'

test('Range Parsing', () => {
  let r: { 0: number | undefined; 1: number | undefined }

  r = parseRange('-40.3to-36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = parseRange('-40.3 to -36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = parseRange('-40.3..-36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = parseRange('-40.3     .. -36.5')
  expect(r[0]).toBeCloseTo(-40.3)
  expect(r[1]).toBeCloseTo(-36.5)

  r = parseRange('1..2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('1to2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('1 to 2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('  1   ..    2   ')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('1;2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('1;2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('1 ; 2')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('  1   ;    2   ')
  expect(r[0]).toBeCloseTo(1)
  expect(r[1]).toBeCloseTo(2)

  r = parseRange('.1;.2')
  expect(r[0]).toBeCloseTo(0.1)
  expect(r[1]).toBeCloseTo(0.2)

  r = parseRange('-0.5-;--5--')
  expect(r[0]).toBeCloseTo(0.5)
  expect(r[1]).toBeCloseTo(5)

  r = parseRange('-5-to--.5--')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(-0.5)

  r = parseRange('-5-..--.5--')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(-0.5)

  r = parseRange('_____.5_;___0.5___')
  expect(r[0]).toBeCloseTo(0.5)
  expect(r[1]).toBeCloseTo(0.5)

  r = parseRange('_____5_;___75.4___')
  expect(r[0]).toBeCloseTo(5)
  expect(r[1]).toBeCloseTo(75.4)

  r = parseRange('_____-5_to___0.75___')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(0.75)

  r = parseRange('_____-5_..___0.75___')
  expect(r[0]).toBeCloseTo(-5)
  expect(r[1]).toBeCloseTo(0.75)
})
