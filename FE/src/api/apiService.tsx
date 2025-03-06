import axios from "axios";
import { Service } from "../types/service";

const API_URL = "http://localhost:5000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm lấy token từ context (cần gọi trong component hoặc tạo hook toàn cục)
let authToken: string | undefined;

export const setApiToken = (token?: string) => {
  authToken = token;
};

// Thêm interceptor để tự động gửi token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getServices = () => api.get("/services");
export const getTherapists = () => api.get("/therapists"); // Sửa endpoint
export const getTherapistSchedule = (id?: string) => api.get(`/therapist-schedule/${id}`); // Sửa endpoint và thêm kiểu dữ liệu rõ ràng
export const createService = (data: Service) => api.post("/services", data);

export default api;