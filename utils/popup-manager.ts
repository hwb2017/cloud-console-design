/* eslint-disable prefer-const */
import type { Ref } from "vue"

interface Instance {
  closeOnClickModal: Ref<boolean>
  closeOnPressEscape: Ref<boolean>
  close: () => void
  handleClose?: () => void
  handleAction?: (action: string) => void
}

type StackFrame = { id: string, zIndex: number, modalClass: string }

interface IPopupManager {
  getInstance: (id: string) => Instance | null
  zIndex: number
  modalDom?: HTMLElement
  modalFade: boolean
  modalStack: StackFrame[]
  nextZindex: () => number
  register: (id: string, instance: Instance) => void
  deregister: (id: string) => void
  doOnModalClick?: () => void
  openModal?: (
    id: string,
    zIndex: number,
    dom: HTMLElement,
    modalClass: string,
    modalFade: boolean
  ) => void
  closeModal?: (id: string) => void
}

const instances: { [key: string]: Instance | null } = {}
// 弹出框的zIndex从2000开始计数

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
let zIndex: number = 2000

const PopupManager: IPopupManager = {
  getInstance(id) {
    return instances[id]
  },
  zIndex,
  modalDom: undefined,
  modalFade: true,
  modalStack: [],
  nextZindex() {
    return ++PopupManager.zIndex
  },
  register(id, instance) {
    if (id && instance) {
      instances[id] = instance
    }
  },
  deregister(id) {
    if (id) {
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/delete
      instances[id] = null
      delete instances[id]
    }
  },
}

export default PopupManager