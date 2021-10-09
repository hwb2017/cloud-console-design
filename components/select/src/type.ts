export type Option<T = any> = {
  disabled?: boolean
  label: string
  value: T
  // reserve for flexibility
  [props: string]: any
}

export type OptionGroup<T = any> = Option & { 
  options: Array<T>
}

export type SelectOption<T = any> = Option<T> | OptionGroup<T>