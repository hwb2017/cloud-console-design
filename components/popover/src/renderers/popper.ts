import type { CSSProperties, Ref, VNode } from "vue"
import type { Effect } from "../use-popper/type"
import { noop } from "../../../../utils/helper"
import { Transition, vShow, withCtx, withDirectives, h } from "vue"

interface IRenderPopperProps {
  effect: Effect
  name: string
  stopPopperMouseEvent: boolean
  popperClass: string
  popperStyle?: Partial<CSSProperties>
  popperId: string
  popperRef?: Ref<HTMLElement>
  pure?: boolean
  visibility: boolean
  onMouseenter: () => void
  onMouseleave: () => void
  onAfterEnter?: () => void
  onAfterLeave?: () => void
  onBeforeEnter?: () => void
  onBeforeLeave?: () => void
  placement: string
}

export default function renderPopper(
  props: IRenderPopperProps,
  children: VNode[]
) {
  const {
    effect,
    name,
    stopPopperMouseEvent,
    popperClass,
    popperStyle,
    popperRef,
    pure,
    popperId,
    visibility,
    onMouseenter,
    onMouseleave,
    onAfterEnter,
    onAfterLeave,
    onBeforeEnter,
    onBeforeLeave,
    placement,
  } = props
  
  const kls = [popperClass, `ccd-popover`, `is-${effect}`, pure ? 'is-pure': '']
  const mouseUpAndDown = stopPopperMouseEvent ?  (e: Event) => e.stopPropagation() : noop
  /**
   * Equivalent to
   * <transition :name="name">
   *  <div v-show="visibility" :aria-hidden="!visibility" :class="kls" ref="popperRef" role="tooltip" @mouseenter="" @mouseleave="" @click="">
   *    <slot />
   *  </div>
   * </transition>
   */
  
  return h(
    Transition,
    {
      name,
      onAfterEnter,
      onAfterLeave,
      onBeforeEnter,
      onBeforeLeave,
    },
    {
      default: withCtx(() => [
        withDirectives(
          h(
            "div",
            {
              class: kls,
              style: popperStyle ?? {},
              id: popperId,
              ref: popperRef ?? "popperRef",
              role: "tooltip",
              onMouseenter,
              onMouseleave,
              onClick: (e: Event) => e.stopPropagation(),
              onMousedown: mouseUpAndDown,
              onMouseup: mouseUpAndDown,
              'data-popper-placement': placement,
            },
            children
          ),
          [[vShow, visibility]]
        ),
      ]),
    }
  )
}