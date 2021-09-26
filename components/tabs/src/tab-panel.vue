<template>
  <div
    v-if="shouldRender"
    v-show="active"
    :id="`panel-${tabId}`"
    class="ccd-tab-panel"
  >
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, getCurrentInstance, inject } from "vue"
import { bool, string } from "vue-types"
import { RootTabs, UpdatePanelStateCallback } from "./type"
import { checkNoUndefined } from "../../../utils/helper"

const tabPanelProps = {
  title: string().def(""),
  tabId: string().isRequired,
  editable: bool().def(false),
  disabled: bool().def(false),
  lazy: bool().def(false),
}

export default defineComponent({
  name: "CTabPanel",
  props: tabPanelProps,
  setup(props) {
    const rootTabs = inject<RootTabs>("rootTabs")
    const updatePanelState = inject<UpdatePanelStateCallback>("updatePanelState")
    if (!checkNoUndefined<RootTabs>(rootTabs) || !checkNoUndefined<UpdatePanelStateCallback>(updatePanelState)) {
      throw new Error(`[CTabPanel] CTabPanel must nested in CTabs`)
    }
    
    const active = computed(() => {
      return rootTabs.activeTabId.value === props.tabId
    })
    const shouldRender = computed(() => {
      return !props.lazy || active.value
    })
    const instance = getCurrentInstance()!
    updatePanelState({
      uid: instance.uid,
      instance,
      props,
      active,
    })

    return {
      active,
      shouldRender,
    }
  },
})
</script>
