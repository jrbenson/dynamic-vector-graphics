export const RE_UNDERSCOREUNICODE = /_x([0-9A-Za-z]+)_/g

/**
 * Trims any of the specified characters from the star and end of the text.
 *
 * @param text The text to trim.
 * @param chars List of characters to trim.
 */
 export function trimChars(text: string, chars: string[]) {
  var start = 0,
    end = text.length

  while (start < end && chars.indexOf(text[start]) >= 0) ++start

  while (end > start && chars.indexOf(text[end - 1]) >= 0) --end

  return start > 0 || end < text.length ? text.substring(start, end) : text
}

export function convertCamelToTitle(text: string) {
  //const result = text.replace(/(?<! |^)([A-Z])/g, ' $1') // May not work on Safari due to negative lookbehind
  let result = text.charAt(0);
  for (let i = 1; i < text.length; i += 1) {
    if (/[a-z]/.test(text.charAt(i - 1)) && /[A-Z]/.test(text.charAt(i))) {
      result += ' ' + text.charAt(i);
    } else {
      result += text.charAt(i);
    }
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Converts unicode character back to orignal string.
 *
 * @param text The text to decode.
 */
 export function decodeUnicode(text: string) {
  return text.replace(RE_UNDERSCOREUNICODE, function (match, g1) {
    return String.fromCharCode(parseInt('0x' + g1))
  })
}
