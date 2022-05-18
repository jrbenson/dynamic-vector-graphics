// import '@formatjs/intl-numberformat/polyfill'
// import '@formatjs/intl-numberformat/locale-data/en'
//import {shouldPolyfill} from '@formatjs/intl-numberformat/should-polyfill'

const BASIC_FORMATS: Record<string, string> = {
  dollar: 'currencyUSD',
  euro: 'currencyEUR',
  pound: 'currencyGBP',
  won: 'currencyCNY',
  yen: 'currencyJPY',
  rupee: 'currencyINR',
  dinar: 'currencyIQD',
  franc: 'currencyCHF',
  dong: 'currencyVND',
  peso: 'currencyMXN',
  ruble: 'currencyRUB',
  sheqel: 'currencyILS',
}

export const FORMAT_FAIL_OUTPUT = '---'

const SCALE_ABBREVIATIONS = 'KMBT' // could be an array of strings: [' m', ' Mo', ' Md']

function precisionRound(value: number, precision: number) {
  const prec = Math.pow(10, precision)
  return Math.round(value * prec) / prec
}

function simpleCompactFormat(value: number) {
  let base = Math.floor(Math.log(Math.abs(value)) / Math.log(1000))
  const suffix = SCALE_ABBREVIATIONS[Math.min(2, base - 1)]
  base = SCALE_ABBREVIATIONS.indexOf(suffix) + 1
  const scaled_value = value / Math.pow(1000, base)
  let precision = 2
  while (('' + precisionRound(scaled_value, precision)).replace('.', '').length > 3) {
    precision -= 1
  }
  if (suffix) {
    return precisionRound(scaled_value, precision) + suffix
  }
  return '' + precisionRound(scaled_value, precision)
}

function supportsES2020NumberFormat() {
  try {
    var s = new Intl.NumberFormat('en', {
      style: 'unit',
      unit: 'bit',
      unitDisplay: 'long',
      notation: 'scientific',
    }).format(10000)
    // Check for a plurality bug in environment that uses the older versions of ICU:
    // https://unicode-org.atlassian.net/browse/ICU-13836
    if (s !== '1E4 bits') {
      return false
    }
  } catch (e) {
    return false
  }
  return true
}

function numberFormatUnsupported() {
  return typeof Intl === 'undefined' || !('NumberFormat' in Intl) || !supportsES2020NumberFormat()
}

/**
 * Extracts the hours, minutes, and seconds from a duration in seconds.
 *
 * @param secs Number of seconds in the duration.
 * @return Object with durations in h, m, and s properties.
 */
function timeFromSeconds(secs: number): { h: number; m: number; s: number } {
  secs = Math.round(secs)
  var hours = Math.floor(secs / (60 * 60))

  var divisor_for_minutes = secs % (60 * 60)
  var minutes = Math.floor(divisor_for_minutes / 60)

  var divisor_for_seconds = divisor_for_minutes % 60
  var seconds = Math.ceil(divisor_for_seconds)

  var obj = {
    h: hours,
    m: minutes,
    s: seconds,
  }
  return obj
}

// TODO: Figure out why return signature has to include 'undefined'
export interface Formatter {
  format: (value: number | string | Date) => string | undefined
  compactFormat: (value: number | string | Date) => string | undefined
}

export interface SourceFormat {
  name?: string
  precision?: number
  width?: number
}

export const defaultFormatter: Formatter = {
  format: (value: number | string | Date) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat(navigator.language).format(value)
    }
    return '' + value
  },
  compactFormat: function (value: number | string | Date) {
    if (typeof value === 'number') {
      if (numberFormatUnsupported()) {
        return simpleCompactFormat(value)
      } else {
        return new Intl.NumberFormat(navigator.language, {
          notation: 'compact',
          maximumSignificantDigits: 3,
        }).format(value)
      }
    }
    return '' + value
  },
}

export function parseFormat(format: SourceFormat | string) {
  if (typeof format === 'string') {
    return getFormatter(parseFormatName(format))
  } else {
    return getFormatter(format)
  }
}

const RE_NUMBER_FORMAT = /([\D]+)(\d*)\.?(\d*)/
function parseFormatName(name: string) {
  const matches = name.match(RE_NUMBER_FORMAT)
  if (matches) {
    if (matches[2] !== '' && matches[3] !== '') {
      return {
        name: matches[1],
        precision: Number(matches[3]),
        width: Number(matches[2]),
      }
    } else if (matches[2] !== '') {
      return {
        name: matches[1],
        precision: Number(matches[2]),
      }
    }
  }
  return {
    name: name,
  }
}

function getFormatter(format: SourceFormat) {
  if (format.name == undefined) {
    format.name = ''
  }

  format.name = format.name.toLowerCase()

  format.name.replace('nlmni', 'prefix')
  format.name.replace('nlmnl', 'currency')

  let format_opts: Intl.NumberFormatOptions = {
    maximumFractionDigits: format.precision,
    minimumFractionDigits: format.precision,
  }

  let compact_format_opts: Intl.NumberFormatOptions = {
    maximumFractionDigits: format.precision,
    minimumFractionDigits: format.precision,
    notation: 'compact',
    maximumSignificantDigits: 3,
  }

  for (let basic in BASIC_FORMATS) {
    if (format.name === basic) {
      format.name = BASIC_FORMATS[basic]
    }
  }

  if (format.name.startsWith('prefix')) {
    const prefix = format.name.replace('prefix', '').toUpperCase()
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          return prefix + new Intl.NumberFormat(navigator.language, format_opts).format(value)
        }
      },
      compactFormat: (value: number | string | Date) => {
        if (typeof value === 'number') {
          if (numberFormatUnsupported()) {
            return prefix + simpleCompactFormat(value)
          } else {
            return prefix + new Intl.NumberFormat(navigator.language, compact_format_opts).format(value)
          }
        }
      },
    }
  } else if (format.name.startsWith('time')) {
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          const parts = timeFromSeconds(value)
          return (
            ('' + parts.h).padStart(2, '0') +
            ':' +
            ('' + parts.m).padStart(2, '0') +
            ':' +
            ('' + parts.s).padStart(2, '0')
          )
        }
        return FORMAT_FAIL_OUTPUT
      },
      compactFormat: function (value: number | string | Date) {
        if (typeof value === 'number') {
          if (numberFormatUnsupported()) {
            return simpleCompactFormat(value)
          } else {
            return this.format(value)
          }
        }
      },
    }
  } else if (format.name.startsWith('hour')) {
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          const hours = Math.floor(value / (60 * 60))
          return new Intl.NumberFormat(navigator.language).format(hours)
        }
        return FORMAT_FAIL_OUTPUT
      },
      compactFormat: function (value: number | string | Date) {
        if (typeof value === 'number') {
          if (numberFormatUnsupported()) {
            return simpleCompactFormat(value)
          } else {
            return this.format(value)
          }
        }
      },
    }
  } else if (format.name.startsWith('hhmm')) {
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          const parts = timeFromSeconds(value)
          return ('' + parts.h).padStart(2, '0') + ':' + ('' + parts.m).padStart(2, '0')
        }
        return FORMAT_FAIL_OUTPUT
      },
      compactFormat: function (value: number | string | Date) {
        if (typeof value === 'number') {
          if (numberFormatUnsupported()) {
            return simpleCompactFormat(value)
          } else {
            return this.format(value)
          }
        }
      },
    }
  } else if (format.name.startsWith('mmss')) {
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          const secs = Math.round(value)
          const minutes = Math.floor(secs / 60)
          const seconds = Math.ceil((secs % (60 * 60)) % 60)
          return ('' + minutes).padStart(2, '0') + ':' + ('' + seconds).padStart(2, '0')
        }
        return FORMAT_FAIL_OUTPUT
      },
      compactFormat: function (value: number | string | Date) {
        if (typeof value === 'number') {
          if (numberFormatUnsupported()) {
            return simpleCompactFormat(value)
          } else {
            return this.format(value)
          }
        }
      },
    }
  } else if (format.name.startsWith('currency')) {
    format_opts.style = 'currency'
    format_opts.currency = format.name.replace('currency', '')
    compact_format_opts.style = format_opts.style
    compact_format_opts.currency = format_opts.currency
  } else if (format.name.startsWith('percent')) {
    format_opts.style = 'percent'
    compact_format_opts.style = format_opts.style
  } else if (format.name.startsWith('exp') || format.name.startsWith('best')) {
    // TODO: Need to separate BEST eventually.
    delete format_opts.maximumFractionDigits
    if (!format.width) {
      format.width = format.precision
    }
    format_opts.maximumSignificantDigits = format.width
    format_opts.notation = 'scientific'
    compact_format_opts.maximumSignificantDigits = 3
  } else if (format.name.startsWith('f')) {
    format_opts.useGrouping = false
  }
  return {
    format: (value: number | string | Date) => {
      if (typeof value === 'number') {
        try {
          return new Intl.NumberFormat(navigator.language, format_opts).format(value)
        } catch (e: any) {
          console.error(`DVG ${e.name}: ${e.message} Using defaults.`)
          delete format_opts.minimumSignificantDigits
          delete format_opts.maximumSignificantDigits
          delete format_opts.minimumFractionDigits
          delete format_opts.maximumFractionDigits
          delete format_opts.minimumIntegerDigits

          return new Intl.NumberFormat(navigator.language, format_opts).format(value)
        }
      }
      return '' + value
    },
    compactFormat: function (value: number | string | Date) {
      if (typeof value === 'number') {
        if (numberFormatUnsupported()) {
          if (compact_format_opts.style == 'percent') {
            return simpleCompactFormat(value * 100) + '%'
          }
          return simpleCompactFormat(value)
        } else {
          try {
            return new Intl.NumberFormat(navigator.language, compact_format_opts).format(value)
          } catch (e: any) {
            console.error(`DVG ${e.name}: ${e.message} Using defaults.`)
            delete compact_format_opts.minimumSignificantDigits
            delete compact_format_opts.maximumSignificantDigits
            delete compact_format_opts.minimumFractionDigits
            delete compact_format_opts.maximumFractionDigits
            delete compact_format_opts.minimumIntegerDigits
            return new Intl.NumberFormat(navigator.language, compact_format_opts).format(value)
          }
        }
      }
      return '' + value
    },
  }
}
