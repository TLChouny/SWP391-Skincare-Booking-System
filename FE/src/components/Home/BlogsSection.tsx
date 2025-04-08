import React from "react";
import { motion } from "framer-motion";
import { Blog } from "../../types/booking";
import { useNavigate } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import FeaturedBlogPost from "./FeaturedBlogPost";
import BlogPostCard from "./BlogPostCard";
import LoadingSpinner from "./LoadingSpinner";
import { sectionVariants, buttonVariants } from "../../styles/variants";

interface BlogsSectionProps {
  blogs: Blog[];
  loadingBlogs: boolean;
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
  blogsInView: boolean;
}

const BlogsSection: React.FC<BlogsSectionProps> = ({
  blogs,
  loadingBlogs,
  setBlogs,
  blogsInView,
}) => {
  const navigate = useNavigate();

  const handleViewAllBlogs = () => {
    navigate("/blog");
  };

  return (
    <motion.div
      animate="visible" // Luôn hiển thị
      initial="hidden"
      variants={sectionVariants}
    >
      <section className="py-24 bg-gradient-to-b from-yellow-50 to-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Latest Blog Posts"
            description="Stay updated with the latest skincare trends, tips, and insights from our experts"
          />

          {loadingBlogs ? (
            <LoadingSpinner />
          ) : blogs.length > 0 ? (
            <>
              {blogs.length > 0 && <FeaturedBlogPost blog={blogs[0]} />}

              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">More Articles</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {blogs.slice(1, 4).map((blog, index) => (
                    <BlogPostCard key={blog._id} blog={blog} index={index} />
                  ))}
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  <motion.button
                    onClick={() => {
                      const newBlogs = [...blogs];
                      newBlogs.push(newBlogs.shift()!);
                      setBlogs(newBlogs);
                    }}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    aria-label="Previous blog"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      const newBlogs = [...blogs];
                      newBlogs.unshift(newBlogs.pop()!);
                      setBlogs(newBlogs);
                    }}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    aria-label="Next blog"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <div className="text-center mt-16">
                <motion.button
                  onClick={handleViewAllBlogs}
                  className="px-8 py-3 bg-yellow-500 text-white rounded-full font-semibold hover:bg-yellow-600 transition duration-300 ease-in-out flex items-center mx-auto"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>View All Articles</span>
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
            </>
          ) : (
            <p className="text-gray-600 text-center py-12">No blog posts available at the moment.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default BlogsSection;
// BlogsSection.tsx
// Chức năng: Hiển thị section "Latest Blog Posts", chứa bài viết nổi bật và danh sách các bài viết khác.
// Vai trò:
// Sử dụng SectionHeader để hiển thị tiêu đề và mô tả của section.
// Hiển thị bài viết nổi bật (blog đầu tiên) bằng FeaturedBlogPost.
// Hiển thị danh sách 3 bài viết tiếp theo dưới dạng lưới (grid) bằng BlogPostCard.
// Nếu đang tải (loadingBlogs là true), hiển thị LoadingSpinner.
// Nếu không có bài viết (blogs.length === 0), hiển thị thông báo "No blog posts available at the moment".
// Cung cấp các nút điều hướng (Previous/Next) để xoay vòng danh sách bài viết.
// Cung cấp nút "View All Articles" để điều hướng đến trang /blog.