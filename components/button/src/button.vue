<template>
  <button
    :class="[
      'ccd-button',
      variant ? 'ccd-button--' + variant : '',
      {
        'is-disabled': disabled,
        'is-loading': loading
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { string, bool, oneOf } from "vue-types";

const buttonProps = {
  disabled: bool().def(false),
  formAction: oneOf(["submit", "none"]).def("submit"),
  href: string(),
  iconAlign: oneOf(["left", "right"]).def("left"),
  iconAlt: string(),
  iconName: string(),
  iconUrl: string(),
  loading: bool().def(false),
  target: string(),
  variant: oneOf(["normal", "primary", "link", "icon", "inline-icon"]).def(
    "normal"
  ),
};

export default defineComponent({
  name: "CButton",
  props: buttonProps,
  emits: ["click"],
  setup(_, { emit }) {
    const handleClick = (event: MouseEvent) => {
      emit("click", event);
    };
    return {
      handleClick,
    };
  },
});
</script>
