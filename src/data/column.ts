import { Formatter } from './formats'

export enum ColumnType {
  String,
  Number,
  Date,
  Any,
}

interface Stats {
  min: number
  max: number
  sum: number
  avg: number
  manual?: boolean
}

export interface Column {
  name: string
  type: ColumnType
  format?: Formatter
  stats?: Stats
}
