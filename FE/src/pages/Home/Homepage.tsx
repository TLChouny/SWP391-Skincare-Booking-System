import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";
import { getServices } from "../../api/apiService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getServices()
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dịch vụ:", error);
      });
  }, []);

  const handleBookNow = (id: string) => {
    navigate(`/booking/${id}`);
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
        ></video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-6">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover the Magic of LuLuSpa
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your Skin, Our Passion
          </motion.p>
          <motion.button
            onClick={() => handleBookNow("service_id")}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            whileHover={{ scale: 1.1 }}
          >
            Book Your Appointment
          </motion.button>
        </div>
      </section>

      {/* Skincare Packages */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-10">
            Our Skincare Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="text-2xl font-semibold text-gray-800 mt-4">
                  {service.name}
                </h3>
                <p className="mt-4 text-gray-600">{service.description}</p>
                <p className="mt-4 text-xl font-bold text-gray-900">{`$${service.price}`}</p>
                <button
                  onClick={() => handleBookNow(service.id)}
                  className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-10">
            Latest from our Blog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  Blog Title {index + 1}
                </h3>
                <p className="mt-4 text-gray-600">Short description of the blog post...</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
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
