// import { ref, onMounted } from "vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import userManager from "@/utils/oidcConfig";
// import { initRouter, getTopMenu } from "@/router/utils";
// import { message } from "@/utils/message";
// import { useI18n } from "vue-i18n";
import type { UserResult } from "@/api/user";
import { setToken } from "@/utils/auth";

export default {
  setup() {
    const router = useRouter();
    // const disabled = ref(false);
    // const { t } = useI18n();

    // 解析 hash 中的查詢參數
    const parseHashParams = (): Record<string, string> => {
      const hash = window.location.hash;
      console.log("Raw hash:", hash); // 調試輸出完整的 hash

      // 確保 hash 中包含查詢參數
      const queryIndex = hash.indexOf("?");
      if (queryIndex === -1) {
        console.error("No query found in hash:", hash);
        return {};
      }
      const queryString = hash.substring(queryIndex + 1); // 提取查詢參數
      const hashParams = new URLSearchParams(queryString);
      const result: Record<string, string> = {};
      hashParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    };

    // 轉換 hash 為 query 並更新 URL
    const convertHashToQuery = (): boolean => {
      const hashParams = parseHashParams();

      if (!hashParams["code"] || !hashParams["state"]) {
        console.error("No code or state in hash params:", hashParams);
        return false;
      }

      // 重建 URL 並使用 `history.replaceState` 更新
      const newUrl = `${window.location.origin}/callback?code=${hashParams["code"]}&state=${hashParams["state"]}&session_state=${hashParams["session_state"]}`;
      console.log("Reconstructed URL:", newUrl); // 調試輸出重建的 URL
      window.history.replaceState({}, "", newUrl); // 更新 URL
      return true;
    };
    const handleCallback = async () => {
      console.log("Callback mounted");
      try {
        const converted = convertHashToQuery();
        if (!converted) {
          throw new Error("Failed to convert hash to query");
        }

        const user = await userManager.signinRedirectCallback();
        //重建Vue-Pure-Admin需要的Token Entity
        const tokenData: UserResult = {
          success: true,
          data: {
            accessToken: user.access_token,
            expires: new Date(user.expires_at * 1000),
            refreshToken: user.refresh_token || "",
            avatar: user.profile?.picture || "",
            username: user.profile?.sub || "",
            nickname: user.profile?.sub || "",
            roles: ["admin"]
          }
        };
        setToken(tokenData.data);
        window.location.href = `${window.location.origin}/#/welcome`;
      } catch (error) {
        console.error("Callback handling failed:", error);
        router.push("/error");
      }
    };

    // 當組件掛載時處理回調
    onMounted(() => {
      handleCallback();
    });

    return {};
  }
};
