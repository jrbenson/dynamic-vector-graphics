import { firstObjectKey } from '../syntax/markup'
import { elementMarkup } from '../syntax/markup'

export class Unifier {
  static keys: string[] = ['unify', 'u']
  element: Element
  cols: string[] = []
  position: number = 0
  total: number = 0

  /**
   * Creates a new Unifier that knows about the sub components it is unifying.
   * @param element
   */
  constructor(element: Element, position: number, total: number) {
    this.element = element
    if (this.element) {
      let syn = elementMarkup(element)
      let key = firstObjectKey(syn.opts, Unifier.keys)
      if (key) {
        this.cols = (syn.opts[key] as string).split(';')
      }
    }
    this.position = position
    this.total = total
  }

  adjustNorm(normalizedValue: number) {
    if (this.total === 0 || this.position === 0) {
      return normalizedValue
    }
    normalizedValue = 1 - normalizedValue
    const curPosition = Math.ceil(normalizedValue * this.total)
    if (curPosition < this.position) {
      return 1
    } else if (curPosition > this.position) {
      return 0
    } else {
      return 1 - (normalizedValue - (1 / this.total) * (this.position - 1)) / (1 / this.total)
    }
  }
}
