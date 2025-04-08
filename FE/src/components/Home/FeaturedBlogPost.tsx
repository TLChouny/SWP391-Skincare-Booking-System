import React from "react";
import { motion } from "framer-motion";
import { Blog } from "../../types/booking";
import { useNavigate } from "react-router-dom";
import { serviceCardVariants, buttonVariants } from "../../styles/variants";

interface FeaturedBlogPostProps {
  blog: Blog;
}

const FeaturedBlogPost: React.FC<FeaturedBlogPostProps> = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="mb-16 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      variants={serviceCardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -10 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-full">
          <motion.img
            src={blog.image || "/placeholder.svg?height=600&width=800"}
            alt={blog.title}
            className="w-full h-full object-cover min-h-[300px]"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Featured Post
          </motion.div>
        </div>
        <div className="p-8 flex flex-col justify-between">
          <div>
            <motion.h3
              className="text-2xl font-bold text-gray-900 mb-4"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {blog.title}
            </motion.h3>
            <p className="text-gray-600 mb-6 line-clamp-4">{blog.description}</p>
          </div>
          <div className="mt-auto">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-200 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{blog.createName}</p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate(`/blog/${blog._id}`)}
              className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition duration-300 w-full md:w-auto"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Read Full Article
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedBlogPost;
// FeaturedBlogPost.tsx
// Chức năng: Hiển thị bài viết blog nổi bật (featured post) trong section Blogs.
// Vai trò:
// Hiển thị thông tin của bài viết nổi bật (blog đầu tiên trong danh sách), bao gồm:
// Hình ảnh (blog.image, nếu không có thì dùng placeholder).
// Tiêu đề (blog.title).
// Mô tả (blog.description).
// Tên tác giả (blog.createName).
// Hiển thị nhãn "Featured Post" ở góc trên bên trái.
// Cung cấp nút "Read Full Article" để điều hướng đến trang chi tiết bài viết (/blog/:id).
// Thêm animation cho thẻ, hình ảnh, và tiêu đề khi hover bằng framer-motion.