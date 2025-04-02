import axios from "axios";
import { getToken } from "@/utils/auth";
const API = axios.create({
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60 * 1000 // 1min
});
API.interceptors.request.use(
  config => {
    const data = getToken();
    if (data) {
      config.headers["Authorization"] = "Bearer " + data.accessToken;
    }
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
    if (err.response) {
      if (err.response.status === 401) {
        try {
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(err);
  }
);
export default API;
