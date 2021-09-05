
<template>
  <i
    class="ccd-icon"
    :style="style" 
  >
    <slot></slot>
  </i>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { number, string } from "vue-types";
import type { CSSProperties } from "vue";

const iconProps = {
  size: number(),
  color: string(),
};

export default defineComponent({
  name: 'CIcon',
  props: iconProps,
  setup(props) {
    return {
      style: computed(() => {
        if (!props.size && !props.color) {
          return {}
        }
        return {
          ...(props.size ? { '--font-size': `${props.size}px` } : {}),
          ...(props.color ? { '--color': props.color } : {}),
        } as CSSProperties
      })
    }
  },
})
</script>
