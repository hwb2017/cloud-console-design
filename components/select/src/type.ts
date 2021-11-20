import type { Ref } from "vue"
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
  selectedOptions: OptionType[],
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
}

export type SelectEmits = 'update:modelValue' | 'change' | 'focus' | 'blur' | 'visible-change'