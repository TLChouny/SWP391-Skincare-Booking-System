import React from "react";
import { motion } from "framer-motion";
import { Therapist } from "../../types/booking";
import TherapistCard from "./TherapistCard";
import SectionHeader from "./SectionHeader";
import LoadingSpinner from "./LoadingSpinner";
import { sectionVariants, buttonVariants } from "../../styles/variants";

interface TherapistsSectionProps {
  therapists: Therapist[];
  loadingTherapists: boolean;
  therapistError: string | null;
  isAuthenticated: boolean;
  currentTherapistIndex: number;
  handleNextTherapists: () => void;
  therapistsInView: boolean;
}

const TherapistsSection: React.FC<TherapistsSectionProps> = ({
  therapists,
  loadingTherapists,
  therapistError,
  isAuthenticated,
  currentTherapistIndex,
  handleNextTherapists,
  therapistsInView,
}) => {
  return (
    <motion.div
      animate="visible" // Luôn hiển thị
      initial="hidden"
      variants={sectionVariants}
    >
      <section className="py-24 bg-gradient-to-b from-white to-yellow-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Skincare Experts"
            description="Meet our team of certified specialists with years of experience in skincare treatments"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loadingTherapists ? (
              <div className="col-span-3">
                <LoadingSpinner />
              </div>
            ) : therapistError ? (
              <p className="text-center text-red-600 col-span-3">{therapistError}</p>
            ) : isAuthenticated && therapists.length > 0 ? (
              therapists
                .slice(currentTherapistIndex * 3, (currentTherapistIndex + 1) * 3)
                .map((therapist, index) => (
                  <TherapistCard key={therapist.id} therapist={therapist} index={index} />
                ))
            ) : (
              <p className="text-gray-600 text-center col-span-3 py-12">
                {isAuthenticated
                  ? "Our skincare experts are being prepared. Please check back soon."
                  : "Please log in to view the list of specialists."}
              </p>
            )}
          </div>

          {isAuthenticated && therapists.length > 3 && (
            <div className="text-center mt-12">
              <motion.button
                onClick={handleNextTherapists}
                className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out flex items-center mx-auto"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span>Explore More Specialists</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default TherapistsSection;
// TherapistsSection.tsx
// Chức năng: Hiển thị section "Our Skincare Experts", chứa danh sách các chuyên gia.
// Vai trò:
// Sử dụng SectionHeader để hiển thị tiêu đề và mô tả của section.
// Hiển thị danh sách chuyên gia dưới dạng lưới (grid), mỗi lần hiển thị tối đa 3 chuyên gia.
// Nếu đang tải (loadingTherapists là true), hiển thị LoadingSpinner.
// Nếu có lỗi (therapistError không null), hiển thị thông báo lỗi.
// Nếu chưa đăng nhập (isAuthenticated là false), hiển thị thông báo "Please log in to view the list of specialists".
// Nếu không có chuyên gia (therapists.length === 0), hiển thị thông báo "Our skincare experts are being prepared...".
// Cung cấp nút "Explore More Specialists" để chuyển đổi danh sách chuyên gia (nếu có hơn 3 chuyên gia).