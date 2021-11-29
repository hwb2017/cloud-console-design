<template>
  <li 
    class="ccd-select-dropdown__item"
    :class="{ 
      'is-disabled': disabled,
      'is-hover': isHover,
      'is-selected': isSelected,
    }"
    @click.stop="handleOptionClick"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    {{ label }}
  </li>
</template>

<script lang="ts">
import { defineComponent, inject, computed, ref } from "vue"
import { bool, oneOfType, string } from "vue-types"
import type { SelectContext, OptionType } from "./type"

const optionProps = {
  label: string().def(""),
  disabled: bool().def(false),
  value: oneOfType([String, Object, Number])
}

export default defineComponent({
  name: "COption",
  props: optionProps,
  setup(props, { attrs }) {
    const select = inject<SelectContext>("CSelect", {} as SelectContext)
    const handleOptionClick = () => {
      if (props.disabled) return
      const option: OptionType = {
        value: props.value,
        label: props.label,
      }
      select.onSelect(option)
    }
    const hovering = ref(false)
    const isHover = computed(() => {
      if (props.disabled) return false
      return select.hoverIndex.value === attrs['data-index'] || hovering.value
    })
    const isSelected = computed(() => {
      return select.selectedIndex.value === attrs['data-index']
    })
    return {
      handleOptionClick,
      isHover,
      isSelected,
      hovering,
    }    
  }
})
</script>