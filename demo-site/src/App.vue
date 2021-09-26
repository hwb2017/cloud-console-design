<template>
  <div id="nav">
    <c-button iconName="ccd-icon-codepen" :loading="true">test</c-button>
    <c-tabs v-model:activeTabId="currentTabId" @tab-click="handleClick">
      <c-tab-panel title="用户管理" tabId="first">用户管理</c-tab-panel>
      <c-tab-panel title="配置管理" tabId="second">配置管理</c-tab-panel>
    </c-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"

export default defineComponent({
  setup() {
    const currentTabId = ref("second")
    const handleClick = (tab: any, event: Event) => {
      console.log(tab, event)
    }
    return {
      currentTabId,
      handleClick
    }
  },
})
</script>

<style lang="scss">
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
