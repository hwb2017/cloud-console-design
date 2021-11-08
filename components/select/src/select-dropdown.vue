<script lang="ts">
import { defineComponent, inject, h } from "vue"
import { array, integer, number } from "vue-types"
import type { SelectContext } from "./type"

const selectDropdownProps = {
  data: array().def([]),
  hoveringIndex: integer().def(-1),
  width: number(),
}

export default defineComponent({
  name: "CSelectDropdown",
  props: selectDropdownProps,
  setup() {
    const select = inject<SelectContext>("CSelect", {} as SelectContext)
    return {
      select,
    }
  },
  render(_ctx) {
    const {
      $slots,
      data,
      width
    } = _ctx
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
    return h(
      'div',
      {
        class: {
          'ccd-select-dropdown': true,
        }
      },
    )
  }
})
</script>