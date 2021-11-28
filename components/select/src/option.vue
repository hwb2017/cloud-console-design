<template>
  <li 
    class="ccd-select-dropdown__item"
    :class="{ 'is-disabled': disabled }"
    @click.stop="handleOptionClick"
  >
    {{ label }}
  </li>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue"
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
  setup(props) {
    const select = inject<SelectContext>("CSelect", {} as SelectContext)
    const handleOptionClick = () => {
      if (props.disabled) return
      const option: OptionType = {
        value: props.value,
        label: props.label,
      }
      select.onSelect(option)
    }
    return {
      handleOptionClick
    }    
  }
})
</script>
