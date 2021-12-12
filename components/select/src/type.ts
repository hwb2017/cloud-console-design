import type { Ref, ComputedRef } from "vue"
import Select from "./index.vue"

export type SelectComponentInstance = InstanceType<typeof Select>

export type Option<T = any> = {
  disabled?: boolean
  label: string
  value: T
  created?: boolean
  // reserve for flexibility
  [props: string]: any
}

export type OptionGroup<T = any> = Option & { 
  options?: Array<T>
}

export type OptionType<T = any> = Option<T> | OptionGroup<T>

export interface QueryChangeCtx {
  query: string
}

export interface SelectContext {
  isMultiple?: boolean
  multipleLimit: number
  queryChange?: Ref<QueryChangeCtx>
  groupQueryChange?: Ref<string>
  selectWrapper?: HTMLElement
  hoverIndex: Ref<number>
  selectedIndex: ComputedRef<number[]>
  filteredOptionsCount?: number
  options: OptionType[]
  onSelect: (option: OptionType, byClick?: boolean) => void
}

export interface SelectProps {
  modelValue?: string[] | string,
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
  defaultFirstOption: boolean
}

export type SelectEmits = 'update:modelValue' | 'change' | 'focus' | 'blur' | 'visible-change'