<template>
  <Input 
    ref="input$" 
    :modelValue="displayValue" 
    class="ccd-input-number"
    @input="handleInput"
    @change="handleInputChange"
  >
    <template #prepend>
      <i @click="decrease" class="ccd-icon-minus" />
    </template>
    <template #append>
      <i @click="increase" class="ccd-icon-plus" />
    </template>
  </Input>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, ref } from 'vue'
import { integer } from 'vue-types'
import Input from "./index.vue"

const inputNumberProps = {
  defaultValue: integer().def(1),
  min: integer().def(0),
  max: integer().def(100),
  step: integer().def(1),
}

export default defineComponent({
  name: "CInputNumber",
  components: {
    Input,
  },
  emits: ['update:modelValue', 'change', 'input'],
  props: inputNumberProps,
  setup(props) {
    const input$ = ref<typeof Input | null>(null)
    const displayValue = ref(props.defaultValue)
    const maxDisabled = computed(() => {
      return displayValue.value + props.step > props.max
    })
    const minDisabled = computed(() => {
      return displayValue.value - props.step < props.min
    })
    const increase = () => {
      if (maxDisabled.value) return
      displayValue.value += props.step
      nextTick(() => {
        input$.value?.setStateValue()
      })
    }
    const decrease = () => {
      if (minDisabled.value) return
      displayValue.value -= props.step
      nextTick(() => {
        input$.value?.setStateValue()
      })
    }
    const handleInput = value => {
      displayValue.value = value
      nextTick(() => {
        input$.value?.setStateValue()
      })      
    }
    const handleInputChange = value => {
      let oldVal = displayValue.value
      let newVal = value === '' ? undefined : Number(value)
      if (newVal !== undefined && !isNaN(newVal)) {
        if (newVal >= props.max) newVal = props.max
        if (newVal <= props.min) newVal = props.min
        if (oldVal === newVal) return
        displayValue.value = newVal
        nextTick(() => {
          input$.value?.setStateValue()
        })
      }
    }
    return {
      input$,
      displayValue,
      increase,
      decrease,
      handleInput,
      handleInputChange,
    }
  },
})
</script>
