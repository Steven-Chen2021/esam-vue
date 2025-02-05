import { onMounted } from "vue";
import { useRouter } from "vue-router";
import userManager from "@/utils/oidcConfig";
import type { UserResult } from "@/api/user";
import { setToken } from "@/utils/auth";

export default {
  setup() {
    const router = useRouter();
    const parseHashParams = (): Record<string, string> => {
      const hash = window.location.hash;
      console.log("Raw hash:", hash);
      const queryIndex = hash.indexOf("?");
      if (queryIndex === -1) {
        console.error("No query found in hash:", hash);
        return {};
      }
      const queryString = hash.substring(queryIndex + 1);
      const hashParams = new URLSearchParams(queryString);
      const result: Record<string, string> = {};
      hashParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    };
    const convertHashToQuery = (): boolean => {
      const hashParams = parseHashParams();

      if (!hashParams["code"] || !hashParams["state"]) {
        console.error("No code or state in hash params:", hashParams);
        return false;
      }
      const newUrl = `${window.location.origin}/callback?code=${hashParams["code"]}&state=${hashParams["state"]}&session_state=${hashParams["session_state"]}`;
      // const newUrl = `${window.location.origin}/#/callback?code=${hashParams["code"]}&state=${hashParams["state"]}&session_state=${hashParams["session_state"]}`;
      window.history.replaceState({}, "", newUrl);
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
        console.log("handleCallback User Information", user.state);
        let redirectUrl = `${window.location.origin}/#/welcome`;

        if (
          user.state &&
          typeof user.state === "object" &&
          "redirectUrl" in user.state
        ) {
          redirectUrl = (user.state as { redirectUrl: string }).redirectUrl;
        }
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
        console.log(redirectUrl);
        window.location.href = redirectUrl;
      } catch (error) {
        console.error("Callback handling failed:", error);
        router.push("/error");
      }
    };
    onMounted(() => {
      handleCallback();
      console.log("Call Back Mount");
    });

    return {};
  }
};
