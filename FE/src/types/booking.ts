// Type cho Service (aligned with ServiceSchema)
export type Service = {
  _id: string;
  service_id: number;
  name: string;
  description?: string;
  image?: string;
  duration: number;
  price: number;
  discountedPrice?: number | null;
  currency?: string; // Added from ServiceSchema
  category?: {
    _id: string;
    name: string;
    description?: string;
  };
  vouchers?: string[]; // Array of Voucher IDs
  createDate?: string; // Date as string (ISO format)
  updateDate?: string; // Date as string (ISO format)
};

// Type cho Therapist (unchanged, as no schema provided)
export type Therapist = {
  id: string;
  name: string;
  image?: string;
  Description?: string;
};

// Type cho Booking (aligned with bookingSchema)
export type Booking = {
  BookingID: string; // Matches BookingID in schema
  BookingCode: string; // Matches BookingCode in schema
  username: string; // Required in schema
  customerName: string; // Required in schema
  customerEmail: string; // Required in schema
  customerPhone: string; // Required in schema
  notes?: string; // Optional in schema
  service_id: string; // Matches schema (Number, not string)
  serviceName: string; // Required in schema
  serviceType?: string; // Optional in schema (populated from Service.category.name)
  bookingDate: string; // Required in schema
  startTime: string; // Required in schema
  endTime?: string; // Optional in schema
  duration?: number; // Optional in schema
  originalPrice?: number; // Optional in schema
  totalPrice: number; // Required in schema
  discountedPrice?: number; // Optional in schema
  currency?: string; // Default "VND" in schema
  discountCode?: string; // Optional in schema
  Skincare_staff?: string; // Optional in schema
  status: 
    | "pending"
    | "checked-in"
    | "completed"
    | "checked-out"
    | "cancel"
    | "reviewed"; // Matches enum in schema
  description?: string; // Optional in schema
  paymentID?: string; // Thêm trường paymentID
};

// Type cho Blog (unchanged, as no schema provided)
export type Blog = {
  _id: string;
  title: string;
  createName: string;
  description: string;
  image?: string;
  content?: string;
  createdAt: number;
};

// Type cho Rating (unchanged, as no schema provided)
export type Rating = {
  _id: string;
  bookingID: string;
  service_id: string;
  serviceName: string;
  serviceRating: number;
  serviceContent: string;
  images?: string[];
  createAt: string | Date;
  createName: string;
  status?: "reviewed";
};

// Type cho User (unchanged, as no schema provided)
export interface User {
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  phone: string;
  gender?: string;
  address?: string;
  description?: string;
  role: string;
}

// Type cho Payment (unchanged, as no schema provided)
export interface Payment {
  _id: string;
  paymentID: string;
  status: "pending" | "success" | "failed" | "cancelled";
  amount: number;
  paymentName?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  updatedAt?: string;
  orderCode?: number; // Thêm orderCode
  checkoutUrl?: string; // Thêm checkoutUrl
  qrCode?: string; // Thêm qrCode
}

// Type cho Quizz (unchanged, as no schema provided)
export type Quizz = {
  _id: string;
  text: string;
  options: { text: string; points?: { [key: string]: number } }[];
  createdAt?: string;
}

// Type cho Quizz Result (unchanged, as no schema provided)
export type QuizzResult = {
  message: string;
  scores: { [key: string]: number };
  bestMatch: string;
};