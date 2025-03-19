import axios from "axios";

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:5002/api", // <-- bạn có thể chuyển thành process.env.BASE_URL nếu muốn
  withCredentials: true,
  
});

// Hàm GET chung
const get = (url: string, token: string) => {
  return axiosInstance.get(url, {
    headers: { "x-auth-token": token },
  });
};

// USERS
export const getUsers = (token: string) => get("/users", token);

// CARTS
export const getCarts = (token: string) => get("/cart", token);

// PRODUCTS
export const getProducts = (token: string) => get("/products", token);

// PAYMENTS
export const getPayments = (token: string) => get("/payments", token);

// RATINGS
export const getRatings = (token: string) => get("/ratings", token);

// CATEGORIES
export const getCategories = (token: string) => get("/categories", token);

// VOUCHERS
export const getVouchers = (token: string) => get("/vouchers", token);

// REVIEWS
export const getReviews = (token: string) => get("/reviews", token);

// BLOGS
export const getBlogs = (token: string) => get("/blogs", token);

// QUESTIONS
export const getQuestions = (token: string) => get("/questions", token);

export default {
  getUsers,
  getCarts,
  getProducts,
  getPayments,
  getRatings,
  getCategories,
  getVouchers,
  getReviews,
  getBlogs,
  getQuestions,
};
