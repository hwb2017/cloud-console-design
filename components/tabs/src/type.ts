import { ComponentInternalInstance, ComputedRef, Ref } from "vue";

export interface PanelProps {
  title: string
  tabId: string
  editable: boolean
  disabled: boolean
  lazy: boolean
}

export interface Panel {
  uid: number
  instance: ComponentInternalInstance
  props: PanelProps
  active: ComputedRef<boolean>
}

export interface RootTabs {
  editable: Ref<boolean>
  tabPosition: Ref<"top" | "left" | "bottom" | "right">
  activeTabId: Ref<string>
}

export type UpdatePanelStateCallback = (pane: Panel) => void

export interface Scrollable {
  next?: boolean
  prev?: number
}