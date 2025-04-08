import React from "react";
import { motion } from "framer-motion";
import { Therapist } from "../../types/booking";
import { therapistCardVariants } from "../../styles/variants";

interface TherapistCardProps {
  therapist: Therapist;
  index: number;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, index }) => {
  return (
    <motion.div
      key={therapist.id}
      className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      variants={therapistCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-yellow-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <motion.img
          src={therapist.image}
          alt={therapist.name}
          className="w-full h-60 object-contain transition-transform duration-500"
          whileHover={{ scale: 1.05 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
        <motion.div
          className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-20"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Expert
        </motion.div>
      </div>

      <div className="p-6 text-left flex flex-col flex-grow relative z-10">
        <h4 className="text-2xl font-bold text-gray-800 mb-1">{therapist.name}</h4>
        <p className="text-base text-yellow-600 font-medium mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
            />
          </svg>
          Skincare Specialist
        </p>

        <motion.div
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <h5 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Experience
          </h5>
          <p className="text-sm text-gray-600">{therapist.Description}</p>
        </motion.div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <motion.span
              className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 hover:bg-yellow-200 transition-colors"
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </motion.span>
            <motion.span
              className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
              whileHover={{ scale: 1.2, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                />
              </svg>
            </motion.span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <span>5.0</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TherapistCard;
// TherapistCard.tsx
// Chức năng: Hiển thị một thẻ chuyên gia (therapist card) trong danh sách chuyên gia.
// Vai trò:
// Hiển thị thông tin của một chuyên gia, bao gồm:
// Hình ảnh (therapist.image, nếu không có thì dùng /default-avatar.png).
// Tên chuyên gia (therapist.name).
// Vai trò ("Skincare Specialist").
// Kinh nghiệm (therapist.Description).
// Đánh giá (mặc định 5.0).
// Các biểu tượng liên hệ (email, LinkedIn).
// Thêm nhãn "Expert" ở góc trên bên phải.
// Thêm animation cho thẻ, hình ảnh, và các phần tử khi hover bằng framer-motion.