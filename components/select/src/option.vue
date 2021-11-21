<template>
  <li 
    class="ccd-select-dropdown__item"
    :class="{ 'is-disabled': disabled }"
  >
    {{ label }}
  </li>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { bool, string } from "vue-types"

const optionProps = {
  label: string().def(""),
  disabled: bool().def(false)
}

export default defineComponent({
  name: "COption",
  props: optionProps
})
</script>
