<template>
  <div />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import userManager from "@/utils/oidcConfig"; // 導入 userManager 來處理登出後的重定向

onMounted(async () => {
  try {
    // 立即重定向回到 SSO 登入頁面
    await userManager.signinRedirect(); // 重定向用戶回 SSO 登入頁面
  } catch (error) {
    console.error("Error redirecting to login page:", error);
  }
});
</script>
