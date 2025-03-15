import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Blog {
  _id: string;
  title: string;
  author: string;
  description: string;
  image?: string;
  content?: string;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-t ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <button className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          console.error("Dữ liệu trả về không phải mảng:", data);
          setBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Không thể tải danh sách blog. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
          <p className="text-lg text-gray-600">Đang tải danh sách blog...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Blog Chăm Sóc Da</h1>

          {/* Featured Post */}
          <div className="mb-12">
            {blogs.length > 0 ? (
              <Card className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    src={blogs[0].image || "/placeholder.svg"}
                    alt={blogs[0].title}
                    className="h-48 w-full object-cover md:h-full md:w-48"
                  />
                </div>
                <div className="p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">{blogs[0].title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mt-2 text-gray-600">{blogs[0].description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button>
                      <a href={`/blog/${blogs[0]._id}`}>Đọc thêm</a>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ) : (
              <p className="text-gray-600 text-center">Không có bài viết nổi bật.</p>
            )}
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length > 1 ? (
              blogs.slice(1).map((blog) => (
                <Card key={blog._id} className="hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={blog.image || "/placeholder.svg"}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <CardTitle className="text-gray-900">{blog.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2">{blog.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{blog.author}</span>
                    <Button className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      <a href={`/blog/${blog._id}`}>Đọc thêm</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 text-center col-span-3">Không có bài viết nào để hiển thị.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;