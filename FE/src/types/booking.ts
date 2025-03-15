// types/booking.ts
export type Service = {
  _id: string;
  service_id: number;
  name: string;
  description: string;
  image?: string;
  duration?: number;
  price?: number | { $numberDecimal: string };
  discountedPrice?: number | null | undefined; // Thêm dòng này
  category?: {
    _id: string;
    name: string;
    description: string;
  };
  createDate?: string;
}

export type Therapist = {
  id: string;
  name: string;
  image?: string;
  Description?: string; // From HomePage, optional description field
};

export type Booking = {
  BookingID?:string;
  username: string | undefined;
  CartID?: string;
  service_id: number;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  selectedTherapist?: Therapist | null; // From EnhancedBookingPage
  Skincare_staff?: string; // From EnhancedBookingPage, optional therapist name
  originalPrice?: number; // Thêm: Giá gốc
  totalPrice?: number;
  discountedPrice: number | null;
  status: "pending" | "checked-in" | "completed" | "checked-out" | "cancel";
  action?: "checkin" | "checkout" | null; // From EnhancedBookingPage
};

export type Blog = {
  createdAt: number;
  id: number;
  title: string;
  author: string;
  description: string;
  image?: string;
  content?: string;
};

export type Rating = {
  _id: string;
  serviceID: string;
  serviceName: string;
  serviceRating: number;
  serviceContent: string;
  images: string[];
  createAt: Date;
  createName: string;
}