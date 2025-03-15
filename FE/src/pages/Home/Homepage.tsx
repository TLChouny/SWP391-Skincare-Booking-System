"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../layout/Layout";
import CartComponent from "../../components/Cart/CartComponent";
import CheckoutModal from "../../components/Cart/CheckoutModal";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Booking, Service, Therapist, Blog } from "../../types/booking";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";

// Animation variants (unchanged)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3, ease: "easeInOut" } },
  tap: { scale: 0.95, transition: { duration: 0.2, ease: "easeInOut" } },
};

const therapistCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

const HomePage: React.FC = () => {
  const { cart, fetchCart, isAuthenticated, loadingCart, cartError, setCart, token } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentTherapistIndex, setCurrentTherapistIndex] = useState(0);
  const [loadingBlogs, setLoadingBlogs] = useState<boolean>(true);
  const [loadingTherapists, setLoadingTherapists] = useState<boolean>(false);
  const [therapistError, setTherapistError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api";

  // Hàm format giá để hiển thị giá gốc và giá giảm theo cột (dọc)
  const formatPriceDisplay = (
    price?: number | { $numberDecimal: string },
    discountedPrice?: number | null | undefined
  ): JSX.Element => {
    let priceValue = 0;
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    }

    // Nếu priceValue không hợp lệ, trả về giá mặc định
    if (isNaN(priceValue)) priceValue = 0;

    // Tính phần trăm giảm giá
    let discountPercentage = 0;
    if (discountedPrice != null && priceValue > 0) {
      discountPercentage = Math.round(((priceValue - discountedPrice) / priceValue) * 100);
    }

    return (
      <div className="flex flex-col">
        <span style={{ textDecoration: discountedPrice != null ? "line-through" : "none" }}>
          {priceValue.toLocaleString("vi-VN")} VNĐ
        </span>
        {discountedPrice != null && (
          <span style={{ color: "green" }}>
            {discountedPrice.toLocaleString("vi-VN")} VNĐ
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="text-sm text-red-500 font-semibold mt-1">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
    );
  };

  // Fetch services
  useEffect(() => {
    fetch(`${API_BASE_URL}/products/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
        else {
          console.error("Invalid data returned:", data);
          setServices([]);
          toast.error("Invalid service data received.");
        }
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        toast.error("Unable to load service list. Please try again later.");
      });
  }, []);

  // Fetch therapists
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoadingTherapists(true);
        setTherapistError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.warning("Please log in to view the list of specialists.");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch therapists: ${response.status}`);
        const data = await response.json();
        setTherapists(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username,
            image: staff.avatar || "/default-avatar.png",
            Description: staff.Description,
          }))
        );
      } catch (error: any) {
        console.error("Error fetching therapists:", error.message);
        setTherapistError("Unable to load specialist list. Please try again later.");
        toast.error(therapistError);
      } finally {
        setLoadingTherapists(false);
      }
    };

    if (isAuthenticated) fetchTherapists();
  }, [isAuthenticated]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) setBlogs(data);
        else {
          console.error("Invalid data returned:", data);
          setBlogs([]);
          toast.error("Invalid blog data received.");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Unable to load blog list. Please try again later.");
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, []);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleCheckout = async () => {
    console.log("Checking out with cart:", cart); // Debug log
    if (!isAuthenticated) {
      toast.warning("Please log in to proceed with checkout.");
      navigate("/login");
      return;
    }

    const completedItems = cart.filter((item) => item.status === "completed");
    console.log("Completed items:", completedItems); // Debug log
    if (completedItems.length === 0) {
      toast.error("No completed items in the cart to checkout. Please ensure items are marked as completed.");
      return;
    }

    setShowCheckoutModal(true);

    const totalAmount = completedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const orderName = completedItems[0]?.serviceName || "Multiple Services";
    let description = `Dịch vụ ${orderName.substring(0, 25)}`;
    if (description.length > 25) description = description.substring(0, 25);

    const BASE_URL = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://luluspa-production.up.railway.app";

    const returnUrl = `${BASE_URL}/success.html`;
    const cancelUrl = `${BASE_URL}/cancel.html`;


    try {
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          orderName,
          description,
          returnUrl,
          cancelUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error !== 0 || !data.data) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }

      setPaymentUrl(data.data.checkoutUrl);
      setQrCode(data.data.qrCode);
    } catch (error: any) {
      console.error("❌ Error during checkout:", error);
      toast.error("Khởi tạo thanh toán thất bại. Vui lòng thử lại.");
      setShowCheckoutModal(false);
    }
  };

  const handlePayment = async () => {
    try {
      if (!token) throw new Error("Please log in to confirm payment.");

      await Promise.all(
        cart
          .filter((item) => item.status === "completed")
          .map((item) =>
            fetch(`${API_BASE_URL}/cart/${item.CartID}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
              },
              body: JSON.stringify({ status: "checked-out" }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed to update cart item ${item.CartID}`);
            })
          )
      );

      await fetchCart();
      setShowCheckoutModal(false);
      toast.success("Thanh toán và check-out thành công!");
    } catch (error) {
      console.error("Error updating cart status:", error);
      toast.error("Lỗi khi cập nhật trạng thái thanh toán.");
    }
  };

  const handleBookNow = (id: string) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để đặt dịch vụ.");
      navigate("/login");
      return;
    }
    navigate(`/booking/${id}`);
  };

  const handleNextServices = () => {
    const maxIndex = Math.ceil(services.length / 3) - 1;
    setCurrentServiceIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0));
  };

  const handleNextTherapists = () => {
    const maxIndex = Math.ceil(therapists.length / 3) - 1;
    setCurrentTherapistIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0));
  };

  const handleViewAllBlogs = () => {
    navigate("/blog");
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.section
          key="hero"
          className="relative w-full h-screen overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <video
            src={video1}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={(e) => {
              console.error("Video failed to load:", e);
              toast.error("Video failed to load. Please try again later.");
              (e.target as HTMLVideoElement).style.display = "none";
            }}
          >
            <source src={video1} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white px-6">
            <motion.h1
              className="text-6xl font-extrabold mb-4 text-yellow-400"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Discover the Magic of LuLuSpa
            </motion.h1>
            <motion.p
              className="text-2xl font-light mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Your Skin, Our Passion
            </motion.p>
            <motion.button
              onClick={() => services.length > 0 && handleBookNow(services[0]._id)}
              className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-full text-lg font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={services.length === 0}
            >
              Book Your Luxurious Experience
            </motion.button>
          </div>
        </motion.section>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.section
          key="services"
          className="py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-12 text-center">
              Luxurious Skincare Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {services.length > 0 ? (
                services
                  .slice(currentServiceIndex * 3, (currentServiceIndex + 1) * 3)
                  .map((service) => (
                    <motion.div
                      key={service._id}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full relative"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {service.discountedPrice != null && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          {Math.round(((service.price as number) - service.discountedPrice) / (service.price as number) * 100)}% OFF
                        </span>
                      )}
                      <img
                        src={service.image || "/default-service.jpg"}
                        alt={service.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-service.jpg";
                        }}
                      />
                      <div className="p-8 flex flex-col flex-grow">
                        <h3 className="text-3xl font-semibold text-gray-800 mb-4 line-clamp-2">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-end mb-4">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-yellow-500">
                              {formatPriceDisplay(service.price, service.discountedPrice)}
                            </span>
                            <span className="text-lg text-gray-600">
                              {service.duration
                                ? `${service.duration} minutes`
                                : "Duration TBD"}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => handleBookNow(service._id)}
                            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Book Now
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              ) : (
                <p className="text-gray-600 text-center col-span-3">
                  Our luxurious services are being prepared. Please check back soon.
                </p>
              )}
            </div>
            {services.length > 3 && (
              <div className="text-center mt-12">
                <motion.button
                  onClick={handleNextServices}
                  className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Explore More Packages
                </motion.button>
              </div>
            )}
          </div>

          {/* Enhanced Therapist Section with Consistent Typography */}
          <div className="container mx-auto px-4 mt-16">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-12 text-center bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Our Skincare Experts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {loadingTherapists ? (
                <p className="text-center text-gray-600 col-span-3">Loading specialists...</p>
              ) : therapistError ? (
                <p className="text-center text-red-600 col-span-3">{therapistError}</p>
              ) : isAuthenticated && therapists.length > 0 ? (
                therapists
                  .slice(currentTherapistIndex * 3, (currentTherapistIndex + 1) * 3)
                  .map((therapist) => (
                    <motion.div
                      key={therapist.id}
                      className="relative bg-white rounded-xl overflow-hidden border-2 border-transparent bg-gradient-to-br from-yellow-50 via-white to-pink-50 p-1 flex flex-col h-full"
                      variants={therapistCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <div className="relative">
                        <img
                          src={therapist.image}
                          alt={therapist.name}
                          className="w-full h-56 object-cover rounded-t-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/default-avatar.png";
                          }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-900/30 rounded-t-lg"></div>
                      </div>
                      <div className="p-6 text-left flex flex-col flex-grow">
                        <h4 className="text-2xl font-semibold text-gray-800 mb-2 line-clamp-1">
                          {therapist.name}
                        </h4>
                        <p className="text-base text-yellow-600 font-medium mb-2">
                          Skincare Specialist
                        </p>
                        <p className="text-base text-gray-600 font-medium line-clamp-3 flex-grow">
                          {therapist.Description || "Chuyên gia tận tâm với nhiều năm kinh nghiệm trong lĩnh vực chăm sóc da."}
                        </p>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                    </motion.div>
                  ))
              ) : (
                <p className="text-gray-600 text-center col-span-3 py-12">
                  {isAuthenticated
                    ? "Our skincare experts are being prepared. Please check back soon."
                    : "Please log in to view the list of specialists."}
                </p>
              )}
            </div>
            {isAuthenticated && therapists.length > 3 && (
              <div className="text-center mt-12">
                <motion.button
                  onClick={handleNextTherapists}
                  className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Explore More Specialists
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.section
          key="blogs"
          className="py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-12 text-center">
              Latest Blog Posts
            </h2>
            {loadingBlogs ? (
              <p className="text-center text-gray-600">Loading blog list...</p>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {blogs.slice(0, 3).map((blog) => (
                    <motion.div
                      key={blog.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <img
                        src={blog.image || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-900">{blog.title}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-2">{blog.description}</p>
                        <div className="mt-4">
                          <motion.button
                            onClick={() => navigate(`/blog/${blog.id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Read More
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center">
                  <motion.button
                    onClick={handleViewAllBlogs}
                    className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    View All Blogs
                  </motion.button>
                </div>
              </>
            ) : (
              <p className="text-gray-600 text-center">No blog posts available.</p>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      <CheckoutModal
        showModal={showCheckoutModal}
        setShowModal={setShowCheckoutModal}
        cart={cart as Booking[]}
        fetchCart={fetchCart}
        loadingCart={loadingCart}
        cartError={cartError}
        paymentUrl={paymentUrl}
        setPaymentUrl={setPaymentUrl}
        qrCode={qrCode}
        setQrCode={setQrCode}
        API_BASE_URL={API_BASE_URL}
      />

      {isAuthenticated && (
        <CartComponent handleCheckout={handleCheckout} isBookingPage={false} />
      )}
    </Layout>
  );
};

export default HomePage;