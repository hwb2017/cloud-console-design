<script lang="ts">
import { defineComponent, inject, h } from "vue"
import { array, integer, number } from "vue-types"
import type { SelectContext, OptionType, Option } from "./type"
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
  setup() {
    const select = inject<SelectContext>("CSelect", {} as SelectContext)
    const getOptionByLabel = (options: OptionType[], label: string): OptionType | null => {
      for (let option of options) {
        if (option.label === label) {
          return option
        }
      }
      return null
    }
    const handleOptionsClick = (e: MouseEvent) => {
      let optionLabel = (e.target as HTMLLIElement).innerText
      let currentOption = getOptionByLabel(select.options, optionLabel)
      if (currentOption !== null) {
        select.setSelected(currentOption.value)
      }
    }
    return {
      handleOptionsClick
    }
  },
  render() {
    const {
      $slots,
      data,
      width,
      handleOptionsClick
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
    const options = data.map(option => {
      return h(
        COption,
        { 
          label: option.label,
          disabled: option.disabled
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
        onClick: handleOptionsClick
      },
      options
    )
  }
})
</script>