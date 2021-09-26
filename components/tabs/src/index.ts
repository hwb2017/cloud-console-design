import { h, ref, defineComponent, getCurrentInstance, provide, watch, nextTick, onUpdated, Fragment, onMounted, Ref, toRef } from "vue"
import { string, bool, oneOf } from "vue-types"
import TabNav from "./tab-nav.vue"
import type { VNode, ComponentInternalInstance, Component } from "vue"
import type { RootTabs, UpdatePanelStateCallback, Panel } from "./type"

const tabsProps = {
  activeTabId: string().isRequired,
  variant: oneOf(["line", "card"] as const).def("card"),
  tabPosition: oneOf(["top", "left", "bottom", "right"] as const).def("top"),
  editable: bool().def(false),
};

export default defineComponent({
  name: "CTabs",
  components: {
    TabNav
  },
  props: tabsProps,
  emits: [
    "tab-click",
    "edit",
    "update:activeTabId",
  ],
  setup(props, ctx) {
    const header$ = ref<typeof TabNav | null>(null)
    // 维护上一次渲染后的panel组件列表，再每次onUpdate中调用setPanelInstances时
    // 与新的panel列表对比，来判断是否要更新 pannel 列表，避免多次渲染
    const panels = ref([]) as Ref<Panel[]>
    const instance = getCurrentInstance()
    // 维护panel组件UID与组件状态(props,别名,isEditable等)之间的映射
    const panelStateMap = {}
    
    provide<RootTabs>("rootTabs", {
      tabPosition: toRef(props, "tabPosition"),
      editable: toRef(props, "editable"),
      activeTabId: toRef(props, "activeTabId"),
    })
    provide<UpdatePanelStateCallback>("updatePanelState", (panel: Panel) => {
      panelStateMap[panel.uid] = panel;
    })

    watch(
      () => props.activeTabId,
      () => {
        header$.value && header$.value.scrollToActiveTab()
        nextTick(() => setPanelInstances(true))
      }
    )

    const getPanelInstanceFromSlot = (
      contentVnode: VNode,
      panelInstanceList: ComponentInternalInstance[] = []
    ) => {
      Array.from((contentVnode.children || []) as ArrayLike<VNode>).forEach(node => {
        let type = node.type
        type = (type as Component).name || type
        if (type === "CTabPanel" && node.component) {
          panelInstanceList.push(node.component)
        } else if (type === Fragment || type === "template") {
          getPanelInstanceFromSlot(node, panelInstanceList)
        }
      })
      return panelInstanceList
    }

    const setPanelInstances = (isForceUpdate = false) => {
      if (ctx.slots.default) {
        const children = instance?.subTree.children
        const content = Array.from(children as ArrayLike<VNode>).find(
          ({ props }) => {
            return props?.class === "ccd-tabs__content"
          },
        )
        if (!content) return

        const panelInstanceList: Panel[] = getPanelInstanceFromSlot(content).map(
          panelComponent => {
            return panelStateMap[panelComponent.uid]
          }
        )
        const panelsChanged = !(
          panelInstanceList.length === panels.value.length &&
          panelInstanceList.every(
            (panel, index) => panel.uid === panels.value[index].uid
          )
        )
        if (isForceUpdate || panelsChanged) {
          panels.value = panelInstanceList
        }
      } else if (panels.value.length !== 0) {
        panels.value = []
      }
    }

    const handleTabClick = (panel: Panel, tabId: string, event: Event) => {
      if (panel.props.disabled) return
      ctx.emit("update:activeTabId", tabId)
      ctx.emit("tab-click", panel, event)
    }
    const handleTabRemove = (panel: Panel, event: Event) => {
      if (panel.props.disabled) return
      event.stopPropagation()
      ctx.emit("edit", panel.props.tabId, "remove")
    }
    const handleTabAdd = () => {
      ctx.emit("edit", null, "add")
    };

    onUpdated(() => {
      setPanelInstances()
    })

    onMounted(() => {
      setPanelInstances()
    })

    return {
      header$,
      handleTabClick,
      handleTabAdd,
      handleTabRemove,
      panels,
    };
  },

  render() {
    const {
      variant,
      handleTabClick,
      handleTabRemove,
      handleTabAdd,
      activeTabId,
      panels,
      editable,
      tabPosition,
    } = this

    const addButton = 
      editable 
      ? h(
        "span",
        {
          class: "ccd-tabs__add-tab",
          onClick: handleTabAdd,
        },
        [h("i", { class: "ccd-icon-plus"})]
      )
      : null

    const header = h(
      "div",
      {
        class: ["ccd-tabs__header", `is-${tabPosition}`]
      },
      [
        addButton,
        h(
          TabNav,
          {
            activeTabId,
            editable,
            variant,
            panels,
            ref: "header$",
            atTabClick: handleTabClick,
            atTabRemove: handleTabRemove,
          }
        ),
      ],
    )

    const panelsContent = h(
      "div",
      {
        class: "ccd-tabs__content",
      },
      this.$slots?.default!(),
    )

    return h(
      "div",
      {
        class: {
          "ccd-tabs": true,
          "ccd-tabs--card": variant === "card",
          "ccd-tabs--line": variant === "line",
          [`ccd-tabs--${tabPosition}`]: true,
        },
      },
      tabPosition !== "bottom" ? [header, panelsContent] : [panelsContent, header]
    )
  }
});