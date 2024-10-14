import { onMounted } from "vue";
import { useRouter } from "vue-router";
import userManager from "@/utils/oidcConfig";
import { setToken, type DataInfo } from "@/utils/auth";

export default {
  setup() {
    const router = useRouter();

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
      console.log("Extracted query string:", queryString); // 調試輸出查詢字符串

      const hashParams = new URLSearchParams(queryString);
      const result: Record<string, string> = {};

      // 迭代查詢參數
      hashParams.forEach((value, key) => {
        result[key] = value;
      });

      console.log("Parsed hash params:", result); // 調試輸出解析結果
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

    // 處理 OIDC 回調
    const handleCallback = async () => {
      console.log("Callback mounted");
      try {
        const converted = convertHashToQuery();
        if (!converted) {
          throw new Error("Failed to convert hash to query");
        }

        // 調試輸出當前 URL 中的 state 和 session_state
        console.log(
          "State in URL:",
          new URLSearchParams(window.location.search).get("state")
        );
        console.log(
          "Session state in URL:",
          new URLSearchParams(window.location.search).get("session_state")
        );

        // 處理 OIDC 回調，這將自動檢查 state 和 session_state
        const user = await userManager.signinRedirectCallback();
        console.log("User after signinRedirectCallback:", user);

        // 將 expires 轉換成 Date 對象
        const tokenData: DataInfo<Date> = {
          accessToken: user.access_token,
          expires: new Date(user.expires_at * 1000), // 將 UNIX 時間戳轉換成 Date (秒 -> 毫秒)
          refreshToken: user.refresh_token || "", // 如果沒有 refresh_token，則給空字符串
          avatar: user.profile?.picture || "", // 假設頭像存在於 profile 中
          username: user.profile?.name || "", // 從 profile 中提取使用者名稱
          nickname: user.profile?.nickname || "", // 假設有 nickname
          roles: [] // 假設 roles 是 array，如果沒有則為空
        };

        // 儲存轉換後的 Token 資訊
        setToken(tokenData);

        // 導向到首頁
        router.push("/welcome");
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
