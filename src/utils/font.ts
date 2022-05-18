import { convertCamelToTitle } from './string'
import { FONT_FAMILIES } from './font-families'

export const GENERIC_FONT_FAMILIES = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  // 'times',
  // 'times new roman',
]

export function inferFont(text: string) {
  const parsed = { family: text, style: 'normal', weight: '400' }
  const split = text.split('-')
  if (split.length > 1) {
    parsed.family = split[0]
    const variantText = split[1].toLowerCase()
    if (variantText.includes('ital')) {
      parsed.style = 'italic'
    }
    if (variantText.includes('thin')) {
      parsed.weight = '100'
    } else if (variantText.includes('extralight')) {
      parsed.weight = '200'
    } else if (variantText.includes('light')) {
      parsed.weight = '300'
    } else if (variantText.includes('medium')) {
      parsed.weight = '500'
    } else if (variantText.includes('black')) {
      parsed.weight = '900'
    } else if (variantText.includes('semi')) {
      parsed.weight = '600'
    } else if (variantText.includes('extrabold')) {
      parsed.weight = '800'
    } else if (variantText.includes('bold')) {
      parsed.weight = '700'
    }
  }
  return parsed
}

export function requiredFonts(svg: Element) {
  const families = new Map<string, Set<string>>()
  Array.from(svg.querySelectorAll<SVGElement>('text, tspan')).forEach(function (e) {
    const style = window.getComputedStyle(e)
    let family = style.getPropertyValue('font-family')
    family = family.replace(/"/g, '')
    family = family.replace(/'/g, '')
    if (!GENERIC_FONT_FAMILIES.includes(family.toLowerCase())) {
      if (family.includes('-')) {
        const inferred = inferFont(family)
        family = inferred.family
        e.style.setProperty('font-style', inferred.style)
        e.style.setProperty('font-weight', inferred.weight)
      }
      family = convertCamelToTitle(family)
      e.style.setProperty('font-family', family)
      if (FONT_FAMILIES.includes(family.toLowerCase())) {
        if (!families.has(family)) {
          families.set(family, new Set())
        }
        const fs = style.getPropertyValue('font-style')
        const fw = style.getPropertyValue('font-weight')
        const variant = (fs.includes('ital') ? 'i' : '') + fw
        if (variant) {
          families.get(family)?.add(variant)
        }
      }
    }
  })
  const fonts = []
  for (let [font, variants] of families) {
    fonts.push(font + ':' + [...variants].join(','))
  }
  return fonts
}
