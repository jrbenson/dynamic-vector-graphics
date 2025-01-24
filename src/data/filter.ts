import { Value } from './row'

export interface Filter {
  index?: number
  condition?: Condition
}

export interface Condition {
  column: string
  value: string
  comparison?: string
}

export function compare(valueA: Value, valueB: Value, comparison?: string): boolean {
  if (valueA !== undefined && valueB !== undefined) {
    if (comparison === undefined) {
      return valueA == valueB
    } else {
      switch (comparison) {
        case '<=':
          return valueA <= valueB
        case '>=':
          return valueA >= valueB
        case '<':
          return valueA < valueB
        case '>':
          return valueA > valueB
        case '=':
        case '==':
        default:
          return valueA == valueB
      }
    }
  }
  return false
}
