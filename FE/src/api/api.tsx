import axios from "axios";
import { Booking } from "../types/booking";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBookings = () => api.get("/bookings");
export const createBooking = (data: Booking) => api.post("/bookings", data);

export default api;
