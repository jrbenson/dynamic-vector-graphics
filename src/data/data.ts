import { parseFormat, defaultFormatter, Formatter, SourceFormat } from './formats'
import { Column, ColumnType } from './column'
import { Row, Value } from './row'
import { Filter } from './filter'
import * as parse from '../utils/parse'

import * as Papa from 'papaparse'

export interface SourceData {
  values: Array<Array<Value>>
  columns: Array<string>
  formats?: Array<SourceFormat>
}

const PAPA_CONFIG = {
  dynamicTyping: true,
  skipEmptyLines: true,
}

export class DataView {
  private data: Data
  private index: number[]

  constructor(data: Data, index: number[]) {
    this.index = index
    this.data = data
  }

  private indexRemap(row: number) {
    if (row < this.index.length) {
      return this.index[row]
    }
  }

  getColumn(column: string | number, type?: ColumnType) {
    return this.data.getColumn(column, type)
  }

  getRow(row: number): Row | undefined {
    const srcRow = this.indexRemap(row)
    if (srcRow != undefined) {
      return this.data.getRow(srcRow)
    }
  }

  get(row: number, column: string | number): Value {
    const srcRow = this.indexRemap(row)
    if (srcRow != undefined) {
      return this.data.get(srcRow, column)
    }
  }

  getFormatted(row: number, column: string | number, compact = false): string {
    const srcRow = this.indexRemap(row)
    if (srcRow != undefined) {
      return this.data.getFormatted(srcRow, column, compact)
    }
    return '???'
  }

  getColumnFormat(column: string | number) {
    return this.data.getColumnFormat(column)
  }

  min(column: string | number) {
    return this.data.getColumn(column)?.stats?.min
  }

  max(column: string | number) {
    return this.data.getColumn(column)?.stats?.max
  }

  sum(column: string | number) {
    return this.data.getColumn(column)?.stats?.sum
  }

  avg(column: string | number) {
    return this.data.getColumn(column)?.stats?.avg
  }

  filteredView(filter: Filter | string): DataView {
    let f = undefined
    if (typeof filter === 'string') {
      f = parse.filter(filter)
    } else {
      f = filter
    }
    if (f !== undefined) {
      if (f.index !== undefined && f.index < this.index.length) {
        return new DataView(this.data, [this.index[f.index]])
      } else if (f.condition !== undefined) {
        const c = f.condition
        const col = parse.columnFromData(c.column, this)
        if (col !== undefined) {
          const newIndex = []
          for (let i = 0; i < this.index.length; i += 1) {
            if (this.getRow(i)?.evaluate(col.name, c.value, c.comparison)) {
              newIndex.push(this.index[i])
            }
          }
          return new DataView(this.data, newIndex)
        }
      }
    }
    return this
  }
}

export class Data {
  private _rows: Array<Row> = []
  private _cols: Array<Column> = []
  private _cols_map: Map<string, number> = new Map()

  constructor(source: SourceData | string) {
    if (typeof source === 'string') {
      const parsed = Papa.parse(source, PAPA_CONFIG)
      if (parsed.data.length > 1) {
        this.initialize({
          values: parsed.data.slice(1) as Value[][],
          columns: parsed.data[0] as string[],
        })
      }
    } else {
      this.initialize(source)
    }
  }

  private initialize(source: SourceData) {
    for (let row_data of source.values) {
      this._rows.push(new Row(row_data, source.columns))
    }

    let types: string[] = []
    let first_row = source.values[0]
    if (first_row) {
      types = source.values[0].map((d) => typeof d)
    }
    this._cols = source.columns.map((c, i) => ({
      name: c,
      type: types[i] === 'string' ? ColumnType.String : ColumnType.Number,
    }))
    source.columns.forEach((c, i) => this._cols_map.set(c, i))

    this.calcColumnStats()

    this.extractColumnMetadata()

    if (source.formats !== undefined) {
      for (let i = 0; i < this.cols.length; i += 1) {
        if (i < source.formats.length) {
          const col = this.getColumn(i)
          if (col !== undefined) {
            const format = source.formats[i]
            if (format) {
              this.setColumnFormat(col.name, parseFormat(format))
            }
          }
        }
      }
    }
  }

  get cols() {
    return Array.from(this._cols_map.keys())
  }

  get rows() {
    return this._rows
  }

  get(row: number, column: string | number): Value {
    const r = this._rows[row]
    const col = this.getColumn(column)
    if (r && col) {
      return r.get(col.name)
    }
  }

  set(row: number, column: string | number, value: Value) {
    if (row < this._rows.length) {
      const r = this._rows[row]
      const col = this.getColumn(column)
      if (col) {
        r.set(col.name, value)
      }
    }
  }

  getColumn(column: string | number, type?: ColumnType) {
    if (type === undefined) {
      if (typeof column === 'string') {
        if (this._cols_map.has(column)) {
          const index = this._cols_map.get(column)
          if (index != undefined) {
            return this._cols[index]
          }
        }
      } else {
        return this._cols[column]
      }
    } else {
      if (typeof column === 'number') {
        const selected_cols = this._cols.filter((c) => c.type === type)
        return selected_cols[column]
      }
    }
  }

  renameColumn(column: string | number, name: string) {
    const col = this.getColumn(column)
    if (col) {
      const index = this._cols_map.get(col.name)
      if (index !== undefined) {
        for (let row of this._rows) {
          row.renameColumn(column, name)
        }
        this._cols_map.set(name, index)
        this._cols_map.delete(col.name)
        col.name = name
      }
    }
  }

  getRow(row: number): Row | undefined {
    if (row < this._rows.length) {
      return this._rows[row]
    }
  }

  getFormatted(row: number, column: string | number, compact = false): string {
    const col = this.getColumn(column)
    if (col) {
      const val = this.get(row, col.name)
      if (val !== undefined) {
          if (col.format) {
            if (compact) {
              return col.format.compactFormat(val) as string
            } else {
              return col.format.format(val) as string
            }
          } else {
            if (compact) {
              return defaultFormatter.compactFormat(val) as string
            } else {
              return defaultFormatter.format(val) as string
            }
          }
      }
    }
    return '???'
  }

  getColumnFormat(column: string | number) {
    const col = this.getColumn(column)
    if (col) {
      if (col.format) {
        return col.format
      }
    }
    return defaultFormatter
  }

  setColumnFormat(column: string | number, format: Formatter) {
    const col = this.getColumn(column)
    if (col) {
      col.format = format
    }
  }

  setColumnFormats(columns: Array<string | number>, formats: Array<Formatter>) {
    for (let i = 0; i < columns.length; i += 1) {
      if (i < formats.length) {
        this.setColumnFormat(columns[i], formats[i])
      }
    }
  }

  min(column: string | number) {
    return this.getColumn(column)?.stats?.min
  }

  max(column: string | number) {
    return this.getColumn(column)?.stats?.max
  }

  sum(column: string | number) {
    return this.getColumn(column)?.stats?.sum
  }

  avg(column: string | number) {
    return this.getColumn(column)?.stats?.avg
  }

  calcColumnStats(columns: Array<string> = []) {
    if (columns.length <= 0) {
      columns = this._cols.map((c) => c.name)
    }
    function hasManualStats(column: Column) {
      if (column.stats && column.stats.manual && column.stats.manual === true) {
        return true
      }
      return false
    }
    const selected_cols = this._cols.filter(
      (c) => columns.includes(c.name) && c.type === ColumnType.Number && !hasManualStats(c)
    )
    selected_cols.forEach(
      (col) =>
        (col.stats = {
          min: Number.MAX_VALUE,
          max: Number.MIN_VALUE,
          sum: 0,
          avg: 0,
        })
    )
    for (let row of this._rows) {
      for (let col of selected_cols) {
        if (col && col.stats) {
          const val = row.get(col.name) as number
          if (val < col.stats.min) {
            col.stats.min = val
          }
          if (val > col.stats.max) {
            col.stats.max = val
          }
          col.stats.sum += val
        }
      }
    }
    for (let col of selected_cols) {
      if (col && col.stats) {
        col.stats.avg = col.stats.sum / this._rows.length
      }
    }
  }

  setColumnStats(column: string | number, stats: { min?: number; max?: number; avg?: number; sum?: number }) {
    const col = this.getColumn(column)
    if (col) {
      if (!col.stats) {
        col.stats = {
          min: Number.MAX_VALUE,
          max: Number.MIN_VALUE,
          sum: 0,
          avg: 0,
        }
      }
      if (stats.min !== undefined) {
        col.stats.min = stats.min
      }
      if (stats.max !== undefined) {
        col.stats.max = stats.max
      }
      if (stats.sum !== undefined) {
        col.stats.sum = stats.sum
      }
      if (stats.avg !== undefined) {
        col.stats.avg = stats.avg
      }
      col.stats.manual = true
    }
  }

  dropColumn(column: string | number) {
    const col = this.getColumn(column)
    if (col) {
      for (const row of this._rows) {
        row.delete(col.name)
      }
      const dropped_index = this._cols_map.get(col.name)
      if (dropped_index != undefined) {
        for (let [col_name, col_index] of this._cols_map) {
          if (col_index > dropped_index) {
            this._cols_map.set(col_name, col_index - 1)
          }
        }
      }
      this._cols_map.delete(col.name)
      this._cols = this._cols.filter((c) => c.name !== col.name)
    }
  }

  castColumn(column: string | number, type: ColumnType) {
    const col = this.getColumn(column)
    if (col) {
      col.type = type
      switch (type) {
        case ColumnType.String:
          for (let row of this._rows) {
            row.set(col.name, String(row.get(col.name)))
          }
          break
        case ColumnType.Number:
          for (let row of this._rows) {
            row.set(col.name, Number(row.get(col.name)))
          }
          this.calcColumnStats([col.name])
          break
        case ColumnType.Date:
          break
      }
    }
  }

  fullView(): DataView {
    const index = []
    for (let i = 0; i < this.rows.length; i += 1) {
      index.push(i)
    }
    return new DataView(this, index)
  }

  filteredView(filter: Filter | string): DataView {
    return this.fullView().filteredView(filter)
  }

  private extractColumnMetadata() {
    for (let col_name of this.cols) {
      const match = col_name.match(parse.RE_DOUBLEBRACE)
      if (match) {
        const col = this.getColumn(col_name)
        if (col) {
          const s = parse.syntax(col_name)
          const col_base_name = col_name.replace(parse.RE_DOUBLEBRACE, '').trim()
          this.renameColumn(col.name, col_base_name)
          const r = parse.range(s.name)
          if (r[0] !== undefined && r[1] !== undefined) {
            this.setColumnStats(col_base_name, { min: r[0], max: r[1] })
          }
          const key = parse.firstObjectKey(s.opts, ['format', 'f'])
          if (key) {
            const format_str = s.opts[key].toString()
            this.setColumnFormat(col_base_name, parseFormat(format_str))
          }
        }
      }
    }
  }
}
