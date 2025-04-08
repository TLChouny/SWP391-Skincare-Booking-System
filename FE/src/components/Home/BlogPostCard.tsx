import React from "react";
import { motion } from "framer-motion";
import { Blog } from "../../types/booking";
import { useNavigate } from "react-router-dom";
import { serviceCardVariants, buttonVariants } from "../../styles/variants";

interface BlogPostCardProps {
  blog: Blog;
  index: number;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ blog, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      key={blog._id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      variants={serviceCardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -10 }}
      custom={index}
    >
      <div className="relative">
        <motion.img
          src={blog.image || "/placeholder.svg?height=300&width=500"}
          alt={blog.title}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-xs">
            {new Date(blog.createdAt || Date.now()).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <motion.h3
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {blog.title}
        </motion.h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{blog.description}</p>
        <motion.button
          onClick={() => navigate(`/blog/${blog._id}`)}
          className="mt-auto text-yellow-600 font-medium hover:text-yellow-700 flex items-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Read More
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BlogPostCard;
// BlogPostCard.tsx
// Chức năng: Hiển thị một thẻ bài viết blog (không phải bài viết nổi bật) trong danh sách bài viết.
// Vai trò:
// Hiển thị thông tin của một bài viết, bao gồm:
// Hình ảnh (blog.image, nếu không có thì dùng placeholder).
// Tiêu đề (blog.title).
// Mô tả ngắn (blog.description).
// Ngày tạo (blog.createdAt).
// Cung cấp nút "Read More" để điều hướng đến trang chi tiết bài viết (/blog/:id).
// Thêm animation cho thẻ, hình ảnh, và tiêu đề khi hover bằng framer-motion.