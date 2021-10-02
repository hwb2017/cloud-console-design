<template>
  <div id="nav">
    <c-button iconName="ccd-icon-codepen" :loading="true">test</c-button>
    <c-tabs v-model:activeTabId="currentTabId" @tab-click="handleClick">
      <c-tab-panel title="用户管理" tabId="first">用户管理</c-tab-panel>
      <c-tab-panel title="配置管理" tabId="second">配置管理</c-tab-panel>
    </c-tabs>
    <c-input
      v-model="input"
      maxlength="10"
      clearable
      placeholder="Please Input"
    />
    <c-input
      v-model="input"
      clearable
      placeholder="Please Input"
      suffix-icon="ccd-icon-calendar"
    />
    <c-input
      v-model="input"
      clearable
      placeholder="Please Input"
      prefix-icon="ccd-icon-search"
    />
    <c-input v-model="input" clearable placeholder="Please Input">
      <template #prepend>Http://</template>
    </c-input>
    <c-input
      v-model="input"
      clearable
      placeholder="Please Input"
      suffix-icon="ccd-icon-calendar"
    >
      <template #append>.com</template>
    </c-input>
    <c-input-password v-model="input" placeholder="Please Input" />
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
    const input = ref("")
    return {
      currentTabId,
      handleClick,
      input,
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
