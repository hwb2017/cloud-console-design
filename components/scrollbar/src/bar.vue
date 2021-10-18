<template>
  <transition name="ccd-scrollbar-fade">
    <div
      v-show="always || visible"
      ref="track$"
      :class="['ccd-scrollbar__track', 'is-' + bar.key]"
      @mousedown="clickTrackHandler"
    >
      <div
        ref="thumb$"
        class="ccd-scrollbar__thumb"
        :style="thumbStyle"
        @mousedown="clickThumbHandler"
      ></div>
    </div>
  </transition>
</template>
<script lang="ts">
import { defineComponent, ref, inject, computed, onMounted, onBeforeUnmount } from "vue"
import { bool, number, string } from "vue-types"
import type { Ref } from "vue"
import type { Nullable } from "../../../utils/types"
import { BAR_MAP, renderThumbStyle } from "./util"

const barProps = {
  vertical: bool(),
  size: string(),
  move: number(),
  ratio: number().isRequired,
  always: bool()
}

export default defineComponent({
  name: "Bar",
  props: barProps,
  setup(props) {
    const track$ = ref<Nullable<HTMLElement>>(null)
    const thumb$ = ref<Nullable<HTMLElement>>(null)
    const scrollbar = inject<Ref<Nullable<HTMLElement>>>("scrollbar",
      {} as Ref<Nullable<HTMLElement>>)
    const wrap = inject<Ref<Nullable<HTMLElement>>>("scrollbar-wrap",
      {} as Ref<Nullable<HTMLElement>>)
    // 统一横轴和纵轴的属性名
    const bar = computed(
      () => BAR_MAP[props.vertical ? "vertical" : "horizontal"]
    )
    const barStore = ref({})
    // 用于记录鼠标是否点击者滚动条，使用cursorDown避免与mousedown事件混淆
    const cursorDown = ref(false)
    // 用于记录鼠标是否在滚动条及对应内容区的范围内
    const cursorLeave = ref(true)
    const visible = ref(false)
    // 用于保存浏览器默认的 selectstart 事件监听，避免在拖拽滚动条的过程中触发
    let onselectstartStore: ((...args: any) => unknown) | null = null

    const offsetRatio = computed(() => {
      return (
        track$.value?.[bar.value.offset] ** 2 /
        wrap.value?.[bar.value.scrollSize] /
        props.ratio /
        thumb$.value?.[bar.value.offset]
      )
    })
    const thumbStyle = computed(() => {
      return renderThumbStyle({
        size: props.size,
        move: props.move,
        bar: bar.value
      })
    })
    const mouseMoveDocumentHandler = (e: MouseEvent) => {
      if (cursorDown.value === false) return
      // 上次点击thumb时，鼠标点击处距离thumb下沿的距离
      const prevPage = barStore.value[bar.value.axis]
      if (!prevPage) return
      // 鼠标拖拽点到track顶部的距离
      const offset = 
        (track$.value?.getBoundingClientRect()[bar.value.direction] -
         e[bar.value.client]) * -1
      // 上次点击thumb时，鼠标点击处距离thumb上沿的距离
      const thumbClickPosition = thumb$.value?.[bar.value.offset] - prevPage
      const thumbPositionPercentage = 
        ((offset - thumbClickPosition) * 100 * offsetRatio.value) /
        track$.value?.[bar.value.offset]
      wrap.value![bar.value.scroll] =
        (thumbPositionPercentage * wrap.value?.[bar.value.scrollSize]) / 100
    }
    const mouseUpDocumentHandler = () => {
      cursorDown.value = false
      barStore.value[bar.value.axis] = 0
      document.removeEventListener("mousemove", mouseMoveDocumentHandler)
      document.removeEventListener("mouseup", mouseUpDocumentHandler)
      document.onselectstart = onselectstartStore
      if (cursorLeave.value) {
        visible.value = false
      }
    }
    const startDrag = (e: MouseEvent) => {
      e.stopImmediatePropagation()
      cursorDown.value = true
      // 拖拽事件一般都在鼠标按下以后在document上注册mousemove和mouseup事件，
      // 使得鼠标超出原来元素的范围后，这两个事件还能监听
      document.addEventListener("mousemove", mouseMoveDocumentHandler)
      document.addEventListener("mouseup", mouseUpDocumentHandler)
      onselectstartStore = document.onselectstart
      document.onselectstart = () => false
    }
    const clickThumbHandler = (e: MouseEvent) => {
      e.stopPropagation()
      // prevent click event of middle and right button
      if (e.ctrlKey || [1,2].includes(e.button)) return
      // 取消选择的文字
      window.getSelection()?.removeAllRanges()
      startDrag(e)
      barStore.value[bar.value.axis] = 
       e.currentTarget?.[bar.value.offset] -
        (e[bar.value.client] -
          (e.currentTarget as HTMLElement).getBoundingClientRect()[
            bar.value.direction
          ])
    }
    const clickTrackHandler = (e: MouseEvent) => {
      // 鼠标点击处距离track顶部的距离
      const offset = Math.abs(
        (e.target as HTMLElement).getBoundingClientRect()[bar.value.direction] -
          e[bar.value.client]
      )
      // thumb一半的长度
      const thumbHalf = thumb$.value?.[bar.value.offset] / 2
      // 计算thumb中点移动到鼠标点击处后，thumb以上的track部分的长度占track总长的比例
      const thumbPositionPercentage = 
        ((offset - thumbHalf) * 100 * offsetRatio.value) /
        track$.value?.[bar.value.offset]
      wrap.value![bar.value.scroll] =
        (thumbPositionPercentage * wrap.value?.[bar.value.scrollSize]) / 100
    }
    const mouseMoveScrollbarHandler = () => {
      cursorLeave.value = false
      visible.value = !!props.size
    }
    const mouseLeaveScrollbarHandler = () => {
      cursorLeave.value = true
      visible.value = cursorDown.value
    }

    onMounted(() => {
      scrollbar.value!.addEventListener("mousemove", mouseMoveScrollbarHandler)
      scrollbar.value!.addEventListener("mouseleave", mouseLeaveScrollbarHandler)
    })
    onBeforeUnmount(() => {
      document.removeEventListener("mouseup", mouseUpDocumentHandler)
      scrollbar.value!.removeEventListener("mousemove", mouseMoveScrollbarHandler)
      scrollbar.value!.removeEventListener("mouseleave", mouseLeaveScrollbarHandler)
    })

    return {
      track$,
      thumb$,
      bar,
      visible,
      thumbStyle,
      clickTrackHandler,
      clickThumbHandler,  
    }
  },
})
</script>
