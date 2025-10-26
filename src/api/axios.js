import axios from "axios";
import useAuthStore from "@/store/authStore";

// 환경변수에서 ORIGIN만 받음 (끝에 / 제거)
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

// 최종 baseURL은 ORIGIN + /api
const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
