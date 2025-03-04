import axios from "axios";
import { Service } from "../types/service";
// import { Booking } from "../types/booking";
const API_URL = "http://localhost:5000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const getServices = () => api.get("/services");
export const getTherapists = () => api.get("/services");
export const getTherapistSchedule = (id?: any) => api.get("/services");
export const createService = (data: Service) => api.post("/services", data);

export default api;
