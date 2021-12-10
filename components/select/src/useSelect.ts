import { reactive, computed, inject, ref, nextTick, watch, onMounted } from "vue"
import type { SetupContext, ComponentPublicInstance } from "vue"
import { isEqual, debounce } from "lodash-es"
import type { SelectProps, SelectEmits, OptionType, Option } from "./type"
import type { CFormContext, KeyType } from "../../../utils/types"
import { flattenOptions } from "./utils"
import type { InputComponentInstance } from "../../input/src/type"

type ModelValue = KeyType<SelectProps, 'modelValue'>

export function useSelectStates() {
  return reactive({
    menuVisibleOnFocus: false,
    visible: false,
    // filterable 开启时，query用于存储模糊匹配的关键字
    query: '',
    createdOptions: [] as OptionType[],
    selectedLabel: '',
    hoveringIndex: -1,
    previousValue: '',
    isComposing: false,
    isSilentBlur: false,
    softFocus: false,
    inputHovering: false,
    inputWidth: 0,
    inputHeight: 0,
  })
}

export type States = ReturnType<typeof useSelectStates>

export function useSelect(props: SelectProps, states: States, ctx: SetupContext<SelectEmits[]>) {
  // template refs
  const selection$ = ref<HTMLDivElement | null>(null)
  const reference$ = ref<InputComponentInstance | null>(null)
  const popper$ = ref<ComponentPublicInstance | null>(null)
  const selectWrapper$ = ref<HTMLDivElement | null>(null)
  const dropdown$ = ref<ComponentPublicInstance | null>(null)

  // 弹出框的宽度
  const popperSize = ref(-1)
  const cForm = inject<CFormContext>('CForm', {} as CFormContext)
  
  const creatingOption = ref<OptionType | null>(null)
  const selectDisabled = computed(() => props.disabled || cForm.disabled)
  const emptyText = computed(() => {
    if (props.loading) {
      return props.loadingText || "加载中"
    } else {
      if (props.remote && states.query === '' && props.options.length === 0) {
        return false
      }
      if (
        props.filterable &&
        states.query &&
        props.options.length > 0 &&
        filteredOptions.value.length === 0
      ) {
        return props.noMatchText || "无匹配数据"
      }
      if (props.options.length === 0) {
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
        reference$.value!.focus()
      }
    }
  }
  const showClose = computed(() => {
    return props.modelValue !== undefined
      ? props.modelValue.length > 0
      && states.inputHovering
      && props.clearable
      : false
  })
  const suffixIconClass = computed(() => {
    return `ccd-icon-${props.suffixIconName}`
  })
  const suffixIconReverse = computed(() => {
    return states.visible ? 'is-reverse' : ''
  })
  const readonly = computed(
    () => !props.filterable || props.isMultiple || !states.visible
  )
  const debounceTimeout = computed(() => (props.remote ? 300 : 0))
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
    if (creatingOption.value !== null) {
      targetOption.push(creatingOption.value)
    }
    states.createdOptions
      .concat(props.options)
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
  const selectedIndex = computed<number>(() => {
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
  const selectedOptions = computed<OptionType[]>(() => {
    const result = [] as OptionType[]
    if (props.isMultiple && Array.isArray(props.modelValue)) {
        props.modelValue.forEach((selected) => {
          const itemIndex = props.options.findIndex((option) => option.value === selected)
          if (itemIndex > -1) {
            result.push(props.options[itemIndex])
          }
        })
    }
    return result
  })

  const handleClear = () => {
    states.query = ''
    ctx.emit('update:modelValue', '')
  }
  const updateHoveringIndex = (idx: number) => {
    states.hoveringIndex = idx
  }
  const resetHoverIndex = () => {
    states.hoveringIndex = -1
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
        const selectedValues = props.modelValue.slice()
        if (selectedValues.length > 0) {
          let initHovering = false
          selectedValues.forEach((selected) => {
            const itemIndex = props.options.findIndex(
              (option) => option.value === selected
            )
            if (~itemIndex) {
              // 初始化状态时将第一个选中的选项的状态置为 hovering
              if (!initHovering) {
                updateHoveringIndex(itemIndex)
              }
              initHovering = true
            }
          })
        } else {
          if (props.defaultFirstOption) {
            const firstAvailableOptionIdx = filteredOptions.value.findIndex(o => {
              return o.disabled === undefined || o.disabled === false
            })
            updateHoveringIndex(firstAvailableOptionIdx)
          }
        }
      }
    } else {
      if (props.modelValue) {
        const selectedItemIndex = filteredOptions.value.findIndex(
          (o) => o.value === props.modelValue
        )
        if (~selectedItemIndex) {
          states.selectedLabel = filteredOptions.value[selectedItemIndex].label
          updateHoveringIndex(selectedItemIndex)
        } else {
          states.selectedLabel = `${props.modelValue}`
        }
      } else {
        states.selectedLabel = ''
        if (props.defaultFirstOption) {
          const firstAvailableOptionIdx = filteredOptions.value.findIndex(o => {
            return o.disabled === undefined || o.disabled === false
          })
          updateHoveringIndex(firstAvailableOptionIdx)
        }
      }
    }
    calculatePopperSize()
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
      _input.focus()
    }
  }
  // 当选项被点击或者通过键盘上下键选中时触发的回调函数
  const onSelect = (option: OptionType, byClick = true) => {
    creatingOption.value = null
    if (option.created) {
      states.createdOptions.push(option)
    }
    const idx = filteredOptions.value.findIndex((item) => item.value === option.value)
    if (props.isMultiple) {
      if (Array.isArray(props.modelValue)) {
        const selectedValues = props.modelValue.slice()
        const index = selectedValues.findIndex((selected) => selected === option.value)
        // 选中已经在选中选项中的选项，则代表反选，从选中选项中删除该选项
        if (index > -1) {
          selectedValues.splice(index, 1)
        } else if (
          // index 为 -1 说明原来选中的选项中没有该选项，则加入该选项到选中的选项中
          // multipleLimit 小于等于 0 表示没有限制
          props.multipleLimit <= 0 ||
          selectedValues.length < props.multipleLimit
        ) {
          selectedValues.push(option.value)
          updateHoveringIndex(idx)
        }      
        update(selectedValues)
        // resetInputHeight()
        setSoftFocus()
      }
    } else {
      states.selectedLabel = option.label
      update(option.value)
      states.isComposing = false
      states.isSilentBlur = byClick
      updateHoveringIndex(idx)
    }
  }
  const navigateOptions = (direction: 'prev' | 'next') => {
    const currentHoverOptionIdx = states.hoveringIndex
    const step = direction === 'next' ? 1 : -1
    const len = filteredOptions.value.length
    let nextHoverOptionIdx = (currentHoverOptionIdx + step + len) % len
    let nextHoverOption = filteredOptions.value[nextHoverOptionIdx]
    while (nextHoverOptionIdx !== currentHoverOptionIdx) {
      if (nextHoverOption.disabled) {
        nextHoverOptionIdx = (nextHoverOptionIdx + step) % len
        nextHoverOption = filteredOptions.value[nextHoverOptionIdx]
      } else {
        updateHoveringIndex(nextHoverOptionIdx)
        break
      }
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
    reference$.value!.blur()
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
  const onInputeChange = () => {
    if (props.filterable && states.query !== states.selectedLabel) {
      states.query = states.selectedLabel
      if (props.allowCreate) {
        creatingOption.value = {
          label: states.selectedLabel,
          value: states.selectedLabel,
          created: true,
        }
      }
    }
  }
  const debouncedOnInputChange = debounce(() => {
    onInputeChange()
  }, debounceTimeout.value)
  const handleTagClose = (option: OptionType) => {
    if (props.isMultiple) {
      if (Array.isArray(props.modelValue)) {
        const selectedValues = props.modelValue.slice()
        const index = selectedValues.findIndex((selected) =>  selected === option.value)
        if (index > -1) {
          selectedValues.splice(index, 1)
          update(selectedValues)
        }
      }
    }
  }
  const resetInputWidth = () => {
    states.inputWidth = reference$.value?.$el?.getBoundingClientRect().width ?? 0
  }
  const handleResize = () => {
    resetInputWidth()
  }

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
    reference$,
    toggleDropdown,
    dropdownVisible,
    onSelect,
    currentPlaceholder,
    selectDisabled,
    readonly,
    handleFocus,
    handleBlur,
    filteredOptions,
    popperSize,
    emptyText,
    showClose,
    handleClear,
    suffixIconClass,
    suffixIconReverse,
    selectedIndex,
    navigateOptions,
    debouncedOnInputChange,
    handleTagClose,
    handleResize,
    selectedOptions,
  }
}