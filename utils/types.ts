import type { ValidateFieldsError} from "async-validator"

export type TimeoutHandle = ReturnType<typeof globalThis.setTimeout>
export type Nullable<T> = T | null

export interface ValidateFieldCallback {
  (isValid?: string, invalidFields?: ValidateFieldsError): void
}

export interface CFormItemContext {
  prop?: string
  validateState: string
  $el: HTMLDivElement
  validate(trigger: string, callback?: ValidateFieldCallback): void
  updateComputedLabelWidth(width: number): void
  evaluateValidationEnabled(): void
  resetField(): void
  clearValidate(): void  
}

export interface CFormContext {
  registerLabelWidth?(width: number, oldWidth: number): void
  deregisterLabelWidth?(width: number): void
  autoLabelWidth?: string | undefined
  emit(evt: string): void
  addField: (field: CFormItemContext) => void
  removeField: (field: CFormItemContext) => void
  labelSuffix: string
  inline?: boolean
  inlineMessage?: boolean
  model?: Record<string, unknown>
  size?: string
  showMessage?: boolean
  labelPosition?: string
  labelWidth?: string | number
  rules?: Record<string, unknown>
  statusIcon?: boolean
  hideRequiredAsterisk?: boolean
  disabled?: boolean
}

export type KeyType<T, K> = K extends keyof T ? T[K] : never