import userManager from "@/utils/oidcConfig";

export const login = async () => {
  try {
    const targetUrl = window.location.href;
    console.log("Setting state with redirectUrl:", targetUrl);

    userManager.signinRedirect({
      state: { redirectUrl: targetUrl }
    });
    const allKeys = await userManager.settings.stateStore.getAllKeys();
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
