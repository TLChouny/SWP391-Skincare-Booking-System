import React, { useState, useEffect } from "react";
import { getServices } from "../../api/apiService"; // Đảm bảo thay đúng đường dẫn tới tệp API
import Layout from "../../layout/Layout";

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<null | string>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gọi API khi component được render
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices(); // Gọi API của bạn
        setServices(response.data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false); // Khi gọi API xong, cập nhật loading thành false
      }
    };

    fetchServices();
  }, []);

  // Tìm dịch vụ được chọn từ mảng services
  const selectedServiceDetails = services.find(
    (service) => service.name === selectedService
  );

  const closeModal = () => {
    setSelectedService(null);
  };

  // Hàm chia mô tả thành các dòng có dấu gạch đầu dòng
  const splitDescription = (description: string) => {
    // Tách mô tả thành các mục có dấu gạch đầu dòng
    const lines = description.split("\n").map((line, index) => {
      return (
        <p key={index} className="text-lg text-gray-600 flex items-start">
          <span className="mr-2 text-blue-500">•</span>{line}
        </p>
      );
    });
    return lines;
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Skincare Combo Packages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-xl font-semibold text-center text-gray-500">
              Loading services...
            </div>
          ) : (
            services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white"
                onClick={() => setSelectedService(service.name)}
              >
                <h3 className="text-2xl font-semibold text-gray-800">{service.name}</h3>
                <img
                  className="mt-4 text-xl font-bold text-gray-900"
                  src={service.image} // Đảm bảo rằng 'service.image' chứa URL hình ảnh
                  alt={service.name} // Alt text cho hình ảnh
                />
                {/* <p className="mt-4 text-gray-600">{service.description}</p> */}
                <p className="mt-4 text-xl font-bold text-gray-900">{service.price}</p>
              </div>
            ))
          )}
        </div>

        {/* Modal khi dịch vụ được chọn */}
        {selectedService && selectedServiceDetails && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out">
            <div className="bg-white p-12 rounded-lg shadow-lg w-2/3 relative transform scale-100 transition-all duration-500 ease-in-out opacity-100 max-w-4xl">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-600 text-3xl transition-transform transform hover:scale-125"
              >
                &times;
              </button>
              <h3 className="text-4xl font-semibold text-gray-800 mb-6">
                {selectedServiceDetails.name}
              </h3>
              <p className="text-xl text-gray-700 mb-6">{selectedServiceDetails.price}</p>

              {/* Chia mô tả thành các dòng có dấu gạch đầu dòng */}
              <div className="mb-6">
                <h4 className="text-2xl font-semibold text-gray-800 mb-4">Description</h4>
                {/* Hiển thị mô tả theo từng dòng với dấu gạch đầu dòng */}
                <div className="space-y-4">
                  {splitDescription(selectedServiceDetails.description)}
                </div>
              </div>

              {/* Hình ảnh dịch vụ */}
              <img
                src={selectedServiceDetails.image}  // Sử dụng giá trị image từ API
                alt={selectedServiceDetails.name}   // Alt text cho hình ảnh
                className="rounded-lg shadow-lg w-full h-auto object-cover mb-6 transition-transform duration-500 ease-in-out transform hover:scale-105"
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServicePage;
