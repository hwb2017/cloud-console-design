<template>
  <div
    ref="selectWrapper$"
    class="ccd-select"
    @click.stop="toggleDropdown"
  >
    <c-popover
      ref="popper$"
      v-model:visible="dropdownVisible"
      placement="bottom-start"
      :append-to-body="popperAppendToBody"
      :popper-class="`ccd-select_popper ${popperClass}`"
      :fallback-placements="['bottom-start', 'top-start', 'right', 'left']"
      manual-mode
      :effect="Effect.LIGHT"
      pure
      trigger="click"
      transition="ccd-zoom-in-top"
      :stop-popper-mouse-event="false"
      :gpu-acceleration="false"
      @before-enter="handleDropdownEnter"
    >
      <template #trigger>
        <div class="select-trigger">
          <!-- <div v-if="isMultiple"></div> -->
          <c-input
            ref="reference$"
            v-model="seletedLabel"
            :placeholder="currentPlaceholder"
            :auto-compelete="autocomplete"
            :disabled="selectDisabled"
            :readonly="readonly"
            :class="{ 'is-focus': visible }"
            @focus="handleFocus"
            @blur="handleBlur"
            
          ></c-input>
        </div>
      </template>
    </c-popover>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { arrayOf, bool, integer, object, oneOf, oneOfType, string, number } from 'vue-types'
import CInput from "../../input"
import CPopover, { Effect } from "../../popover"
import CTag from "../../tag"
import CScrollbar from "../../scrollbar"
import CSelectMenu from "./select-dropdown.vue"
import COption from "./option.vue"

const selectProps = {
  modelValue: oneOfType([string(), number(), bool(), object()]),
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
  options: arrayOf(object()),
  selectedOptions: arrayOf(object()),
  statusType: oneOf(['pending', 'loading', 'finished', 'error']).def('finished'),
  keepOpen: bool().def(false),
  clearable: bool().def(false),
  isMultiple: bool().def(false),
  multipleLimit: integer().def(5),
  automaticDropdown: bool().def(false),
  autocomplete: bool().def(false),
  filterable: bool().def(false),
  allowCreate: bool().def(false),
  loading: bool().def(false),
  popperClass: string().def(""),
  remote: bool().def(false),
  collapseTags: bool().def(false),
  popperAppendToBody: bool().def(true),
}

export default defineComponent({
  name: 'CSelect',
  components: {
    CInput,
    CPopover,
    CTag,
    CScrollbar,
    CSelectMenu,
    COption,
  },
  props: selectProps,
  emits: [
    'update:modelValue',
    'change',
    'focus',
    'blur',
    'visible-change',
  ],
  setup(props, ctx) {
    return {
      Effect,
    }
  },
})
</script>
