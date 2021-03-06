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
    >
      <template #trigger>
        <div class="select-trigger" ref="selection$">
          <div 
            ref="tags$"
            v-if="isMultiple"
            class="ccd-select__tags"
          >
            <span v-if="collapseTags">
              <c-tag 
                v-if="selectedOptions.length >= 1"
                closable 
                theme="plain"
                @close="handleTagClose(selectedOptions[0])"
              >
                <span 
                  class="ccd-select__tags-text"
                  :style="{ maxWidth: inputWidth - 123 + 'px' }"
                >
                  {{ selectedOptions[0].label }}
                </span>
              </c-tag>
              <c-tag 
                v-if="selectedOptions.length > 1"
                theme="plain"
              >
                <span 
                  class="ccd-select__tags-text"
                >
                  +{{ selectedOptions.length - 1 }}
                </span>
              </c-tag>              
            </span>  
            <span v-else>
              <c-tag 
                v-for="option in selectedOptions"
                :key="option.value"
                closable 
                theme="plain"
                @close="handleTagClose(option)"
              >
                <span 
                  class="ccd-select__tags-text"
                  :style="{ maxWidth: inputWidth - 75 + 'px' }"
                >
                  {{ option.label }}
                </span>
              </c-tag>
            </span>
            <input v-if="filterable" class="ccd-select__input"/>
          </div>
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
            @keydown.up.stop.prevent="navigateOptions('prev')"
            @keydown.down.stop.prevent="navigateOptions('next')"
            @keydown.enter.stop.prevent="selectHoveringOption"
            @keydown.esc.stop.prevent="visible = false"
            @input="debouncedOnInputChange"
          >
            <template #suffix>
              <i
                v-if="suffixIconName"
                v-show="!showClose"
                :class="[suffixIconClass, suffixIconReverse]"
              >
              </i>
              <i 
                v-if="showClose" 
                class="ccd-icon-cancel-circle ccd-input__clear"
                @click="handleClear"
              >
              </i>
            </template>
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
import { defineComponent, toRefs, provide, onMounted } from "vue"
import { array, bool, integer, oneOf, oneOfType, string } from 'vue-types'
import CInput from "../../input"
import CPopover, { Effect } from "../../popover"
import CTag from "../../tag"
import CSelectDropdown from "./select-dropdown.vue"
import type { OptionType, SelectProps, SelectContext } from "./type"
import { useSelectStates, useSelect } from "./useSelect"

const selectProps = {
  modelValue: oneOfType([array<string>(), string()]),
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
  multipleLimit: integer().def(0),
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
  suffixIconName: string().def("circle-down"),
  defaultFirstOption: bool().def(false),
}

export default defineComponent({
  name: 'CSelect',
  components: {
    CInput,
    CPopover,
    CTag,
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
    const states = useSelectStates()
    const {
      selectedLabel,
      visible,
      inputHovering,
      hoveringIndex,
      inputWidth,
    } = toRefs(states)
    const {
      reference$,
      tags$,
      popper$,
      selection$,
      toggleDropdown,
      dropdownVisible,
      currentPlaceholder,
      selectDisabled,
      readonly,
      handleFocus,
      handleBlur,
      filteredOptions,
      popperSize,
      emptyText,
      onSelect,
      showClose,
      handleClear,
      suffixIconClass,
      suffixIconReverse,
      selectedIndex,
      navigateOptions,
      debouncedOnInputChange,
      handleTagClose,
      handleResize,
      selectedOptions,
    } = useSelect(props, states, ctx)

    provide<SelectContext>("CSelect", {
      isMultiple: props.isMultiple,
      multipleLimit: props.multipleLimit,
      options: props.options,
      onSelect,
      hoverIndex: hoveringIndex,
      selectedIndex: selectedIndex
    })

    const selectHoveringOption = () => {
      const hoveringOption = filteredOptions.value[hoveringIndex.value]
      onSelect(hoveringOption, false)
    }
    
    onMounted(() => {
      handleResize()
    })

    return {
      reference$,
      tags$,
      popper$,
      selection$,
      Effect,
      toggleDropdown,
      dropdownVisible,
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
      emptyText,
      showClose,
      handleClear,
      suffixIconClass,
      suffixIconReverse,
      navigateOptions,
      selectHoveringOption,
      debouncedOnInputChange,
      selectedOptions,
      handleTagClose,
      inputWidth,
      handleResize,
    }
  },
})
</script>
