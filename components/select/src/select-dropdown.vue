<script lang="ts">
import { defineComponent, inject, h, ref } from "vue"
import { array, number } from "vue-types"
import type { SelectContext } from "./type"

const selectDropdownProps = {
  data: array().def([]),
  width: number(),
}

export default defineComponent({
  name: "CSelectDropdown",
  props: selectDropdownProps,
  setup() {
    const select = inject<SelectContext>("CSelect", {} as SelectContext)
    return {
    }
  },
})
</script>