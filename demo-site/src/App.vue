<template>
  <div id="nav">
    <c-button iconName="ccd-icon-codepen" :loading="true">test</c-button>
    <c-tabs v-model:activeTabId="currentTabId" @tab-click="handleClick">
      <c-tab-panel title="用户管理" tabId="first">用户管理</c-tab-panel>
      <c-tab-panel title="配置管理" tabId="second">配置管理</c-tab-panel>
    </c-tabs>
    <c-input v-model="input1" clearable placeholder="Please Input" />
    <c-input
      v-model="input2"
      clearable
      placeholder="Please Input"
      suffix-icon="ccd-icon-calendar"
    />
    <c-input
      v-model="input3"
      clearable
      placeholder="Please Input"
      prefix-icon="ccd-icon-search"
    />
    <c-input v-model="input4" clearable placeholder="Please Input">
      <template #prepend>Http://</template>
    </c-input>
    <c-input
      v-model="input5"
      clearable
      placeholder="Please Input"
      suffix-icon="ccd-icon-calendar"
    >
      <template #append>.com</template>
    </c-input>
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
    const input1 = ref("")
    const input2 = ref("")
    const input3 = ref("")
    const input4 = ref("")
    const input5 = ref("")
    return {
      currentTabId,
      handleClick,
      input1,
      input2,
      input3,
      input4,
      input5,      
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
