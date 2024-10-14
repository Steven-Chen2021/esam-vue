<template>
  <!--Empty UI-->
  <input type="hidden" />
</template>

<script lang="ts">
import { onMounted } from "vue";
import { defineComponent } from "vue";
import userManager from "@/utils/oidcConfig"; // 引入 OIDC 的 userManager

export default defineComponent({
  setup() {
    // 使用 onMounted 來處理 silent renew 回調
    onMounted(() => {
      // OIDC 客戶端的 silent renew 回調函數
      userManager
        .signinSilentCallback()
        .then(() => {
          console.log("Silent renew completed successfully");
        })
        .catch(error => {
          console.error("Silent renew failed:", error);
        });
    });

    return {};
  }
});
</script>
