import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../layout/Layout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createName: string;
}

const BlogDetailPage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        console.log(`Fetching blog with ID: ${_id}`);

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
            image: data.image || "/placeholder.svg",
            createName: data.createName || "Không rõ",
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
          <p className="text-lg text-gray-600">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Không tìm thấy bài viết.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-10 flex flex-col items-center">
        {/* Hình ảnh bài viết (chiều rộng lớn hơn) */}
        <div className="w-full max-w-5xl">
          <img src={blog.image} alt={blog.title} className="w-full h-[450px] object-cover rounded-lg shadow-md" />
        </div>

        {/* Nội dung bài viết rộng hơn */}
        <div className="w-full max-w-4xl mt-8 p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-900 text-center">{blog.title}</h1>
          <p className="mt-6 text-gray-700 text-lg leading-relaxed">{blog.content}</p>
        </div>

        {/* Tác giả và nút quay lại */}
        <div className="w-full max-w-4xl mt-8 flex justify-between items-center text-gray-500 text-lg">
          <span>Tác giả: {blog.createName}</span>
          <a href="/blog" className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Quay lại danh sách
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetailPage;
