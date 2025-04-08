import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";
import { sectionVariants, buttonVariants } from "../../styles/variants";

interface HeroSectionProps {
  servicesLength: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ servicesLength }) => {
  const navigate = useNavigate();

  return (
    <motion.section
      className="relative w-full h-screen overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <video
        src={video1}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        onError={(e) => {
          console.error("Video failed to load:", e);
          toast.error("Video failed to load. Please try again later.");
          (e.target as HTMLVideoElement).style.display = "none";
        }}
      >
        <source src={video1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white px-6">
        <motion.h1
          className="text-6xl font-extrabold mb-4 text-yellow-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1,
            y: 0,
            textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 20px rgba(0,0,0,0.5)"],
          }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
            textShadow: { repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 2 },
          }}
        >
          Discover the Magic of LuLuSpa
        </motion.h1>
        <motion.p
          className="text-2xl font-light mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Skin, Our Passion
        </motion.p>
        <motion.button
          onClick={() => navigate("/services")}
          className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-full text-lg font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          disabled={servicesLength === 0}
        >
          Book Your Luxurious Experience
        </motion.button>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, 10, 0],
          }}
          transition={{
            opacity: { delay: 1.5, duration: 1 },
            y: { repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" },
          }}
        >
          <div className="flex flex-col items-center">
            <p className="text-white text-sm mb-2">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
              <motion.div
                className="w-1.5 h-1.5 bg-white rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
// HeroSection.tsx
// Chức năng: Hiển thị phần đầu tiên (Hero section) của trang, bao gồm video background, tiêu đề, mô tả, và nút điều hướng.
// Vai trò:
// Hiển thị video quảng cáo (video1) làm nền.
// Hiển thị tiêu đề "Discover the Magic of LuLuSpa" và mô tả "Your Skin, Our Passion".
// Cung cấp nút "Book Your Luxurious Experience" để điều hướng đến trang /services.
// Thêm animation cho tiêu đề, mô tả, và nút bằng framer-motion.
// Hiển thị một chỉ báo "Scroll to explore" với hiệu ứng động.