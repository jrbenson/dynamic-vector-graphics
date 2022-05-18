import { convertCamelToTitle } from '../../src/utils/string'

test('Camel Case Conversion', () => {
  expect(convertCamelToTitle('basicCamelCase')).toBe('Basic Camel Case')

  expect(convertCamelToTitle(' basicCamel3Case')).toBe(' basic Camel3Case')

  expect(convertCamelToTitle('preformattedHTML')).toBe('Preformatted HTML')
})
