// src/types/booking.ts
export interface Therapist {
  id: string;
  name: string;
  image?: string;
  Description?: string;
}

export interface Booking {
  CartID?: string;
  service_id: number; // Required property to match EnhancedBookingPage
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  selectedTherapist?: Therapist | null;
  Skincare_staff?: string;
  totalPrice?: number;
  status: "pending" | "checked-in" | "completed" | "cancel"; // Use "cancel" for consistency
  action?: "checkin" | "checkout" | null;
}