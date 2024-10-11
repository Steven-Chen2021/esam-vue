<template>
  <div>Authenticating...</div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import userManager from "@/utils/oidcConfig";

const router = useRouter();

onMounted(async () => {
  try {
    await userManager.signinRedirectCallback();
    router.push("/");
  } catch (error) {
    console.error("Error handling callback:", error);
    router.push("/login");
  }
});
</script>
