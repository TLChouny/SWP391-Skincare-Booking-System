import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../layout/Layout";
import CartComponent from "../../components/Cart/CartComponent";
import { toast } from "react-toastify";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";

interface Service {
  _id: string;
  service_id: number;
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

interface Therapist {
  id: string;
  name: string;
  image?: string;
}

interface Blog {
  id: number;
  title: string;
  author: string;
  description: string;
  image?: string;
  content?: string;
}

interface Booking {
  CartID?: string;
  service_id: number;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  selectedTherapist?: Therapist | null;
  Skincare_staff?: string;
  totalPrice?: number;
  status: "pending" | "checked-in" | "completed" | "cancelled"; // Đồng bộ với CartComponent
  action?: "checkin" | "checkout" | null; // Thêm action để đồng bộ
}

// Animation variants
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

const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [cart, setCart] = useState<Booking[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loadingBlogs, setLoadingBlogs] = useState<boolean>(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5000/api";

  // Check login status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);
  }, []);

  // Fetch services
  useEffect(() => {
    fetch(`${API_BASE_URL}/products/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
        }
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        toast.error("Unable to load service list. Please try again later.");
      });
  }, []);

  // Fetch therapists (skincare_staff) only when logged in
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
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
          }))
        );
      } catch (error) {
        console.error("Error fetching therapists:", error);
        toast.error("Unable to load specialist list. Please try again later.");
      }
    };

    if (isLoggedIn) fetchTherapists();
  }, [isLoggedIn]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) setBlogs(data);
        else {
          console.error("Invalid data returned:", data);
          setBlogs([]);
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

  // Fetch cart (only when logged in)
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchCart();
    else setCart([]);
  }, [isLoggedIn]);

  // Calculate total price of pending items
  const calculateTotal = (): number => {
    return cart
      .filter((item) => item.status === "checked-in")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("vi-VN")} VNĐ`;
  };

  // Handle checkout logic (for customer, only pending items)
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.warning("Please log in to proceed with checkout.");
      navigate("/login");
      return;
    }

    const pendingItems = cart.filter((item) => item.status === "checked-in");
    if (pendingItems.length === 0) {
      toast.error("No pending items in the cart to checkout.");
      return;
    }

    setShowCheckoutModal(true);

    const totalAmount = calculateTotal();
    const orderName = pendingItems[0]?.serviceName || "Multiple Services";
    let description = `Dịch vụ ${orderName.substring(0, 25)}`;
    if (description.length > 25) description = description.substring(0, 25);

    const returnUrl = "http://localhost:5000/success.html";
    const cancelUrl = "http://localhost:5000/cancel.html";

    try {
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Handle payment confirmation (for customer)
  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to confirm payment.");

      await Promise.all(
        cart
          .filter((item) => item.status === "pending")
          .map((item) =>
            fetch(`${API_BASE_URL}/cart/${item.CartID}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
              },
              body: JSON.stringify({ status: "completed", action: null }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed to update cart item ${item.CartID}`);
            })
          )
      );

      await fetchCart();
      setShowCheckoutModal(false);
      toast.success("Thanh toán thành công!");
      navigate("/"); // Optional: redirect to confirmation page
    } catch (error) {
      console.error("Error updating cart status:", error);
      toast.error("Lỗi khi cập nhật trạng thái thanh toán.");
    }
  };

  const handleBookNow = (id: string) => {
    navigate(`/booking/${id}`);
  };

  const handleNext = () => {
    const maxIndex = Math.ceil(services.length / 3) - 1;
    setCurrentServiceIndex((prevIndex) =>
      prevIndex < maxIndex ? prevIndex + 1 : 0
    );
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
            onError={(e) => console.error("Video failed to load:", e)}
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
                      className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <img
                        src={service.image || "/default-service.jpg"}
                        alt={service.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-service.jpg";
                        }}
                      />
                      <div className="p-8">
                        <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-6">{service.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-yellow-500">
                              {service.price
                                ? `${service.price.toLocaleString("vi-VN")} VNĐ`
                                : "Contact for Price"}
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
                  onClick={handleNext}
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
          <div className="container mx-auto px-4 mt-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Skincare Experts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {isLoggedIn && therapists.length > 0 ? (
                therapists.map((therapist) => (
                  <motion.div
                    key={therapist.id}
                    className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-avatar.png";
                      }}
                    />
                    <div className="p-6 text-center">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {therapist.name}
                      </h4>
                      <p className="text-gray-600">Skincare Specialist</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-3">
                  {isLoggedIn
                    ? "Our skincare experts are being prepared. Please check back soon."
                    : "Please log in to view the list of specialists."}
                </p>
              )}
            </div>
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

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Confirm Payment</h3>
              <ul className="space-y-4">
                {cart
                  .filter((item) => item.status === "pending")
                  .map((item, index) => (
                    <li key={item.CartID || index} className="flex justify-between py-2 border-b">
                      <div>
                        <p className="font-semibold text-gray-800">{item.serviceName}</p>
                        <p className="text-gray-600">{item.bookingDate} - {item.startTime}</p>
                        {item.Skincare_staff && (
                          <p className="text-gray-600">Therapist ID: {item.Skincare_staff}</p>
                        )}
                      </div>
                      <span className="font-bold text-gray-800">
                        {item.totalPrice?.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </li>
                  ))}
              </ul>
              <div className="text-right text-xl font-bold mt-6 text-gray-800">
                Total: {formatTotal()}
              </div>
              <div className="mt-6">
                <p className="text-lg font-semibold mb-2">Scan QR Code to Pay:</p>
                {/* Uncomment and install QRCode package if needed */}
                {/* <QRCode value={paymentUrl} size={200} className="mx-auto" /> */}
              </div>
              <p className="mt-4 text-blue-600 text-center">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  Click here to pay if QR code doesn't work
                </a>
              </p>
              <div className="flex justify-end mt-8 space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePayment}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Payment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Only display CartComponent when logged in */}
      {isLoggedIn && (
        <CartComponent
          cart={cart}
          setCart={setCart}
          fetchCart={fetchCart}
          handleCheckout={handleCheckout}
          isBookingPage={false}
        />
      )}
    </Layout>
  );
};

export default HomePage;