import { Booking, User, Payment, Rating } from "../types/booking";

export const calculateTotalUsers = (users: any[]) => {
  const filteredUsers = users.filter((user) => user.role === "user");
  return filteredUsers.length;
};

export const calculateTotalBookings = (carts: Booking[]): number => {
  return carts.filter((cart) => cart.BookingID).length;
};

export const calculateTotalSuccessfulPayments = (payments: any[]) => {
  return payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
};

export const calculateOverallAverageRating = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating.serviceRating, 0);
  return Number((total / ratings.length).toFixed(1));
};

export const calculateTotalBookingsByStatus = (carts: Booking[], statuses: string[]): number => {
  return carts.filter((cart) => 
    cart.BookingID && statuses.includes(cart.status)
  ).length;
};