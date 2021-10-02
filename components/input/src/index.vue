<template>
  <div
    :class="[
      'ccd-input',
      {
        'is-disabled': disabled,
        'is-exceed': inputExceed,
        'ccd-input-group': $slots.prepend || $slots.append,
        'ccd-input-group--append': $slots.append,
        'ccd-input-group--prepend': $slots.prepend,
        'ccd-input--prefix': $slots.prefix || prefixIcon,
        'ccd-input--suffix': $slots.suffix || suffixIcon,
      },
      $attrs.class
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div v-if="$slots.prepend" class="ccd-input-group__prepend">
      <slot name="prepend"></slot>
    </div>
    <input
      ref="input$"
      class="ccd-input__inner"
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autoComplete"
      :placeholder="placeholder"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      @keydown="handleKeydown"
    >
    <span v-if="$slots.prefix || prefixIcon" class="ccd-input__prefix">
      <slot name="prefix"></slot>
      <i
        v-if="prefixIcon"
        :class="['ccd-input__icon', prefixIcon]"
      ></i>
    </span>
    <span v-if="isSuffixVisible" class="ccd-input__suffix">
      <span class="ccd-input__suffix-inner">
        <template v-if="!showClear">
          <slot name="suffix"></slot>
          <i v-if="suffixIcon" :class="['ccd-input__icon', suffixIcon]"></i>
        </template>
        <i
          v-if="showClear"
          class="ccd-input__icon ccd-icon-cancel-circle ccd-input__clear"
          @mousedown.prevent
          @click="clear"
        ></i>
      </span>
    </span>
    <div v-if="$slots.append" class="ccd-input-group__append">
      <slot name="append"></slot>
    </div>    
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from "vue"
import { bool, integer, number, oneOf, oneOfType, string } from "vue-types"

const inputProps = {
  modelValue: oneOfType([String, integer()]).def(""),
  autoComplete: string().def("off"),
  autoFocus: bool().def(false),
  disabled: bool().def(false),
  validateStatus: oneOf(["success", "error", "validating", ""]).def(""),
  placeholder: string().def(""),
  readonly: bool().def(false),
  maxlength: number(),
  clearable: bool().def(false),
  showPassword: bool().def(false),
  prefixIcon: string().def(""),
  suffixIcon: string().def(""),
}

export default defineComponent({
  name: "CInput",
  inheritAttrs: false,
  props: inputProps,
  emits: ["update:modelValue", "input", "change", "focus", "blur", "clear",
    "mouseleave", "mouseenter", "keydown"],
  setup(props, ctx) {
    const input$ = ref<HTMLInputElement | null>(null)
    const focused = ref(false)
    const hovering = ref(false)
    const isComposing = ref(false)
    const stateValue = computed(() => (props.modelValue === null || props.modelValue === undefined) ? "" : String(props.modelValue))
    const showClear = computed(() => {
      return props.clearable &&
      !props.disabled &&
      !props.readonly &&
      stateValue.value &&
      (focused.value || hovering.value)
    })
    const textLength = computed(() => {
      return stateValue.value.length
    })
    const inputExceed = computed(() => {
      return props.maxlength && textLength.value > props.maxlength
    })
    const isSuffixVisible = computed(() => {
      return ctx.slots.suffix ||
        props.suffixIcon ||
        showClear.value
    })
    const setStateValue = () => {
      const input = input$.value
      if (!input || input.value === stateValue.value) return
      input.value = stateValue.value
    }
    const handleInput = (event: Event) => {
      let { value } = event.target as HTMLInputElement

      if (isComposing.value) return

      if (value === stateValue.value) return

      if (props.maxlength) {
        const sliceIndex = inputExceed.value ? props.maxlength : textLength.value
        value = value.slice(0, sliceIndex)
      }

      ctx.emit("update:modelValue", value)
      ctx.emit("input", value)

      nextTick(setStateValue)
    }
    const handleChange = (event: Event) => {
      ctx.emit("change", (event.target as HTMLInputElement).value)
    }
    const handleFocus = (event: Event) => {
      focused.value = true
      ctx.emit("focus", event)
    }
    const handleBlur = (event: Event) => {
      focused.value = false
      ctx.emit("blur", event)
    }
    const handleCompositionStart = () => {
      isComposing.value = true
    }
    const handleCompositionEnd = (event: Event) => {
      if (isComposing.value) {
        isComposing.value = false
        handleInput(event)
      }
    }
    const handleMouseLeave = (event: Event) => {
      hovering.value = false
      ctx.emit("mouseleave", event) 
    }
    const handleMouseEnter = (event: Event) => {
      hovering.value = true
      ctx.emit("mouseenter", event)
    }
    const handleKeydown = (event: Event) => {
      ctx.emit("keydown", event)
    }
    const clear = () => {
      ctx.emit("update:modelValue", "")
      ctx.emit("change", "")
      ctx.emit("clear", "")
      ctx.emit("input", "")
      nextTick(setStateValue)
    }

    watch(() => stateValue, () => {
      setStateValue()
    })
    
    onMounted(() => {
      setStateValue()
    })

    return {
      input$,
      showClear,
      inputExceed,
      handleInput,
      handleChange,
      handleFocus,
      handleBlur,
      handleCompositionStart,
      handleCompositionEnd,
      handleMouseLeave,
      handleMouseEnter,
      handleKeydown,
      clear,
      isSuffixVisible,
    }
  },
})
</script>
