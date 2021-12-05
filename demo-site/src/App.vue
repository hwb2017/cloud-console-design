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
    <c-input-textarea v-model="input" placeholder="Please Input" />
    <c-input-number :defaultValue="defaultNumber" :max="110" :min="1" />
    <c-popover
      v-model:visible="dropdownMenuVisible"
      placement="bottom"
      content="this is content, this is content, this is content"
      trigger="click"
    >
      <template #trigger>
        <c-button>Hover to active</c-button>
      </template>
    </c-popover>
    <div>
      <c-tag
        v-for="tag in tags"
        :key="tag"
        closable
        theme="plain"
        @close="handleClose(tag)"
      >
        {{ tag }}
      </c-tag>
      <c-input
        v-if="inputVisible"
        ref="saveTagInput$"
        v-model="inputValue"
        class="input-new-tag"
        @keydown.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      ></c-input>
      <c-button v-else class="button-new-tag" @click="showInput"
        >+ New Tag</c-button
      >
    </div>
    <c-scrollbar height="400px" style="margin-top: 20px" @scroll="handleScroll">
      <p v-for="item in 20" :key="item" class="scrollbar-demo-item">
        {{ item }}
      </p>
    </c-scrollbar>
    <div class="select-demo">
      <c-select
        v-model="selectedValue"
        :options="options"
        @change="handleSelectChange"
        clearable
        filterable
        default-first-option
        allow-create
      >
      </c-select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref } from "vue";
import type { ComponentPublicInstance } from "vue";

export default defineComponent({
  setup() {
    const currentTabId = ref("second");
    const handleClick = (tab: any, event: Event) => {
      console.log(tab, event);
    };
    const input = ref("");
    const defaultNumber = ref(3);
    const dropdownMenuVisible = ref(false);
    const tags = ref(["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"]);
    const inputVisible = ref(false);
    const inputValue = ref("");
    const saveTagInput$ = ref<ComponentPublicInstance | null>(null);
    const handleClose = (tag: string) => {
      tags.value.splice(tags.value.indexOf(tag), 1);
    };
    const showInput = () => {
      inputVisible.value = true;
      nextTick(() => {
        if (saveTagInput$.value) {
          (saveTagInput$.value.$refs as any).input$.focus();
        }
      });
    };
    const handleInputConfirm = () => {
      const value = inputValue.value;
      if (value) {
        tags.value.push(value);
      }
      inputVisible.value = false;
      inputValue.value = "";
    };
    const handleScroll = (e: Event) => {
      console.log("scroll", e);
    };
    const handleSelectChange = () => {
      console.log("change");
    };
    const selectedValue = ref("");
    const options = ref([
      {
        value: "选项1",
        label: "黄金糕",
        disabled: false,
      },
      {
        value: "选项2",
        label: "双皮奶",
        disabled: false,
      },
      {
        value: "选项3",
        label: "蚵仔煎",
        disabled: false,
      },
      {
        value: "选项4",
        label: "龙须面",
        disabled: false,
      },
      {
        value: "选项5",
        label: "北京烤鸭",
        disabled: false,
      },
      {
        value: "选项6",
        label: "黄桃酱",
        disabled: true,
      },
      {
        value: "选项7",
        label: "黄皮麻薯",
        disabled: false,
      },
    ]);
    return {
      saveTagInput$,
      currentTabId,
      handleClick,
      input,
      defaultNumber,
      dropdownMenuVisible,
      tags,
      inputVisible,
      inputValue,
      showInput,
      handleClose,
      handleInputConfirm,
      handleScroll,
      selectedValue,
      options,
      handleSelectChange,
    };
  },
});
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
  .ccd-tag + .ccd-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
  }
  .input-new-tag {
    width: 90px;
    height: 30px;
    margin-left: 10px;
    vertical-align: middle;
    .ccd-input__inner {
      height: 30px;
      vertical-align: top;
    }
  }
  .scrollbar-demo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 10px;
    text-align: center;
    border-radius: 4px;
    border: 1px solid var(--ccd-color-primary);
    background: var(--ccd-color-white);
    color: var(--ccd-color-primary);
  }
  .select-demo {
    margin-top: 20px;
    width: 200px;
    height: 300px;
  }
}
</style>
