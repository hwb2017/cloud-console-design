<template>
  <div
    :class="[
      'ccd-textarea',
      {
        'is-disabled': disabled,
        'is-exceed': inputExceed,
      },
      $attrs.class
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"    
  >
    <textarea
      ref="textarea$"
      class="ccd-textarea__inner"
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autoComplete"
      :placeholder="placeholder"
      :rows="rows"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      @keydown="handleKeydown"
    >
    </textarea>  
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import { bool, integer, oneOfType, string } from "vue-types"

const inputTextareaProps = {
  modelValue: oneOfType([String, integer()]).def(""),
  autoComplete: string().def("off"),
  autoFocus: bool().def(false),
  disabled: bool().def(false),
  placeholder: string().def(""),
  readonly: bool().def(false),
  maxlength: oneOfType([String, integer()]),
  rows: oneOfType([String, integer()]).def(5),
}
export default defineComponent({
  name: "CInputTextarea",
  inheritAttrs: false,
  props: inputTextareaProps,
  emits: ["update:modelValue", "input", "change", "focus", "blur", "clear",
    "mouseleave", "mouseenter", "keydown"],  
  setup(props, ctx) {
    const textarea$ = ref<HTMLTextAreaElement | null>(null)
    const focused = ref(false)
    const isComposing = ref(false)

    const stateValue = computed(() => (props.modelValue === null || props.modelValue === undefined) ? "" : String(props.modelValue))
    const textLength = computed(() => {
      return stateValue.value.length
    })
    const inputExceed = computed(() => {
      return props.maxlength && textLength.value > props.maxlength
    })

    const setStateValue = () => {
      const input = textarea$.value
      if (!input || input.value === stateValue.value) return
      input.value = stateValue.value
    }
    const handleInput = (event: Event) => {
      let { value } = event.target as HTMLInputElement

      if (isComposing.value) return

      if (value === stateValue.value) return

      if (props.maxlength) {
        const sliceIndex = inputExceed.value ? textLength.value : props.maxlength
        value = value.slice(0, Number(sliceIndex))
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
      ctx.emit("mouseleave", event) 
    }
    const handleMouseEnter = (event: Event) => {
      ctx.emit("mouseenter", event)
    }
    const handleKeydown = (event: Event) => {
      ctx.emit("keydown", event)
    }
    
    watch(() => stateValue, () => {
      setStateValue()
    })

    onMounted(() => {
      setStateValue()
    })

    return {
      textarea$,
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
    }
  },
})
</script>
