import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        className="h-12 w-12 border-t-2 border-b-2 border-yellow-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
      />
    </div>
  );
};

export default LoadingSpinner;
// LoadingSpinner.tsx
// Chức năng: Hiển thị một spinner loading khi dữ liệu đang được tải.
// Vai trò:
// Hiển thị một vòng tròn quay (border-t-2 border-b-2 border-yellow-400) để biểu thị trạng thái loading.
// Thêm animation quay liên tục bằng framer-motion.