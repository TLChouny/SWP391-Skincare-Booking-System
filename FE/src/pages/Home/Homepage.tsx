import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";
import { getServices } from "../../api/apiService"; // import hàm getServices từ api
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]); // Khai báo state để lưu dịch vụ

  useEffect(() => {
    // Gọi API để lấy danh sách dịch vụ
    getServices()
      .then((response) => {
        setServices(response.data); // Lưu dữ liệu vào state
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dịch vụ:", error);
      });
  }, []); // useEffect chạy một lần khi component được render

  const navigate = useNavigate(); // Khởi tạo navigate

  // Hàm điều hướng đến trang booking với id dịch vụ đã chọn
  const handleBookNow = (serviceId: number) => {
    // Điều hướng đến trang booking với id dịch vụ
    navigate(`/booking/${serviceId}`);
  };

  return (
    <div>
      <Layout>
        {/* Video Background */}
        <section>
          <div
            style={{
              width: "100%",
              height: "100vh",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <video
              src={video1}
              autoPlay
              loop
              muted
              controls={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            ></video>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="container mx-auto h-full flex items-center justify-center text-center text-white">
                <h1 className="text-5xl font-bold">Discover the Magic of LuLuSpa</h1>
                <p className="mt-4 text-xl">Your Skin, Our Passion</p>
                <button
                  onClick={() => handleBookNow(1)} // Truyền id dịch vụ đầu tiên khi nhấn Book
                  className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Book Your Appointment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Skincare Packages */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Our Skincare Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.length === 0 ? (
                <p>Loading services...</p> // Hiển thị khi dữ liệu chưa được tải
              ) : (
                services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl"
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <h3 className="text-2xl font-semibold text-gray-800 mt-4">{service.name}</h3>
                    <p className="mt-4 text-gray-600">{service.description}</p>
                    <p className="mt-4 text-xl font-bold text-gray-900">{`$${service.price}`}</p>
                    <button
                      onClick={() => handleBookNow(service.id)} // Truyền id dịch vụ khi nhấn "Book Now"
                      className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Book Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Latest from our Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ /* Blog Posts */ ].map((blogPost, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl">
                  {/* <img src={blogPost.image} alt={blogPost.title} className="w-full h-40 object-cover rounded-lg" /> */}
                  {/* <h3 className="text-2xl font-semibold text-gray-800 mt-4">{blogPost.title}</h3> */}
                  {/* <p className="mt-4 text-gray-600">{blogPost.description}</p> */}
                  <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Read More</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </div>
  );
};

export default HomePage;
