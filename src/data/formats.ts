const BASIC_FORMATS: Record<string, string> = {
  DOLLAR: 'NLMNLUSD',
  EURO: 'NLMNLEUR',
  POUND: 'NLMNLGBP',
  WON: 'NLMNLCNY',
  YEN: 'NLMNLJPY',
}

const FORMAT_FAIL_OUTPUT = '???'

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

// Hack to get around ES2020 standard not having notation.
interface FormatterOptions extends Intl.NumberFormatOptions {
  notation?: string
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
      return new Intl.NumberFormat(navigator.language, {
        notation: 'compact',
        maximumSignificantDigits: 3,
      }).format(value)
    }
    return '' + value
  },
}

export function parseFormat(format: SourceFormat) {
  if (format.name !== undefined) {
    let format_opts: FormatterOptions = {
      maximumFractionDigits: format.precision,
      minimumFractionDigits: format.precision,
    }

    let compact_format_opts: FormatterOptions = {
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

    if (format.name.startsWith('NLMNI')) {
      const prefix = format.name.replace('NLMNI', '')
      return {
        format: (value: number | string | Date) => {
          if (typeof value === 'number') {
            return prefix + new Intl.NumberFormat(navigator.language, format_opts).format(value)
          }
        },
        compactFormat: (value: number | string | Date) => {
          if (typeof value === 'number') {
            return prefix + new Intl.NumberFormat(navigator.language, compact_format_opts).format(value)
          }
        },
      }
    } else if (format.name.startsWith('TIME')) {
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
          return this.format(value)
        },
      }
    } else if (format.name.startsWith('HOUR')) {
      return {
        format: (value: number | string | Date) => {
          if (typeof value === 'number') {
            const hours = Math.floor(value / (60 * 60))
            return new Intl.NumberFormat(navigator.language).format(hours)
          }
          return FORMAT_FAIL_OUTPUT
        },
        compactFormat: function (value: number | string | Date) {
          return this.format(value)
        },
      }
    } else if (format.name.startsWith('HHMM')) {
      return {
        format: (value: number | string | Date) => {
          if (typeof value === 'number') {
            const parts = timeFromSeconds(value)
            return ('' + parts.h).padStart(2, '0') + ':' + ('' + parts.m).padStart(2, '0')
          }
          return FORMAT_FAIL_OUTPUT
        },
        compactFormat: function (value: number | string | Date) {
          return this.format(value)
        },
      }
    } else if (format.name.startsWith('MMSS')) {
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
          return this.format(value)
        },
      }
    } else if (format.name.startsWith('NLMNL')) {
      format_opts.style = 'currency'
      format_opts.currency = format.name.replace('NLMNL', '')
    } else if (format.name.startsWith('PERCENT')) {
      format_opts.style = 'percent'
    } else if (format.name.startsWith('F')) {
      format_opts.useGrouping = false
    } else if (format.name.startsWith('BEST')) {
      delete format_opts.maximumFractionDigits
      format_opts.maximumSignificantDigits = format.width
      compact_format_opts.maximumSignificantDigits = 3
    }
    return {
      format: (value: number | string | Date) => {
        if (typeof value === 'number') {
          return new Intl.NumberFormat(navigator.language, format_opts).format(value)
        }
        return FORMAT_FAIL_OUTPUT
      },
      compactFormat: function (value: number | string | Date) {
        if (typeof value === 'number') {
          return new Intl.NumberFormat(navigator.language, compact_format_opts).format(value)
        }
        return FORMAT_FAIL_OUTPUT
      },
    }
  }

  return {
    format: (value: number | string | Date) => {
      if (typeof value === 'string') {
        return value
      }
      return FORMAT_FAIL_OUTPUT
    },
    compactFormat: function (value: number | string | Date) {
      return this.format(value)
    },
  }
}
