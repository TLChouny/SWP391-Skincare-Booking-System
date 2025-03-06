export const API_PATHS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // User
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/update",
  },

  // Products
  PRODUCTS: {
    GET_ALL: "/products",
    GET_BY_ID: "/products/:id",
    SEARCH: "/products/search",
    CREATE: "/admin/products",
    UPDATE: "/admin/products/:id",
    DELETE: "/admin/products/:id",
  },

  // Services
  SERVICES: {
    GET_ALL: "/services",
    GET_BY_ID: "/services/:id",
    SEARCH: "/services/search",
    CREATE: "/admin/services",
    UPDATE: "/admin/services/:id",
    DELETE: "/admin/services/:id",
  },

  // Booking
  BOOKING: {
    CREATE: "/booking/create",
    GET_USER_BOOKINGS: "/booking/user",
    CANCEL: "/booking/:id/cancel",
    GET_ALL: "/admin/bookings",
    GET_BY_ID: "/admin/bookings/:id",
    UPDATE_STATUS: "/admin/bookings/:id/status",
    ASSIGN_STAFF: "/admin/bookings/:id/assign",
  },

  // Cart
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/add",
    REMOVE_ITEM: "/cart/remove",
    UPDATE_QUANTITY: "/cart/update",
  },

  // Admin Users
  ADMIN_USERS: {
    GET_ALL: "/admin/users",
    GET_BY_ID: "/admin/users/:id",
    CREATE: "/admin/users",
    UPDATE: "/admin/users/:id",
    DELETE: "/admin/users/:id",
  },

  // Thêm các endpoint mới
  THERAPISTS: "/therapists",
  THERAPIST_SCHEDULE: "/therapist-schedule",
};

export default API_PATHS;