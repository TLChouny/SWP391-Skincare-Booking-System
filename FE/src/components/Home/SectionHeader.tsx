import React from "react";
import { motion } from "framer-motion";
import { textRevealVariants } from "../../styles/variants";

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-16">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
        variants={textRevealVariants}
        custom={0}
      >
        {title}
      </motion.h1>
      <motion.div
        className="mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded mx-auto"
        variants={textRevealVariants}
        custom={1}
      />
      <motion.p
        className="text-gray-600 mt-4 max-w-2xl mx-auto"
        variants={textRevealVariants}
        custom={2}
      >
        {description}
      </motion.p>
    </div>
  );
};

export default SectionHeader;
// SectionHeader.tsx
// Chức năng: Hiển thị tiêu đề, đường kẻ dưới tiêu đề, và mô tả của mỗi section (dùng chung cho Services, Therapists, Blogs).
// Vai trò:
// Tạo một giao diện tiêu đề thống nhất cho các section.
// Hiển thị tiêu đề với gradient màu (from-yellow-600 to-yellow-400).
// Hiển thị một đường kẻ gradient bên dưới tiêu đề.
// Hiển thị mô tả bên dưới đường kẻ.
// Thêm animation cho tiêu đề, đường kẻ, và mô tả bằng framer-motion.