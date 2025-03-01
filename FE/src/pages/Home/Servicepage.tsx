import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Layout from "../../layout/Layout";

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<null | string>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedType, setRecommendedType] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const recommended = queryParams.get("recommended");

    if (recommended) {
      setRecommendedType(recommended);
    } else {
      const savedAssessment = localStorage.getItem("skinAssessmentResult");
      if (savedAssessment) {
        try {
          const { recommendedService } = JSON.parse(savedAssessment);
          setRecommendedType(recommendedService.type.toLowerCase());
        } catch (error) {
          console.error("Error parsing saved assessment:", error);
        }
      }
    }
  }, [location.search]);

  useEffect(() => {
    const state = location.state as { suggestedServices?: any[] } | undefined;

    // Nếu có dịch vụ từ bài test, dùng luôn mà không gọi API
    if (state?.suggestedServices && state.suggestedServices.length > 0) {
      setServices(formatServices(state.suggestedServices, true));
      setLoading(false);
    } else {
      fetchServices();
    }
  }, [location.state, recommendedType]);

  const fetchServices = async () => {
    if (services.length > 0) return; // Tránh gọi API nếu đã có dữ liệu

    setLoading(true);
    try {
      let response;
      // if (recommendedType) {
      //   try {
      //     response = await axios.get(
      //       `http://localhost:5000/api/recommended-services/${recommendedType}`
      //     );
      //     if (response.data.success && response.data.data.length > 0) {
      //       setServices(formatServices(response.data.data, true));
      //       return;
      //     }
      //   } catch (error) {
      //     console.error("Error fetching recommended services:", error);
      //   }
      // }

      response = await axios.get("http://localhost:5000/api/products/");
      setServices(formatServices(response.data, false));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatServices = (data: any[], isRecommended: boolean) => {
    return data.map((service) => ({
      ...service,
      price: formatPrice(service.price),
      isRecommended:
        isRecommended ||
        (recommendedType &&
          service.category?.name.toLowerCase().includes(recommendedType)),
    }));
  };

  const formatPrice = (price: any) => {
    let priceValue = 0;
    if (typeof price === "object" && price.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    } else if (typeof price === "string") {
      priceValue = Number.parseFloat(price.replace(/\./g, ""));
    }
    return `${priceValue.toLocaleString("vi-VN")} VNĐ`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-16">
        {recommendedType && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-800">
              Personalized Recommendation
            </h3>
            <p className="text-gray-700">
              Based on your skin assessment, we've highlighted services for{" "}
              {/* {recommendedType}*/} skin type. Let's do test 
            </p>
          </div>
        )}

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
                className={`bg-white p-6 rounded-lg shadow-lg cursor-pointer transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white ${
                  service.isRecommended
                    ? "border-2 border-purple-500 relative"
                    : ""
                }`}
                onClick={() => setSelectedService(service.name)}
              >
                {service.isRecommended && (
                  <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Recommended
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-gray-800">
                  {service.name}
                </h3>
                <img
                  className="mt-4 rounded-lg shadow-md object-cover h-40 w-full"
                  src={service.image || "/default-image.jpg"}
                  alt={service.name}
                />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  {service.price}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServicePage;
