import { parseFormat, Formatter } from '../../src/data/formats'

test('Currency Format Parsing', () => {
  let f: Formatter

  f = parseFormat('dollar')
  expect(f.format(5)).toBe('$5.00')

  f = parseFormat('Euro4')
  expect(f.format(5)).toBe('€5.0000')

  f = parseFormat('YEN0')
  expect(f.format(5)).toBe('¥5')

  f = parseFormat('Pound1')
  expect(f.format(5)).toBe('£5.0')

  f = parseFormat('won')
  expect(f.compactFormat(5000)).toBe('CN¥5K')

  f = parseFormat('rupee')
  expect(f.format(5)).toBe('₹5.00')

  f = parseFormat('dong')
  expect(f.format(5)).toBe('₫5')

  f = parseFormat('sheqel')
  expect(f.format(5)).toBe('₪5.00')

  f = parseFormat('currencyUSD')
  expect(f.format(5)).toBe('$5.00')

  f = parseFormat('CURRENCYUSD')
  expect(f.compactFormat(5000)).toBe('$5K')
})

test('Percent Format Parsing', () => {
  let f: Formatter

  f = parseFormat('percent')
  expect(f.format(5)).toBe('500%')

  f = parseFormat('PERCENT')
  expect(f.format(0.5)).toBe('50%')

  f = parseFormat('PerCent')
  expect(f.format(-0.5)).toBe('-50%')

  f = parseFormat('percent2')
  expect(f.format(-0.25)).toBe('-25.00%')

  f = parseFormat({ name: 'percent', precision: 4 })
  expect(f.format(-0.25)).toBe('-25.0000%')
})

test('Number Format Parsing', () => {
  let f: Formatter

  f = parseFormat('')
  expect(f.format(5)).toBe('5')

  f = parseFormat({ name: '', precision: 2 })
  expect(f.format(5)).toBe('5.00')

  f = parseFormat({ precision: 2 })
  expect(f.format(5)).toBe('5.00')

  f = parseFormat({})
  expect(f.format(12345.67)).toBe('12,345.67')

  f = parseFormat('float1')
  expect(f.format(12345.67)).toBe('12345.7')

  f = parseFormat('best4')
  expect(f.format(12345.67)).toBe('1.235E4')

  f = parseFormat('exp2')
  expect(f.format(12345.67)).toBe('1.2E4')
  
})
