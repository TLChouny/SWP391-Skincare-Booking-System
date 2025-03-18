import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../layout/Layout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Blog } from "../../types/booking";

const BlogDetailPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        // console.log(`Fetching blog with ID: ${_id}`);
        const response = await fetch(`${API_BASE_URL}/blogs/${_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch blog: ${response.status}`);
        }

        const data = await response.json();
        if (data && typeof data === "object" && data._id) {
          setBlog({
            _id: data._id,
            title: data.title || "Không có tiêu đề",
            content: data.content || "Không có nội dung chi tiết.",
            description: data.description,
            image: data.image || "/placeholder.svg",
            createName: data.createName || "Không rõ",
            createdAt: data.createdAt || "Không rõ",
          });
        } else {
          setError("Dữ liệu không hợp lệ");
        }
      } catch (error: any) {
        setError(error.message || "Không thể tải bài viết.");
        toast.error(error.message || "Lỗi tải bài viết.");
      } finally {
        setLoading(false);
      }
    };

    if (_id) {
      fetchBlogDetail();
    } else {
      setError("Không có ID bài viết trong URL");
      setLoading(false);
    }
  }, [_id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-500 italic">Không tìm thấy bài viết.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center justify-between text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Tác giả: {blog.createName}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="mt-2 h-1 w-20 bg-blue-500 rounded"></div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-[800px] md:h-[800px] object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none bg-white p-8 rounded-xl shadow-md">
            <p className="text-gray-500 italic mb-6">{blog.description}</p>
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content || "Không có nội dung chi tiết." }}
            />
          </div>

          {/* Footer Section */}
          <footer className="mt-8 flex justify-between items-center">
            <a
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại danh sách
            </a>
          </footer>
        </div>
      </article>
    </Layout>
  );
};

export default BlogDetailPage;