import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";
import { getServices } from "../../api/apiService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  name: string;
  description: string;
  image?: string;
  price?: number;
}

const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [hoveredService] = useState<Service | null>(null);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getServices()
      .then((response) => {
        if (response?.data && Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          console.error("Dữ liệu trả về không hợp lệ:", response);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dịch vụ:", error);
      });
  }, []);

  const handleBookNow = (id: string) => {
    navigate(`/booking/${id}`);
  };

  const handleNext = () => {
    setCurrentServiceIndex((prevIndex) => (prevIndex + 1) % Math.ceil(services.length / 3));
  };

  return (
    <Layout>
      {/* Video Background */}
      <section className="relative w-full h-screen overflow-hidden">
        <video
          src={video1}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }}
        ></video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-6">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: [0, 1, 0], y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Discover the Magic of LuLuSpaspa
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 0], y: [20, 10, 20] }}
            transition={{ delay: 0.5, duration: 3, repeat: Infinity }}
          >
            Your Skin, Our Passion
          </motion.p>
          <motion.button
            onClick={() => handleBookNow("service_id")}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:bg-blue-600 transition"
            whileHover={{ scale: 1.1 }}
          >
            Book Your Appointment
          </motion.button>
        </div>
      </section>

      {/* Skincare Packages */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Skincare Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {services.length > 0 ? (
                services.slice(currentServiceIndex * 3, (currentServiceIndex + 1) * 3).map((service) => (
                  <motion.div
                    key={service.id}
                    className="bg-white p-6 rounded-lg shadow-lg transition border-2 border-yellow-300"
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.img
                      src={service.image || "/default-service.jpg"}
                      alt={service.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-3xl font-semibold text-gray-800 mt-2">
                      {service.name}
                    </h3>
                    <AnimatePresence>
                      {hoveredService === service && (
                        <motion.div
                          className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-4 rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>{service.description}</p>
                          <p className="mt-2 text-xl font-bold">
                            {service.price ? `$${service.price}` : "Contact for Price"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => handleBookNow(service.id)}
                      className="mt-4 py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-500 transition"
                    >
                      Book Now
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600">No services available at the moment.</p>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => handleNext()}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Next
          </button>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Latest from our Blog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl border-2 border-yellow-300"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-2xl font-semibold text-gray-800">
                  Blog Title {index + 1}
                </h3>
                <p className="mt-4 text-gray-600">
                  Short description of the blog post...
                </p>
                <button className="mt-6 py-2 px-4 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition">
                  Read More
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
