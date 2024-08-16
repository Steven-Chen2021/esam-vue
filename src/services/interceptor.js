import axios from "axios";
// import AuthenticationService from "./AuthenticationService";
/**
 * Axios basic configuration
 */
const API = axios.create({
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60 * 1000 // 1min
});
// API.interceptors.request.use(
//   config => {
//     const isDCAPI = config.url?.indexOf("api/DocumentCloud/Documents") > -1;
//     const token = isDCAPI
//       ? AuthenticationService.dctoken()
//       : AuthenticationService.token();
//     if (token) {
//       config.headers["Authorization"] = "Bearer " + token;
//     }
//     if (config.method === "delete") {
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );
// API.interceptors.response.use(
//   res => {
//     const { data, status } = res;
//     if (status === 200) return data;
//   },
//   async err => {
//     const originalConfig = err.config;
//     if (err.response) {
//       if (err.response.status === 401) {
//         try {
//           AuthenticationService.logout();
//           const origin = window.location.origin;
//           window.location.href = origin + "#" + LOGIN_PATH;
//         } catch (_error) {
//           return Promise.reject(_error);
//         }
//       }
//     }
//     return Promise.reject(err);
//   }
// );
API.interceptors.request.use(
  config => {
    // const isDCAPI = config.url?.indexOf("api/DocumentCloud/Documents") > -1;
    // const token = isDCAPI
    //   ? AuthenticationService.dctoken()
    //   : AuthenticationService.token();
    // if (token) {
    //   config.headers["Authorization"] = "Bearer " + token;
    // }
    if (config.method === "delete") {
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
API.interceptors.response.use(
  res => {
    const { data, status } = res;
    if (status === 200) return data;
  },
  async err => {
    // const originalConfig = err.config;
    if (err.response) {
      if (err.response.status === 401) {
        try {
          // AuthenticationService.logout();
          // const origin = window.location.origin;
          // window.location.href = origin + "#" + LOGIN_PATH;
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(err);
  }
);
export default API;
