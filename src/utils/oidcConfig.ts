import {
  UserManager,
  type UserManagerSettings,
  WebStorageStateStore
} from "oidc-client-ts";

const oidcSettings: UserManagerSettings = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: `${window.location.origin}/#/callback`,
  post_logout_redirect_uri: `${window.location.origin}/#/login`,
  response_type: "code",
  scope: "openid profile api.dc.read api.dc.write dimercoinfo offline_access",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }), // 存儲 state
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/#/silent-renew`
};

const userManager = new UserManager(oidcSettings);

export default userManager;
