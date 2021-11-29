import type { Ref, ComputedRef } from "vue"
import Select from "./index.vue"

export type SelectComponentInstance = InstanceType<typeof Select>

export type Option<T = any> = {
  disabled?: boolean
  label: string
  value?: T
  // reserve for flexibility
  [props: string]: any
}

export type OptionGroup<T = any> = Option & { 
  options: Array<T>
}

export type OptionType<T = any> = Option<T> | OptionGroup<T>

interface SelectGroupContext {
  disabled: boolean
}

export interface QueryChangeCtx {
  query: string
}

export interface SelectContext {
  isMultiple?: boolean
  queryChange?: Ref<QueryChangeCtx>
  groupQueryChange?: Ref<string>
  selectWrapper?: HTMLElement
  cachedOptions?: Map<any, any>
  hoverIndex: Ref<number>
  selectedIndex: ComputedRef<number>
  optionsCount?: number
  filteredOptionsCount?: number
  options: OptionType[]
  selected?: any | any[]
  onSelect: (option: OptionType, byClick?: boolean) => void
}

export interface SelectProps {
  modelValue?: unknown[] | string | number | boolean | { [key: string]: unknown },
  disabled: boolean,
  errorText: string,
  finishedText: string,
  loadingText: string,
  recoveryText: string,
  placeholder: string,
  options: OptionType[],
  statusType: string,
  keepOpen: boolean,
  clearable: boolean,
  isMultiple: boolean,
  multipleLimit: number,
  automaticDropdown: boolean,
  autocomplete: boolean,
  filterable: boolean,
  allowCreate: boolean,
  loading: boolean,
  popperClass: string,
  remote: boolean,
  collapseTags: boolean,
  popperAppendToBody: boolean,
  noMatchText: string,
  noDataText: string,
  valueKey: string,
  suffixIconName: string,
}

export type SelectEmits = 'update:modelValue' | 'change' | 'focus' | 'blur' | 'visible-change'