import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";

interface Service {
  _id: string; // Thay bằng _id từ MongoDB
  service_id: number; // Thêm field từ API
  name: string;
  description: string;
  image?: string;
  duration?: number;
  price?: number;
  category: {
    _id: string;
    name: string;
    description: string;
  };
  createDate?: string;
  __v?: number;
}

const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          console.error("Dữ liệu trả về không hợp lệ:", data);
          setServices([]); // Đặt mặc định rỗng nếu dữ liệu không phải mảng
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dịch vụ:", error);
        alert("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      });
  }, []);

  const handleBookNow = (id: string) => {
    navigate(`/booking/${id}`); // Sử dụng _id từ service
  };

  const handleNext = () => {
    const maxIndex = Math.ceil(services.length / 3) - 1;
    setCurrentServiceIndex((prevIndex) =>
      prevIndex < maxIndex ? prevIndex + 1 : 0
    );
  };

  return (
    <Layout>
      {/* Hero Section with Video Background */}
      <section className='relative w-full h-screen overflow-hidden'>
        <video
          src={video1}
          autoPlay
          loop
          muted
          playsInline
          className='absolute top-0 left-0 w-full h-full object-cover'
          onError={(e) => console.error("Video failed to load:", e)}>
          <source src={video1} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
        <div className='absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white px-6'>
          <motion.h1
            className='text-6xl font-extrabold mb-4 text-yellow-400'
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}>
            Discover the Magic of LuLuSpa
          </motion.h1>
          <motion.p
            className='text-2xl font-light mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}>
            Your Skin, Our Passion
          </motion.p>
          <motion.button
            onClick={() =>
              services.length > 0 && handleBookNow(services[0]._id)
            } // Chọn _id của service đầu tiên nếu có
            className='px-8 py-4 bg-yellow-400 text-gray-900 rounded-full text-lg font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform hover:scale-105'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={services.length === 0}>
            Book Your Luxurious Experience
          </motion.button>
        </div>
      </section>

      {/* Skincare Packages */}
      <section className='py-24 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-5xl font-extrabold text-gray-900 mb-12 text-center'>
            Luxurious Skincare Packages
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
            {services.length > 0 ? (
              services
                .slice(currentServiceIndex * 3, (currentServiceIndex + 1) * 3)
                .map((service) => (
                  <motion.div
                    key={service._id} // Sử dụng _id thay vì id
                    className='bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl'
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}>
                    <img
                      src={service.image || "/default-service.jpg"}
                      alt={service.name}
                      className='w-full h-64 object-cover'
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-service.jpg"; // Fallback nếu ảnh lỗi
                      }}
                    />
                    <div className='p-8'>
                      <h3 className='text-3xl font-semibold text-gray-800 mb-4'>
                        {service.name}
                      </h3>
                      <p className='text-gray-600 mb-6'>
                        {service.description}
                      </p>
                      <div className='flex justify-between items-center mb-4'>
                        <div className='flex flex-col'>
                          <span className='text-2xl font-bold text-yellow-500'>
                            {service.price
                              ? `${service.price.toLocaleString("vi-VN")} VNĐ`
                              : "Contact for Price"}
                          </span>
                          <span className='text-lg text-gray-600'>
                            {service.duration
                              ? `${service.duration} minutes`
                              : "Duration TBD"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookNow(service._id)} // Sử dụng _id
                          className='px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform hover:scale-105'>
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <p className='text-gray-600 text-center col-span-3'>
                Our luxurious services are being prepared. Please check back
                soon.
              </p>
            )}
          </div>
          {services.length > 3 && (
            <div className='text-center mt-12'>
              <button
                onClick={handleNext}
                className='px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out'>
                Explore More Packages
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
