import { reactive, computed, inject, ref, nextTick, watch, onMounted } from "vue"
import type { SetupContext, ComponentPublicInstance } from "vue"
import { isEqual } from "lodash-es"
import type { SelectProps, SelectEmits, OptionType, Option } from "./type"
import type { CFormContext, KeyType } from "../../../utils/types"
import { isObject, getValueByPath } from "../../../utils/helper"
import { flattenOptions } from "./utils"

type ModelValue = KeyType<SelectProps, 'modelValue'>

export function useSelectStates(props: SelectProps) {
  return reactive({
    menuVisibleOnFocus: false,
    visible: false,
    // filterable 开启时，query用于存储模糊匹配的关键字
    query: '',
    options: new Map(),
    optionsCount: 0,
    filteredOptionsCount: 0,
    cachedOptions: [] as Option[],
    createdOptions: [] as Option[],
    selectedLabel: '',
    hoveringIndex: -1,
    previousValue: '',
    isComposing: false,
    isSilentBlur: false,
    softFocus: false,
    inputHovering: false,
  })
}

export type States = ReturnType<typeof useSelectStates>

export function useSelect(props: SelectProps, states: States, ctx: SetupContext<SelectEmits[]>) {
  // template refs
  const selection$ = ref<HTMLDivElement | null>(null)
  const reference$ = ref<ComponentPublicInstance | null>(null)
  const popper$ = ref<ComponentPublicInstance | null>(null)
  const selectWrapper$ = ref<HTMLDivElement | null>(null)
  const dropdown$ = ref<ComponentPublicInstance | null>(null)

  // 弹出框的宽度
  const popperSize = ref(-1)
  // 单选时的选项索引值
  const selectedIndex = ref(-1)
  const cForm = inject<CFormContext>('CForm', {} as CFormContext)
  
  const selectDisabled = computed(() => props.disabled || cForm.disabled)
  const emptyText = computed(() => {
    if (props.loading) {
      return props.loadingText || "加载中"
    } else {
      if (props.remote && states.query === '' && states.options.size === 0) {
        return false
      }
      if (
        props.filterable &&
        states.query &&
        states.options.size > 0 &&
        states.filteredOptionsCount === 0
      ) {
        return props.noMatchText || "无匹配数据"
      }
      if (states.options.size === 0) {
        return props.noDataText || "无数据"
      }
    }
    return null
  })
  const toggleDropdown = () => {
    if (props.automaticDropdown) return
    if (!selectDisabled.value) {
      if (states.menuVisibleOnFocus) {
        states.menuVisibleOnFocus = false
      } else {
        states.visible = !states.visible
      }
      if (states.visible) {
        (reference$.value as any).focus()
      }
    }
  }
  const readonly = computed(
    () => !props.filterable || props.isMultiple || !states.visible
  )
  const debounce = computed(() => (props.remote ? 300 : 0))
  const dropdownVisible = computed(
    // 如果下拉列表的数据通过远程获取，且未输入查询语句/关键字，则下拉列表也是不可见的
    () => states.visible && emptyText.value !== false
  )
  const filteredOptions = computed(() => {
    const isValidOption = (o: OptionType): boolean => {
      //如果查询条件为空，则默认显示所有选项
      const containsQueryString = states.query ? o.label.includes(states.query) : true
      return containsQueryString
    }
    if (props.loading) {
      return [] as OptionType[]
    }
    const targetOption = [] as OptionType[]
    props.options
      .concat(states.createdOptions)
      .forEach((v) => {
        if (Array.isArray(v.options)) {
          const filtered = v.options.filter(isValidOption)
          if (filtered.length > 0) {
            targetOption.push({
              ...v,
              options: filtered
            })
          }
        } else {
          if (props.remote || isValidOption(v)) {
            targetOption.push(v)
          }
        }
      })
    return flattenOptions(targetOption)
  })
  // 返回当前选中的元素在下拉列表中对应的索引，当选中多个时显示最后一个选中元素对应的索引
  const indexRef = computed<number>(() => {
    if (props.isMultiple) {
      if (Array.isArray(props.modelValue)) {
        const len = props.modelValue.length
        if (props.modelValue.length > 0) {
          return filteredOptions.value.findIndex(
            (o) => o.value! === props.modelValue?.[len - 1]
          )
        }
      }
    } else {
      if (props.modelValue) {
        return filteredOptions.value.findIndex(
          (o) => o.value === props.modelValue
        )
      }
    }
    return -1
  })
  const updateHoveringIndex = (idx: number) => {
    states.hoveringIndex = idx
  }
  const resetHoverIndex = () => {
    states.hoveringIndex = -1
  }
  const handleDropdownEnter = () => {
    nextTick(() => {
      // 因为设置 hoveringIndex 为 -1 时表示没有悬浮在任意 option 上，所以对 hoverIndex 按位取反时只有 -1 为 false
      if (~indexRef.value) {
        updateHoveringIndex(indexRef.value)
        // scrollToItem(states.hoveringIndex)
      }
    })
  }
  // 保持弹出框的宽度与选择器的宽度一致
  const calculatePopperSize = () => {
    popperSize.value = selectWrapper$.value?.getBoundingClientRect().width || 200
  }
  // 从modelValue获取选中的选项，并通过它去设置 states.selectedLabel 等
  const initStates = () => {
    resetHoverIndex()
    if (props.isMultiple) {
      if (Array.isArray(props.modelValue)) {
        if (props.modelValue.length > 0) {
          let initHovering = false
          states.cachedOptions.length = 0
          ;(props.modelValue).forEach((selected) => {
            const itemIndex = filteredOptions.value.findIndex(
              (option) => option.value === selected
            )
            if (~itemIndex) {
              states.cachedOptions.push(filteredOptions.value[itemIndex])
              // 初始化状态时将第一个选中的选项的状态置为 hovering
              if (!initHovering) {
                updateHoveringIndex(itemIndex)
              }
              initHovering = true
            }
          })
        }
      }
    } else {
      if (props.modelValue) {
        const options = filteredOptions.value
        const selectedItemIndex = options.findIndex(
          (o) => o.value === props.modelValue
        )
        if (~selectedItemIndex) {
          states.selectedLabel = options[selectedItemIndex].label
          updateHoveringIndex(selectedItemIndex)
        } else {
          states.selectedLabel = `${props.modelValue}`
        }
      } else {
        states.selectedLabel = ''
      }
    }
    calculatePopperSize()
  }
  const getValueIndex = (arr: Array<unknown> = [], value: unknown) => {
    if (!isObject(value)) {
      return arr.indexOf(value)
    }
    const valueKey = props.valueKey
    let index = -1
    arr.some((item, i) => {
      if (isObject(arr)) {
        if (getValueByPath(arr, valueKey) === getValueByPath(value, valueKey)) {
          index = i
          return true
        }
      }
      return false
    })
    return index
  }
  const update = (val: ModelValue) => {
    ctx.emit('update:modelValue', val)
    if (!isEqual(props.modelValue, val)) {
      ctx.emit('change', val)
    }
    states.previousValue = val?.toString() || ''
  }
  const setSoftFocus = () => {
    const _input = reference$.value
    if (_input) {
      (_input as any).focus()
    }
  }
  // 当选项被点击或者通过键盘上下键选中时触发的回调函数
  const onSelect = (option: Option, idx: number, byClick = true) => {
    if (props.isMultiple) {
      if (Array.isArray(props.modelValue)) {
        const selectedOptions = props.modelValue.slice()
        const index = getValueIndex(selectedOptions, option.value)
        // 选中已经在选中选项中的选项，则代表反选，从选中选项中删除该选项
        if (index > -1) {
          selectedOptions.splice(index, 1)
          states.cachedOptions.splice(index, 1)
          // removeNewOption()
        } else if (
          // index 为 -1 说明原来选中的选项中没有该选项，则加入该选项到选中的选项中
          // multipleLimit 小于 0 表示没有限制
          props.multipleLimit <= 0 ||
          selectedOptions.length < props.multipleLimit
        ) {
          selectedOptions.push(option.value)
          states.cachedOptions.push(option)
          // selectNewOption(option)
          updateHoveringIndex(idx)
        }
        update(selectedOptions)
        // resetInputHeight()
        setSoftFocus()
      }
    } else {
      selectedIndex.value = idx
      states.selectedLabel = option.label
      update(option.value)
      states.isComposing = false
      states.isSilentBlur = byClick
      // selctNewOption(option)
      // if (!option.created) {
      //   clearAllNewOption()
      // }
      updateHoveringIndex(idx)
    }
  }
  const currentPlaceholder = computed(() => {
    const _placeholder = props.placeholder || '请选择'
    return props.isMultiple ? _placeholder : states.selectedLabel || _placeholder
  })
  const handleFocus = (event: Event) => {
    if (!states.softFocus) {
      if (props.automaticDropdown || props.filterable) {
        states.visible = true
        if (props.filterable) {
          states.menuVisibleOnFocus = true
        }
      }
    } else {
      states.softFocus = false
    }
  }
  const blur = () => {
    states.visible = false
    ;(reference$.value as any).blur()
  }
  const handleClose = () => {
    states.visible = false
  }
  const handleBlur = (event: Event) => {
    nextTick(() => {
      if (states.isSilentBlur) {
        states.isSilentBlur = false
      } else {
        ctx.emit('blur', event)
      }
    })
    states.softFocus = false
  }
  // const onInputeChange = () => {
  //   if (props.filterable && states.query !== states.selectedLabel) {
  //     states.query = states.selectedLabel
  //     handleQueryChange(states.query)
  //   }
  // }
  // const debouncedOnInputChange = debounce(() => {
  //   onInputeChange()
  // }, debounce.value)

  watch(
    () => props.modelValue,
    (val) => {
      if (!val || val.toString() !== states.previousValue) {
        initStates()
      }
    },
    {
      deep: true,
    }
  )

  onMounted(() => {
    initStates()
  })

  return {
    toggleDropdown,
    dropdownVisible,
    handleDropdownEnter,
    onSelect,
    currentPlaceholder,
    selectDisabled,
    readonly,
    handleFocus,
    handleBlur,
    filteredOptions,
    popperSize,
    emptyText,
  }
}