import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { getServices } from "../../api/apiService"; // Đảm bảo thay đúng đường dẫn tới API
import  Layout  from "../../layout/Layout";

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL
  const [service, setService] = useState<any | null>(null); // Dịch vụ được chọn
  const center = { lat: 21.0285, lng: 105.8542 }; // Vị trí trung tâm của bản đồ

  // Danh sách các chi nhánh
  const branches = [
    { name: "LuLuSpa Branch 1", lat: 21.0285, lng: 105.8542 },
    { name: "LuLuSpa Branch 2", lat: 21.0290, lng: 105.8550 },
  ];

  // Gọi API để lấy dữ liệu dịch vụ dựa trên id
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getServices();
        const foundService = response.data.find((s: any) => s.id === id); // Tìm dịch vụ theo id
        setService(foundService || null);
      } catch (error) {
        console.error("Error fetching service:", error);
      }
    };

    fetchService();
  }, [id]);

  return (
    <Layout>
    <div className="container mx-auto py-16">
      <h2 className="text-4xl font-bold text-center mb-10">Booking Service</h2>

      <div className="flex">
        {/* Thông tin dịch vụ */}
        <div className="w-1/3 pr-8">
          {service ? (
            <>
              <h3 className="text-2xl font-semibold mb-4">{service.name}</h3>
              <img
                src={service.image} // Hiển thị ảnh dịch vụ
                alt={service.name}
                className="w-full h-auto rounded-lg shadow-lg mb-6"
              />
              <p className="text-lg text-gray-600 mb-4">{service.description}</p>
              <p className="text-xl font-bold text-gray-900">
                Price: {service.price}
              </p>
            </>
          ) : (
            <p className="text-lg text-gray-600">Loading service details...</p>
          )}
        </div>

        {/* Form đặt lịch */}
        <div className="w-2/3">
          <h3 className="text-2xl font-semibold mb-4">Booking Form</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-lg text-gray-700">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-lg text-gray-700">Phone Number</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-lg text-gray-700">Choose Date</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hiển thị bản đồ */}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={center}
          zoom={15}
        >
          {branches.map((branch, index) => (
            <Marker
              key={index}
              position={{ lat: branch.lat, lng: branch.lng }}
              label={branch.name}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
    </Layout>
  );
};

export default BookingPage;
