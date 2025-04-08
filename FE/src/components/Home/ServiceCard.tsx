import React from "react";
import { motion } from "framer-motion";
import { Service } from "../../types/booking";
import logo7 from "../../assets/logo7.png";
import { serviceCardVariants, buttonVariants } from "../../styles/variants";

interface ServiceCardProps {
  service: Service;
  index: number;
  handleBookNow: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, handleBookNow }) => {
  return (
    <motion.div
      key={`${service._id}-${index}`}
      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2"
      variants={serviceCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <div
        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col h-full`}
      >
        <div className="relative">
          {service.discountedPrice != null && (
            <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
              <motion.div
                className="bg-red-500 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center shadow-lg"
                animate={{
                  rotate: [0, 12, 0, -12, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: "easeInOut",
                }}
              >
                <span className="text-lg">
                  {Math.round(
                    (((service.price as number) - service.discountedPrice!) /
                      (service.price as number)) *
                      100
                  )}
                  %
                </span>
                <span className="text-xs block -mt-1">OFF</span>
              </motion.div>
            </div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }}>
            <img
              src={service.image || logo7}
              alt={service.name}
              className="w-full h-80 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = logo7;
              }}
            />
          </motion.div>
          {service.discountedPrice != null && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/80 to-transparent text-white py-2 px-4">
              <span className="font-semibold">Special Offer</span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
            {service.name}
          </h3>
          <p className="text-gray-600 mb-3 flex-grow line-clamp-2 text-sm">{service.description}</p>
          <div className="mt-auto space-y-3">
            <div className="flex flex-col">
              {service.discountedPrice != null ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through text-sm">
                      {(service.price as number).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {service.discountedPrice.toLocaleString("vi-VN")} VNĐ
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-yellow-500">
                  {(service.price as number).toLocaleString("vi-VN")} VNĐ
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-gray-500 text-xs flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {service.duration ? `${service.duration} min` : "TBD"}
              </div>
              <motion.button
                onClick={() => handleBookNow(service._id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition duration-300 ${
                  service.discountedPrice != null
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Book Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
// ServiceCard.tsx
// Chức năng: Hiển thị một thẻ dịch vụ (service card) trong danh sách dịch vụ.
// Vai trò:
// Hiển thị thông tin của một dịch vụ, bao gồm:
// Hình ảnh (service.image, nếu không có thì dùng logo7.png).
// Tên dịch vụ (service.name).
// Mô tả ngắn (service.description).
// Giá (service.price) và giá giảm (service.discountedPrice nếu có).
// Thời gian thực hiện (service.duration).
// Hiển thị nhãn giảm giá (nếu có discountedPrice) với hiệu ứng động.
// Cung cấp nút "Book Now" để đặt dịch vụ.
// Thêm animation cho thẻ và hình ảnh khi hover bằng framer-motion.