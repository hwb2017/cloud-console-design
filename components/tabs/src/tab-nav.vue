<script lang="ts">
import { h, defineComponent, inject, ref, computed, onMounted, nextTick, onBeforeUnmount, onUpdated } from "vue"
import { string, oneOf, bool, array, func } from "vue-types"
import { Panel, RootTabs, Scrollable } from "./type"
import { noop, checkNoUndefined } from "../../../utils/helper"

const tabNavProps = {
  activeTabId: string().isRequired,
  variant: oneOf(["line", "card"] as const).def("line"),
  editable: bool().def(false),
  panels: array<Panel>().def([] as Panel[]),
  atTabClick: func<(panel: Panel, tabId: string, event: Event) => void>().def(noop),
  atTabRemove: func<(panel: Panel, event: Event) => void>().def(noop)
}

export default defineComponent({
  name: "CTabNav",
  props: tabNavProps,
  setup() {
    const rootTabs = inject<RootTabs>("rootTabs")
    if (!checkNoUndefined<RootTabs>(rootTabs)) {
      throw new Error(`[CTabNav] CTabNav must be nested inside CTabs`)
    }

    const scrollable = ref<boolean | Scrollable>(false)
    const navOffset = ref(0)
    const isFocus = ref(false)
    const focusable = ref(true)

    const navScroll$ = ref<HTMLElement | null>(null)
    const nav$ = ref<HTMLElement | null>(null)
    const navWrap$ = ref<HTMLElement | null>(null)
    
    const sizeName = computed(() => {
      return ["top", "bottom"].includes(rootTabs.tabPosition.value) ? "Width" : "Height"
    })
    const navStyle = computed(() => {
      const direction = sizeName.value === "Width" ? "X" : "Y"
      return {
        transform: `translate${direction}(-${navOffset.value}px)`
      }
    })
 
    const scrollToActiveTab = () => {
      if (!scrollable.value || !nav$.value || !navWrap$.value || !navScroll$.value) return
      const nav = nav$.value
      const activeTab = navWrap$.value?.querySelector(".is-active")
      if (!activeTab) return
      const navScroll = navScroll$.value
      const isHorizontal = ["top", "bottom"].includes(rootTabs.tabPosition.value)
      const activeTabBounding = activeTab.getBoundingClientRect()
      const navScrollBounding = navScroll.getBoundingClientRect()
      const maxOffset = 
        isHorizontal
        ? nav.offsetWidth - navScrollBounding.width
        : nav.offsetHeight - navScrollBounding.height
      const currentOffset = navOffset.value
      let newOffset = currentOffset

      if (isHorizontal) {
        if (activeTabBounding.left < navScrollBounding.left) {
          newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left)
        }
        if (activeTabBounding.right > navScrollBounding.right) {
          newOffset = currentOffset + (activeTabBounding.right - navScrollBounding.right)
        }
      } else {
        if (activeTabBounding.top < navScrollBounding.top) {
          newOffset = currentOffset - (navScrollBounding.top - activeTabBounding.top)
        }
        if (activeTabBounding.bottom > navScrollBounding.bottom) {
          newOffset = currentOffset + (activeTabBounding.bottom - navScrollBounding.bottom)
        }
      }
      newOffset = Math.max(newOffset, 0)
      navOffset.value = Math.min(newOffset, maxOffset)
    }
    const updateNavOffset = () => {
      if (!nav$.value || !navScroll$.value) return
      const navSize = nav$.value[`offset${sizeName.value}`]
      const containerSize = navScroll$.value[`offset${sizeName.value}`]
      const currentOffset = navOffset.value

      if (containerSize < navSize) {
        const currentOffset = navOffset.value
        scrollable.value = (scrollable.value || {}) as Scrollable
        scrollable.value.prev = currentOffset
        scrollable.value.next = currentOffset + containerSize < navSize
        if (navSize - currentOffset < containerSize) {
          navOffset.value = navSize - containerSize
        }
      } else {
        scrollable.value = false
        if (currentOffset > 0) {
          navOffset.value = 0
        }
      }
    }
    const setFocus = () => {
      if (focusable.value) {
        isFocus.value = true
      } 
    }
    const removeFocus = () => {
      isFocus.value = false
    }
    const visibilityChangeHandler = () => {
      const visibility = document.visibilityState
      if (visibility === "hidden") {
        focusable.value = false
      } else if (visibility === "visible") {
        setTimeout(() => {
          focusable.value = true
        }, 50)
      }
    }
    const windowBlurHandler = () => {
      focusable.value = false
    }
    const windowFocusHandler = () => {
      setTimeout(() => {
        focusable.value = true
      }, 50)
    }

    onUpdated(() => {
      updateNavOffset()
    })
    onMounted(() => {
      document.addEventListener("visibilitychange", visibilityChangeHandler)
      window.addEventListener("focus", windowFocusHandler)
      window.addEventListener("blur", windowBlurHandler)
      nextTick(() => scrollToActiveTab())
    })
    onBeforeUnmount(() => {
      document.removeEventListener("visibilitychange", visibilityChangeHandler)
      window.removeEventListener("focus", windowFocusHandler)
      window.removeEventListener("blur", windowBlurHandler)      
    })

    return {
      rootTabs,
      isFocus,
      setFocus,
      removeFocus,
      scrollable,
      navStyle,
      scrollToActiveTab,
    }
  },
  render() {
    const {
      panels,
      atTabRemove,
      atTabClick,
      rootTabs,
      isFocus,
      setFocus,
      removeFocus,
      scrollable,
      navStyle,
    } = this

    const tabs = panels.map((panel) => {
      let tabId = panel.props.tabId
      const editable = panel.props.editable
      const btnClose = 
        editable
        ? h(
            "span",
            {
              class: "ccd-icon-cross",
              onClick: event => {
                atTabRemove(panel, event)
              },
            }
          )
        : null
      const tabTitle = panel.instance.slots.title?.() || panel.props.title
      return h(
        "div",
        {
          class: {
            "ccd-tabs__item": true,
            [`is-${rootTabs.tabPosition.value}`]: true,
            "is-active": panel.active,
            "is-disabled": panel.props.disabled,
            "is-editable": editable,
            "is-focus": isFocus,
          },
          id: `tab-${tabId}`,
          key: `tab-${tabId}`,
          role: "tab",
          onFocus: () => {
            setFocus()
          },
          onBlur: () => {
            removeFocus()
          },
          onClick: event => {
            removeFocus()
            atTabClick(panel, tabId, event)
          },
        },
        [tabTitle, btnClose],
      )
    })
    return h(
      "div",
      {
        ref: "navWrap$",
        class: [
          "ccd-tab__nav-wrap",
          scrollable ? "is-scrollable" : "",
          `is-${rootTabs.tabPosition.value}`,
        ],
      },
      [
        h(
          "div",
          {
            class: "ccd-tabs__nav-scroll",
            ref: "navScroll$",
          },
          [
            h(
              "div",
              {
                class: [
                  "ccd-tabs__nav",
                  `is-${rootTabs.tabPosition.value}`,
                ],
                ref: "nav$",
                style: navStyle,
              },
              [tabs]
            )
          ]
        ) 
      ]
    )
  }  
})
</script>
