export enum Role {
    USER = "user",
    ADMIN = "admin",
    SKINCARE_STAFF = "skincare_staff",
    MANAGER = "manager",
    STAFF = "staff",
  }
  
  export enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
  }
  
  export interface User {
    _id: string; // Mongoose ObjectId được chuyển thành string trong JSON
    username: string;
    email: string;
    password?: string; // Tùy chọn vì không phải lúc nào cũng gửi từ front-end
    phone_number?: string;
    gender?: Gender; // Tùy chọn để hỗ trợ giá trị mặc định "other"
    address?: string;
    role: Role;
    avatar: string;
    otp?: string;
    otpExpiration?: string; // Date từ back-end trả về dưới dạng ISO string
    isVerified: boolean;
    createdAt: string; // Date từ back-end trả về dưới dạng ISO string
    updatedAt: string; // Date từ back-end trả về dưới dạng ISO string
  }