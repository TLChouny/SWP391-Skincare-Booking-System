import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../layout/Layout";
import { useAuth } from "../../context/AuthContext";

interface Service {
  _id: string;
  service_id: number;
  name: string;
  description: string;
  image?: string;
  duration?: number;
  price?: number | { $numberDecimal: string };
  discountedPrice?: number | null | undefined; // Giữ nguyên định nghĩa này
  category: {
    _id: string;
    name: string;
    description: string;
  };
  createDate?: string;
  isRecommended?: boolean;
}

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedType, setRecommendedType] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    fetchServices();
  }, [recommendedType]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/products/");
      setServices(formatServices(response.data));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatServices = (data: any[]) => {
    return data.map((service) => ({
      ...service,
      price: typeof service.price === "object" && service.price?.$numberDecimal
        ? Number.parseFloat(service.price.$numberDecimal)
        : typeof service.price === "string"
        ? Number.parseFloat(service.price.replace(/\./g, ""))
        : service.price || 0,
      discountedPrice: service.discountedPrice ?? null, // Chuyển undefined thành null
      isRecommended: recommendedType
        ? service.category?.name.toLowerCase().includes(recommendedType)
        : false,
    }));
  };

  const formatPriceDisplay = (price: number, discountedPrice?: number | null | undefined): JSX.Element => {
    return (
      <>
        <span style={{ textDecoration: discountedPrice != null ? "line-through" : "none" }}>
          {price.toLocaleString("vi-VN")} VNĐ
        </span>
        {discountedPrice != null && (
          <span style={{ color: "green", marginLeft: "8px" }}>
            {discountedPrice.toLocaleString("vi-VN")} VNĐ
          </span>
        )}
      </>
    );
  };

  const handleServiceClick = (serviceId: string) => {
    if (isAuthenticated) {
      navigate(`/booking/${serviceId}`);
    } else {
      navigate("/login", {
        state: { from: `/booking/${serviceId}` },
      });
    }
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
              Based on your skin assessment, we've highlighted services for your skin type.
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
            services.map((service) => (
              <motion.div
                key={service._id}
                className={`relative bg-white p-6 rounded-lg shadow-lg overflow-hidden ${
                  service.isRecommended ? "border-2 border-purple-500" : ""
                }`}
                onClick={() => handleServiceClick(service._id)}
                onMouseEnter={() => setHoveredService(service._id)}
                onMouseLeave={() => setHoveredService(null)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {service.isRecommended && (
                  <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Recommended
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{service.name}</h3>
                <img
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  src={service.image || "/default-image.jpg"}
                  alt={service.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-image.jpg";
                  }}
                />
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {formatPriceDisplay(service.price as number, service.discountedPrice)}
                </p>

                {hoveredService === service._id && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white bg-opacity-95 flex flex-col justify-center p-6 rounded-lg shadow-md"
                  >
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-md text-gray-700">{service.description}</p>
                    <p className="text-md">Duration: {service.duration || "N/A"} minutes</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {formatPriceDisplay(service.price as number, service.discountedPrice)}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServicePage; 