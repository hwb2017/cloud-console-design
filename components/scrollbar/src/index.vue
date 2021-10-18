<template>
  <div ref="scrollbar$" class="ccd-scrollbar">
    <div
      ref="wrap$"
      :class="[
        wrapClass,
        'ccd-scrollbar__wrap',
        native ? '' : 'ccd-scrollbar__wrap--hidden-default'
      ]"
      :style="style"
      @scroll="handleScroll"
    >
      <div
        ref="resize$"
        :class="['ccd-scrollbar__view', viewClass]"
        :style="viewStyle"
      >
        <slot />
      </div>
      <template v-if="!native">
        <bar :move="moveX" :ratio="ratioX" :size="sizeWidth" :always="always"></bar>
        <bar :move="moveY" :ratio="ratioY" :size="sizeHeight" vertical :always="always"></bar>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, provide, onMounted, nextTick } from "vue"
import { bool, integer, oneOfType, string } from "vue-types"
import Bar from "./bar.vue"
import type { Nullable } from "../../../utils/types"

const scrollBarProps = {
  height: oneOfType([String, integer()]).def(""),
  maxHeight: oneOfType([String, integer()]).def(""),
  native: bool().def(false),
  wrapStyle: string().def(""),
  wrapClass: string().def(""),
  viewStyle: string().def(""),
  viewClass: string().def(""),
  resize: bool().def(true),
  always: bool().def(false),
  minSize: integer().def(20),
}

export default defineComponent({
  name: "CScrollbar",
  components: {
    Bar
  },
  props: scrollBarProps,
  emits: ["scroll"],
  setup(props, { emit }) {
    const sizeWidth = ref("0")
    const sizeHeight = ref("0")
    const moveX = ref(0)
    const moveY = ref(0)
    const scrollbar$ = ref<Nullable<HTMLElement>>(null)
    const wrap$ = ref<Nullable<HTMLElement>>(null)
    const resize$ = ref<Nullable<HTMLElement>>(null)
    const ratioX = ref(1)
    const ratioY = ref(1)
    const GAP = 4 // top 2 + bottom 2 of bar instance

    provide("scrollbar", scrollbar$)
    provide("scrollbar-wrap", wrap$)

    const style = computed(() => {
      let style = props.wrapStyle
      style += props.height
        ? `height: ${props.height};`
        : ''
      style += props.maxHeight
        ? `max-height: ${props.maxHeight}`
        : ''
      return style
    })

    // 用鼠标滚轮滚动内部div时，使得非原生的滚动条也跟着移动
    const handleScroll = () => {
      if (wrap$.value) {
        const offsetWidth = wrap$.value.offsetWidth - GAP
        const offsetHeight = wrap$.value.offsetHeight - GAP
        moveX.value = ((wrap$.value.scrollLeft * 100) / offsetWidth) * ratioX.value
        moveY.value = ((wrap$.value.scrollTop * 100) / offsetHeight) * ratioY.value
        
        // 父组件上像监听原生click事件那样监听原生的scroll事件，需要通过emit的方式发布
        emit('scroll', {
          scrollTop: wrap$.value.scrollTop,
          scrollLeft: wrap$.value.scrollLeft,
        })
      }
    }
    const update = () => {
      if (!wrap$.value) return

      const offsetHeight = wrap$.value.offsetHeight - GAP
      const offsetWidth = wrap$.value.offsetWidth - GAP

      const originalHeight = offsetHeight ** 2 / wrap$.value.scrollHeight
      const originalWidth = offsetWidth ** 2 / wrap$.value.scrollWidth
      const height = Math.max(originalHeight, props.minSize)
      const width = Math.max(originalWidth, props.minSize)

      ratioY.value =
        originalHeight /
        (offsetHeight - originalHeight) /
        (height / (offsetHeight - height))
      ratioX.value =
        originalWidth /
        (offsetWidth - originalWidth) /
        (width / (offsetWidth - width))

      sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : ''
      sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : ''      
    }
    
    onMounted(() => {
      if (!props.native) {
        nextTick(update)
      }
    })
    return {
      sizeWidth,
      sizeHeight,
      moveX,
      moveY,
      ratioX,
      ratioY,
      style,
      scrollbar$,
      wrap$,
      resize$,
      handleScroll,
    }
  }
})
</script>