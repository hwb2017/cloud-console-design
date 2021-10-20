import type { Ref } from "vue"

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

interface SelectGroupContext {
  disabled: boolean
}

export interface QueryChangeCtx {
  query: string
}

export interface SelectContext {
  props: {
    multiple?: boolean
    multipleLimit?: number
    valueKey?: string
    modelValue?: string | number | unknown | unknown[]
    popperClass?: string
    remote?: boolean
  }
  queryChange: Ref<QueryChangeCtx>
  groupQueryChange: Ref<string>
  selectWrapper: HTMLElement
  cachedOptions: Map<any, any>
  hoverIndex: number
  optionsCount: number
  filteredOptionsCount: number
  options: Map<any, any>
  optionsArray: any[]
  selected: any | any[]
  setSelected(): void
  onOptionCreate(vm: SelectOptionProxy): void
  onOptionDestroy(key: number | string | Record<string, any>): void
  handleOptionSelect(vm: unknown, byClick: boolean): void
}

export interface SelectOptionProxy {
  value: string | number | Record<string, string>
  label: string | number
  created: boolean
  disabled: boolean
  currentLabel: string
  itemSelected: boolean
  isDisabled: boolean
  select: SelectContext
  visible: boolean
  hover: boolean
  hoverItem(): void
  selectOptionClick(): void
}
