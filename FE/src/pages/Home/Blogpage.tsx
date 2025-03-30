import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../layout/Layout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Blog } from "../../types/booking";

const serviceCardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='p-4'>{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold line-clamp-2 h-14 ${className}`}>
    {children}
  </h2>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='p-4 flex-grow'>{children}</div>
);

const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-4 border-t ${className}`}>{children}</div>
);

const Button: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <button
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE_URL =
    window.location.hostname === "localhost"
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
        if (!response.ok)
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          console.error("Returned data is not an array:", data);
          setBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Could not load blog list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-100 py-8 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      </Layout>
    );
  }

  const featuredBlog =
    blogs.find((blog) => blog.createName === "LuLu Spa") || blogs[0] || null;

  return (
    <Layout>
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='container mx-auto px-4'>
          {/* Improved title */}
          <motion.h1
            className='text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide'
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            Skincare Blog
            <div className='mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-white-400 rounded mx-auto'></div>
          </motion.h1>
          {/* Featured Post */}
          <div className='mb-12'>
            {featuredBlog ? (
              <motion.div
                className='mb-16 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300'
                variants={serviceCardVariants}
                initial='hidden'
                animate='visible'>
                <div className='grid grid-cols-1 md:grid-cols-2'>
                  <div className='relative h-full'>
                    <img
                      src={
                        featuredBlog.image ||
                        "/placeholder.svg?height=300&width=400"
                      }
                      alt={featuredBlog.title}
                      className='w-[700px] h-[550px] object-cover' // 4:3 ratio (400x300)
                    />
                    <div className='absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold'>
                      Featured Post
                    </div>
                  </div>
                  <div className='p-8 flex flex-col justify-between'>
                    <div>
                      <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                        {featuredBlog.title}
                      </h3>
                      <p className='text-gray-600 mb-6 line-clamp-4'>
                        {featuredBlog.description}
                      </p>
                    </div>
                    <div className='mt-auto'>
                      <div className='flex items-center mb-4'>
                        <div className='bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center mr-3'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 text-gray-600'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {featuredBlog.createName}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {new Date(
                              featuredBlog.createdAt || Date.now()
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => navigate(`/blog/${featuredBlog._id}`)}
                        className='px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition duration-300 w-full md:w-auto'
                        variants={buttonVariants}
                        whileHover='hover'
                        whileTap='tap'>
                        Read Full Article
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <p className='text-gray-600 text-center'>
                No featured posts available.
              </p>
            )}
          </div>

          {/* Blog Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {blogs.length > 0 ? (
              blogs
                .filter((blog) => blog._id !== featuredBlog?._id)
                .map((blog) => (
                  <Card
                    key={blog._id}
                    className='hover:shadow-lg transition-shadow duration-300 flex flex-col h-[600px]'>
                    <img
                      src={
                        blog.image || "/placeholder.svg?height=160&width=240"
                      }
                      alt={blog.title}
                      className='w-[640px] h-[320px] object-cover'
                    />
                    <CardHeader>
                      <CardTitle className='text-gray-900'>
                        {blog.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-gray-600 line-clamp-3'>
                        {blog.content}
                      </p>
                    </CardContent>
                    <CardFooter className='flex justify-between items-center mt-auto'>
                      <span className='text-sm text-gray-500 truncate'>
                        {blog.createName}
                      </span>
                      <Button className='border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'>
                        <a href={`/blog/${blog._id}`}>Read More</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <p className='text-gray-600 text-center col-span-3'>
                No articles to display.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
