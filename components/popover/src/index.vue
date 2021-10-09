<script lang="ts">
import { CSSProperties, defineComponent, onActivated, onBeforeUnmount, onDeactivated, onMounted, renderSlot, toDisplayString, Fragment, h, Teleport } from 'vue'
import { bool, integer, object, string, array } from 'vue-types'
import { Effect, IPopperOptions } from "./use-popper/type"
import type { Placement, Options, PositioningStrategy, Trigger } from "./use-popper/type"
import usePopper from "./use-popper/index"
import { renderArrow, renderPopper, renderTrigger } from "./renderers"

const popoverProps = {
  arrowOffset: integer().def(5),
  // 使用 teleport 组件来将弹出框“发送”到指定dom节点下，比如这里的body标签
  appendToBody: bool().def(true),
  autoClose: integer().def(0),
  boundariesPadding: integer().def(0),
  content: string().def(''),
  class: string().def(''),
  style: object<CSSProperties>(),
  hideAfter: integer().def(200),
  cutoff: bool().def(false),
  disabled: bool().def(false),
  effect: string<Effect>().def(Effect.DARK),
  enterable: bool().def(true),
  manualMode: bool().def(false),
  showAfter: integer().def(0),
  offset: integer().def(12),
  placement: string<Placement>().def('bottom'),
  popperClass: string().def(''),
  pure: bool().def(false),
  popperOptions: object<Partial<Options>>(),
  showArrow: bool().def(true),
  strategy: string<PositioningStrategy>().def('fixed'),
  transition: string().def('ccd-fade-in-linear'),
  trigger: string<Trigger>().def('hover'),
  visible: bool().def(false),
  stopPopperMouseEvent: bool().def(true),
  gpuAcceleration: bool().def(true),
  fallbackPlacements: array<Placement>().def(['bottom']),
}

export default defineComponent({
  name: 'CPopover',
  props: popoverProps,
  emits: [
    'update:visible',
    'after-enter',
    'after-leave',
    'before-enter',
    'before-leave',
  ],
  setup(props, ctx) {
    if (!ctx.slots.trigger) {
      throw new Error('[CPopover] Trigger must be provided')
    }
    const popperStates = usePopper(props as IPopperOptions, ctx)
    const forceDestroy = () => popperStates.doDestroy(true)
    onMounted(popperStates.initializePopper)
    onBeforeUnmount(forceDestroy)
    onActivated(popperStates.initializePopper)
    onDeactivated(forceDestroy)

    return popperStates
  },

  render() {
    const {
      $slots,
      appendToBody,
      class: kls,
      style,
      effect,
      onPopperMouseEnter,
      onPopperMouseLeave,
      onAfterEnter,
      onAfterLeave,
      onBeforeEnter,
      onBeforeLeave,
      popperClass,
      popperId,
      popperStyle,
      pure,
      showArrow,
      transition,
      visibility,
      stopPopperMouseEvent,
      placement,
    } = this

    // const isManual = this.isManualMode()
    const arrow = renderArrow(showArrow)
    const popper = renderPopper(
      {
        effect,
        name: transition,
        popperClass,
        popperId,
        popperStyle,
        pure,
        stopPopperMouseEvent,
        onMouseenter: onPopperMouseEnter,
        onMouseleave: onPopperMouseLeave,
        onAfterEnter,
        onAfterLeave,
        onBeforeEnter,
        onBeforeLeave,
        visibility,
        placement,
      },
      [
        renderSlot($slots, 'default', {}, () => {
          return [toDisplayString(this.content)]
        }),
        arrow,
      ]
    )

    const _t = $slots.trigger?.()
    const triggerProps = {
      class: kls,
      style,
      ref: "triggerRef",
      ...this.events,
    }
    // const trigger = isManual
    //   ? renderTrigger(_t!, triggerProps)
    //   : withDirectives(renderTrigger(_t!, triggerProps), [[ClickOutside, hide]])
    const trigger = renderTrigger(_t!, triggerProps)

    return h(
      Fragment,
      null,
      [
        trigger,
        h(
          Teleport as any,
          {
            to: 'body',
            disabled: !appendToBody,
          },
          [popper]
        ),
      ]
    )
  }
})
</script>