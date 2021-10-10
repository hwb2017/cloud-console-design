<template>
  <span
    :class="[
      'ccd-tag',
      `ccd-tag--${theme}`
    ]"
    @click="handleClick"
  >
    <slot></slot>
    <i
      v-if="closable"
      class="ccd-tag__close ccd-icon-cross"
      @click="handleClose"
    ></i>
  </span>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { bool, oneOf } from "vue-types"

const tagProps = {
  closable: bool().def(false),
  theme: oneOf(["dark", "light", "plain"]).def("light")
}

export default defineComponent({
  name: "CTag",
  props: tagProps,
  emits: ["click", "close"],
  setup(_, { emit }) {
    const handleClose = (event: MouseEvent) => {
      event.stopPropagation()
      emit("close", event)
    }
    const handleClick = (event: MouseEvent) => {
      emit("click", event)
    }
    return {
      handleClose,
      handleClick,
    }
  },
})
</script>

