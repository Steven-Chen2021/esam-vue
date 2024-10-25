import {
  UserManager,
  type UserManagerSettings,
  WebStorageStateStore
} from "oidc-client-ts";

const oidcSettings: UserManagerSettings = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_LOGOUT_URI,
  response_type: "code",
  scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI
};

const userManager = new UserManager(oidcSettings);

export default userManager;
