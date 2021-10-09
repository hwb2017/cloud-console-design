import { cloneVNode } from "vue"
import type { VNode, Ref, ComponentPublicInstance } from "vue"
import { getFirstValidNode } from "../../../../utils/helper"

type EventHandler = (e: Event) => unknown
interface IRenderTriggerProps extends Record<string, unknown> {
  ref: string | Ref<ComponentPublicInstance | HTMLElement>,
  onClick?: EventHandler,
  onMouseover?: EventHandler
  onMouseleave?: EventHandler
  onFocus?: EventHandler  
}

export default function rederTrigger(
  trigger: VNode[],
  extraProps: IRenderTriggerProps
) {
  const firstElement = getFirstValidNode(trigger, 1)
  if (!firstElement) {
    throw new Error("trigger expects single rooted node")
  }
  return cloneVNode(firstElement, extraProps, true)
}