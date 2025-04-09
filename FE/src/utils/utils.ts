import { Booking, User, Payment, Rating } from "../types/booking";

export const calculateTotalUsers = (users: any[]): number => {
  if (!Array.isArray(users)) {
    console.error("Users is not an array:", users);
    return 0;
  }
  const filteredUsers = users.filter((user) => user.role === "user");
  return filteredUsers.length;
};

export const calculateTotalBookings = (carts: Booking[]): number => {
  if (!Array.isArray(carts)) {
    console.error("Carts is not an array:", carts);
    return 0;
  }
  return carts.filter((cart) => cart.BookingID).length;
};

export const calculateTotalSuccessfulPayments = (payments: any[]): number => {
  if (!Array.isArray(payments)) {
    console.error("Payments is not an array:", payments);
    return 0;
  }
  return payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
};

export const calculateOverallAverageRating = (ratings: Rating[]): number => {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    console.error("Ratings is invalid or empty:", ratings);
    return 0;
  }
  const total = ratings.reduce((sum, rating) => sum + (rating.serviceRating || 0), 0);
  return Number((total / ratings.length).toFixed(1));
};

export const calculateTotalBookingsByStatus = (carts: Booking[], statuses: string[]): number => {
  if (!Array.isArray(carts)) {
    console.error("Carts is not an array:", carts);
    return 0;
  }
  return carts.filter((cart) => 
    cart.BookingID && statuses.includes(cart.status)
  ).length;
};