export interface Filter {
  index?: number
  condition?: Condition
}

export interface Condition {
  column: string
  value: string
  comparison?: string
}
