<script lang="ts">
import { defineComponent, h } from "vue"
import { array, integer, number } from "vue-types"
import type { OptionType } from "./type"
import COption from "./option.vue"

const selectDropdownProps = {
  data: array<OptionType>().def([]),
  hoveringIndex: integer().def(-1),
  width: number(),
}

export default defineComponent({
  name: "CSelectDropdown",
  props: selectDropdownProps,
  components: {
    COption
  },
  render() {
    const {
      $slots,
      data,
      width,
    } = this
    if (data.length === 0) {
      return h(
        'div',
        {
          class: 'ccd-select-dropdown',
          style: {
            width: `${width}px`,
          }
        },
        $slots.empty?.()
      )
    }
    const options = data.map((option, index) => {
      return h(
        COption,
        { 
          label: option.label,
          disabled: option.disabled,
          value: option.value,
          'data-index': index,
        }
      )
    })
    return h(
      'div',
      {
        class: {
          'ccd-select-dropdown': true,
        },
        style: {
          width: `${width}px`,
        },
      },
      options
    )
  }
})
</script>