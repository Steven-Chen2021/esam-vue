import {
  UserManager,
  type UserManagerSettings,
  WebStorageStateStore
} from "oidc-client-ts";

const oidcSettings: UserManagerSettings = {
  authority: "https://ssotest.dimerco.com:8399",
  client_id: "esam3.0",
  redirect_uri: "https://10.161.252.171:5501/#/callback",
  post_logout_redirect_uri: "https://10.161.252.171:5501/#/",
  response_type: "code",
  scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: "https://10.161.252.171:5501/#/silent-renew"
};

const userManager = new UserManager(oidcSettings);

export default userManager;
