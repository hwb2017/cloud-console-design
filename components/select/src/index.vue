<template>
  <div></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { arrayOf, bool, integer, object, oneOf, oneOfType, string } from 'vue-types'
import type { SelectOption } from "./type"


const selectProps = {
  disabled: bool().def(false),
  // Specifies the text to display when a data fetching error occurs. Make sure that you provide recoveryText
  errorText: string().def('Fetch error'),
  // Specifies the text to display at the bottom of the dropdown menu after pagination has reached the end
  finishedText: string().def('No more data'),
  // Specifies the text to display when in the loading state
  loadingText: string().def('Loading'),
  // Specifies the text for the recovery button. The text is displayed next to the error text. Use the onLoadItems event to perform a recovery action (for example, retrying the request)
  recoveryText: string().def('Try again'),
  placeholder: string().def('Please select'),
  options: arrayOf(object<SelectOption>()),
  selectedOptions: arrayOf(object<SelectOption>()),
  statusType: oneOf(['pending', 'loading', 'finished', 'error']).def('finished'),
  keepOpen: bool().def(false),
  clearable: bool().def(false),
  isMultiple: bool().def(false),
  multipleLimit: integer(),
}

export default defineComponent({
  name: 'CSelect',
  emits: [
    'update:modelValue',
    'change',
    'focus',
    'blur',
    'visible-change',
  ],
  setup() {
    
  },
})
</script>
