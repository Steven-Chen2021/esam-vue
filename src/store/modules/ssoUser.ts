import { defineStore } from "pinia";
import userManager from "@/utils/oidcConfig";

interface UserState {
  token: string | null;
  userInfo: any | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: null,
    userInfo: null
  }),
  actions: {
    async login() {
      try {
        await userManager.signinRedirect();
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
    async logout() {
      try {
        await userManager.signoutRedirect();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
    async fetchUser() {
      try {
        const user = await userManager.getUser();
        if (user && !user.expired) {
          this.token = user.access_token;
          this.userInfo = user.profile;
        } else {
          this.token = null;
          this.userInfo = null;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
  }
});
