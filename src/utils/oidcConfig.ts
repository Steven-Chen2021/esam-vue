import {
  UserManager,
  type UserManagerSettings,
  WebStorageStateStore
} from "oidc-client-ts";

// const oidcSettings: UserManagerSettings = {
//   authority: "https://sso.dimerco.com:9443",
//   client_id: "esam3.0",
//   redirect_uri: "https://10.161.254.129/#/callback",
//   post_logout_redirect_uri: "https://10.161.254.129/#/",
//   response_type: "code",
//   scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
//   userStore: new WebStorageStateStore({ store: window.localStorage }),
//   stateStore: new WebStorageStateStore({ store: window.localStorage }),
//   automaticSilentRenew: true,
//   silent_redirect_uri: "https://10.161.254.129/#/silent-renew"
// };
const oidcSettings: UserManagerSettings = {
  authority: "https://ssotest.dimerco.com:8399",
  client_id: "esam3.0",
  redirect_uri: "https://10.161.252.171:5509/#/callback",
  post_logout_redirect_uri: "https://10.161.252.171:5509/#/",
  response_type: "code",
  scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: "https://10.161.252.171:5509/#/silent-renew"
};
// const oidcSettings: UserManagerSettings = {
//   authority: import.meta.env.VITE_OIDC_AUTHORITY,
//   client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
//   redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
//   post_logout_redirect_uri: import.meta.env.VITE_OIDC_LOGOUT_URI,
//   response_type: "code",
//   scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
//   userStore: new WebStorageStateStore({ store: window.localStorage }),
//   stateStore: new WebStorageStateStore({ store: window.localStorage }),
//   automaticSilentRenew: true,
//   silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI
// };
const userManager = new UserManager(oidcSettings);

export default userManager;
