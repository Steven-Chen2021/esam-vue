import userManager from "@/utils/oidcConfig";

export const login = async () => {
  try {
    // 執行登入並生成 state
    // await userManager.signinRedirect();
    const targetUrl = window.location.href;
    console.log("Setting state with redirectUrl:", targetUrl);

    userManager.signinRedirect({
      state: { redirectUrl: targetUrl }
    });

    // 調試：檢查登入後的 stateStore
    const allKeys = await userManager.settings.stateStore.getAllKeys();

    // 如果有 keys，檢查具體存儲的 state
    if (allKeys.length > 0) {
      const storedState = await userManager.settings.stateStore.get(allKeys[0]);
      console.debug(storedState);
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const logout = async () => {
  try {
    await userManager.signoutRedirect();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const getUser = async () => {
  try {
    const user = await userManager.getUser();
    return user;
  } catch (error) {
    console.error("Get user failed:", error);
  }
};
