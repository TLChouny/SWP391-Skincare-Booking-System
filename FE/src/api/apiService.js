import axios from "axios";
// import { Booking } from "../types/booking";
const api = axios.create({
    baseURL: "https://666c0b8749dbc5d7145c5890.mockapi.io/api",
    headers: {
        "Content-Type": "application/json",
    },
});
export const getServices = () => api.get("/services");
export const getTherapists = () => api.get("/services");
export const getTherapistSchedule = (id) => api.get("/services");
export const createService = (data) => api.post("/services", data);
export default api;
