import axios from "axios";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API,
});
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  }
  return config;
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      if (typeof window !== "undefined") {
        const role = localStorage.getItem("role");
        toast.error("Akses ditolak. Anda tidak memiliki izin untuk aksi ini.");
        const dest = role === "ADMIN" ? "/admin" : "/";
        window.location.href = dest;
      }
    }
    return Promise.reject(error);
  }
);
// tecopev350@iridales.com
// Admin123
