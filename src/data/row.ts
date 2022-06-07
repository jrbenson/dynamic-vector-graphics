import { condition, columnIdentifier } from '../utils/syntax'
import { Condition } from './filter'

export type Value = string | number | Date | undefined

export class Row {
  private _values: Array<Value> = []
  private _cols_map: Map<string, number> = new Map()

  constructor(data: Array<Value>, columns: Array<string>) {
    for (let i = 0; i < columns.length; i += 1) {
      if (i < data.length) {
        this._values.push(data[i])
        this._cols_map.set(columns[i], i)
      }
    }
  }

  get(column: string | number) {
    if (typeof column === 'string') {
      if (this._cols_map.has(column)) {
        const index = this._cols_map.get(column)
        if (index != undefined) {
          return this._values[index]
        }
      }
    } else {
      return this._values[column]
    }
  }

  set(column: string | number, value: Value) {
    if (typeof column === 'string') {
      if (this._cols_map.has(column)) {
        const index = this._cols_map.get(column)
        if (index != undefined) {
          this._values[index] = value
        }
      }
    } else {
      this._values[column] = value
    }
  }

  delete(column: string | number) {
    if (typeof column === 'string') {
      if (this._cols_map.has(column)) {
        const index = this._cols_map.get(column)
        if (index != undefined) {
          this._values.splice(index, 1)
          for (let [col_name, col_index] of this._cols_map) {
            if (col_index > index) {
              this._cols_map.set(col_name, col_index - 1)
            }
          }
          this._cols_map.delete(column)
        }
      }
    } else {
      if (column >= 0 && column < this._values.length) {
        this._values.splice(column, 1)
        const key = Array.from(this._cols_map.keys())[column]
        for (let [col_name, col_index] of this._cols_map) {
          if (col_index > column) {
            this._cols_map.set(col_name, col_index - 1)
          }
        }
        this._cols_map.delete(key)
      }
    }
  }

  renameColumn(column: string | number, name: string) {
    if (typeof column === 'string') {
      const index = this._cols_map.get(column)
      if (index !== undefined) {
        this._cols_map.set(name, index)
        this._cols_map.delete(column)
      }
    } else {
      const key = Array.from(this._cols_map.keys())[column]
      this._cols_map.set(name, column)
      this._cols_map.delete(key)
    }
  }

  evaluate(column: string | number, value: Value, comparison?: string): boolean {
    const rowValue = this.get(column)
    if (rowValue !== undefined && value !== undefined) {
      if (comparison === undefined) {
        return rowValue == value
      } else {
        switch (comparison) {
          case '<=':
            return rowValue <= value
          case '>=':
            return rowValue >= value
          case '<':
            return rowValue < value
          case '>':
            return rowValue > value
          case '=':
          case '==':
          default:
            return rowValue == value
        }
      }
    }
    return false
  }
}
