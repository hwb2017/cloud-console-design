export enum Effect {
  DARK = 'dark',
  LIGHT = 'light',
}

import type {
  Placement,
  PositioningStrategy,
  Instance as PopperInstance,
  Options,
} from "@popperjs/core"

export type { Placement, PositioningStrategy, PopperInstance, Options }

export type Trigger = 'click' | 'hover' | 'focus' | 'manual'

export type IPopperOptions = {
  arrowOffset: number
  autoClose: number
  boundariesPadding: number
  class: string
  cutoff: boolean
  disabled: boolean
  enterable: boolean
  hideAfter: number
  manualMode: boolean
  offset: number
  placement: Placement
  popperOptions: Partial<Options>
  showAfter: number
  showArrow: boolean
  strategy: PositioningStrategy
  trigger: Trigger
  visible: boolean
  stopPopperMouseEvent: boolean
  gpuAcceleration: boolean
  fallbackPlacements: Placement[]
}