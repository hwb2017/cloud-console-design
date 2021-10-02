<template>
  <Input :type="isPasswordVisible ? 'text' : 'password'">
    <template #suffix>
      <i class="ccd-input__icon ccd-input__clear ccd-icon-eye" @click="handlePasswordVisible"></i>
    </template>
  </Input>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import Input from './index.vue'

export default defineComponent({
  name: "CInputPassword",
  components: {
    Input
  },
  setup() {
    const isPasswordVisible = ref(false)
    const handlePasswordVisible = () => {
      isPasswordVisible.value = !isPasswordVisible.value
    }
    return {
      isPasswordVisible,
      handlePasswordVisible
    }
  },
})
</script>