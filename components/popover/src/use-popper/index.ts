import type { SetupContext, ComponentPublicInstance, CSSProperties } from "vue"
import type { IPopperOptions, PopperInstance, Trigger } from "./type"
import { ref, reactive, computed, watch } from "vue"
import type { Ref } from "vue"
import { generateId, isBool, isHTMLElement } from "../../../../utils/helper"
import PopupManager from "../../../../utils/popup-manager"
import type { Nullable, TimeoutHandle } from "../../../../utils/types"
import usePopperOptions from "./popper-options"
import { createPopper } from "@popperjs/core"


export type ElementType = ComponentPublicInstance | HTMLElement
export type EmitType =
  | 'update:visible'
  | 'after-enter'
  | 'after-leave'
  | 'before-enter'
  | 'before-leave'

export interface PopperEvents {
  onClick?: (e: Event) => void
  onMouseenter?: (e: Event) => void
  onMouseleave?: (e: Event) => void
  onFocus?: (e: Event) => void
  onBlur?: (e: Event) => void  
}  

export default function(
  props: IPopperOptions,
  { emit }: SetupContext<EmitType[]>
) {
  const arrowRef = ref<Nullable<HTMLElement>>(null)
  const triggerRef = ref<Nullable<ElementType>>(null)
  const popperRef = ref<Nullable<HTMLElement>>(null)

  const popperId = `ccd-popover-${generateId()}`
  let popperInstance: Nullable<PopperInstance> = null
  let showTimer: Nullable<TimeoutHandle> = null
  let hideTimer: Nullable<TimeoutHandle> = null
  let triggerFocused = false

  const isManualMode = () => props.manualMode || props.trigger === 'manual'
  const popperStyle = ref<CSSProperties>({ zIndex: PopupManager.nextZindex() })
  const popperOptions = usePopperOptions(props, {
    arrow: arrowRef as Ref<HTMLElement>,
  })
  const state = reactive({
    visible: !!props.visible
  })
  const visibility = computed<boolean>({
    get() {
      if (props.disabled) {
        return false
      } else {
        return isBool(props.visible) ? props.visible : state.visible
      }
    },
    set(val) {
      if (isManualMode()) return
      isBool(props.visible)
        ? emit('update:visible', val)
        : (state.visible = val)
    },
  })

  function _show() {
    if (props.autoClose > 0) {
      hideTimer = window.setTimeout(() => {
        _hide()
      }, props.autoClose)
    }
    visibility.value = true
  }
  function _hide() {
    visibility.value = false
  }
  function clearTimers() {
    if (showTimer && hideTimer) {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }
  const show = () => {
    if (isManualMode() || props.disabled) return
    clearTimers()
    if (props.showAfter === 0) {
      _show()
    } else {
      showTimer = window.setTimeout(() => {
        _show()
      }, props.showAfter)
    }
  }
  const hide = () => {
    if (isManualMode()) return
    clearTimers()
    if (props.hideAfter > 0) {
      hideTimer = window.setTimeout(() => {
        close()
      }, props.hideAfter)
    } else {
      close()
    }
  }
  const close = () => {
    _hide()
    if (props.disabled) {
      doDestroy(true)
    }
  }
  function doDestroy(forceDestroy?: boolean) {
    if (!popperInstance || visibility.value && !forceDestroy) return
    detachPopper()
  }
  function detachPopper() {
    popperInstance?.destroy?.()
    popperInstance = null
  }
  function onPopperMouseEnter() {
    if (props.enterable && props.trigger !== 'click') {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    }
  }
  function onPopperMouseLeave() {
    const { trigger } = props
    const shouldPrevent = 
      trigger === 'click' || trigger === 'focus'
    if (shouldPrevent) return
    hide()
  }
  function initializePopper() {
    if (!visibility.value) return
    const unwrappedTrigger = triggerRef.value
    const _trigger = isHTMLElement(unwrappedTrigger)
      ? unwrappedTrigger
      : (unwrappedTrigger as ComponentPublicInstance).$el
    popperInstance = createPopper(_trigger, popperRef.value!, popperOptions.value)
    popperInstance.update()
  }
  const events = <PopperEvents>{}
  function update() {
    if (!visibility.value) return
    if (popperInstance) {
      popperInstance.update()
    } else {
      initializePopper()
    }
  }
  function onVisibilityChange(toState: boolean) {
    if (toState) {
      popperStyle.value.zIndex = PopupManager.nextZindex()
      initializePopper()
    }
  }

  if (!isManualMode()) {
    const toggleState = () => {
      if (visibility.value) {
        hide()
      } else {
        show()
      }
    }
    const popperEventsHandler = (e: Event) => {
      e.stopPropagation()
      switch (e.type) {
        case 'click': {
          if (triggerFocused) {
            triggerFocused = false
          } else {
            toggleState()
          }
          break
        }
        case 'mouseenter': {
          show()
          break
        }
        case 'mouseleave': {
          hide()
          break
        }
        case 'focus': {
          triggerFocused = true
          show()
          break
        }
        case 'blur': {
          triggerFocused = false
          hide()
          break
        }
      }
    }

    const triggerEventsMap: Partial<
      Record<Trigger, (keyof PopperEvents)[]>
    > = {
      click: ['onClick'],
      hover: ['onMouseenter', 'onMouseleave'],
      focus: ['onFocus', 'onBlur'],
    }
    const mapEvents = (t: Trigger) => {
      triggerEventsMap[t]?.forEach((event) => {
        events[event] = popperEventsHandler
      })
    }
    mapEvents(props.trigger)
  }

  watch(popperOptions, (val) => {
    if (!popperInstance) return
    popperInstance.setOptions(val)
    popperInstance.update()
  })
  watch(visibility, onVisibilityChange)

  return {
    update,
    doDestroy,
    show,
    hide,
    onPopperMouseEnter,
    onPopperMouseLeave,
    onAfterEnter: () => {
      emit('after-enter')
    },
    onAfterLeave: () => {
      detachPopper()
      emit('after-leave')
    },
    onBeforeEnter: () => {
      emit('before-enter')
    },
    onBeforeLeave: () => {
      emit('before-leave')
    },
    initializePopper,
    isManualMode,
    arrowRef,
    events,
    popperId,
    popperInstance,
    popperRef,
    popperStyle,
    triggerRef,
    visibility,
  }
}