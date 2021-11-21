<template>
  <div
    ref="selectWrapper$"
    class="ccd-select"
    @click.stop="toggleDropdown"
  >
    <c-popover
      ref="popper$"
      v-model:visible="dropdownVisible"
      placement="bottom"
      :append-to-body="popperAppendToBody"
      :popper-class="`ccd-select__popper ${popperClass}`"
      :fallback-placements="['bottom', 'top', 'right', 'left']"
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
        <div class="select-trigger" ref="selection$">
          <!-- <div v-if="isMultiple"></div> -->
          <c-input
            ref="reference$"
            v-model="selectedLabel"
            :placeholder="currentPlaceholder"
            :auto-compelete="autocomplete"
            :disabled="selectDisabled"
            :readonly="readonly"
            :class="{ 'is-focus': visible }"
            @focus="handleFocus"
            @blur="handleBlur"
            @mouseenter="inputHovering = true"
            @mouseleave="inputHovering = false"
          >
          </c-input>
        </div>
      </template>
      <template #default>
        <c-select-dropdown
          ref="dropdown$"
          :data="filteredOptions"
          :width="popperSize"
          :hovering-index="hoveringIndex"
        >
        <template #empty>
          <slot name="empty">
            <p class="ccd-select-dropdown__empty"> {{ emptyText }}</p>
          </slot>
        </template>
        </c-select-dropdown>
      </template>
    </c-popover>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, provide } from "vue"
import { array, bool, integer, object, oneOf, oneOfType, string, number } from 'vue-types'
import CInput from "../../input"
import CPopover, { Effect } from "../../popover"
// import CTag from "../../tag"
import CSelectDropdown from "./select-dropdown.vue"
import type { OptionType, SelectProps, SelectContext } from "./type"
import { useSelectStates, useSelect } from "./useSelect"

const selectProps = {
  modelValue: oneOfType([array(), string(), number(), bool(), object()]),
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
  options: array<OptionType>().def([]),
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
  noMatchText: string().def(""),
  noDataText: string().def(""),
  valueKey: string().def("value"),
}

export default defineComponent({
  name: 'CSelect',
  components: {
    CInput,
    CPopover,
    // CTag,
    CSelectDropdown,
  },
  props: selectProps,
  emits: [
    'update:modelValue',
    'change',
    'focus',
    'blur',
    'visible-change',
  ],
  setup(props: SelectProps, ctx) {
    const states = useSelectStates(props)
    const {
      selectedLabel,
      visible,
      inputHovering,
      hoveringIndex,
    } = toRefs(states)
    const {
      reference$,
      toggleDropdown,
      dropdownVisible,
      handleDropdownEnter,
      currentPlaceholder,
      selectDisabled,
      readonly,
      handleFocus,
      handleBlur,
      filteredOptions,
      popperSize,
      emptyText
    } = useSelect(props, states, ctx)

    provide<SelectContext>("CSelect", {
      isMultiple: props.isMultiple,
      options: props.options,
      setSelected: (value: any) => {
        ctx.emit('update:modelValue', value)
      }
    })

    return {
      reference$,
      Effect,
      toggleDropdown,
      dropdownVisible,
      handleDropdownEnter,
      selectedLabel,
      currentPlaceholder,
      selectDisabled,
      readonly,
      visible,
      handleFocus,
      handleBlur,
      inputHovering,
      filteredOptions,
      popperSize,
      hoveringIndex,
      emptyText
    }
  },
})
</script>
