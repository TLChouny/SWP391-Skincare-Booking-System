"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layout/Layout";
import CartComponent from "../../components/Cart/CartComponent";
import { useAuth } from "../../context/AuthContext";
import { Service, Therapist, Booking, Rating } from "../../types/booking";
import { JSX } from "react/jsx-runtime";

const EnhancedBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cart, fetchCart, user, token, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTherapists, setLoadingTherapists] = useState<boolean>(false);
  const [therapistError, setTherapistError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>(
    user?.username || user?.email || ""
  );
  const [notes, setNotes] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState<boolean>(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [filterRating, setFilterRating] = useState<string>("All"); // State cho bộ lọc sao
  const reviewsPerPage = 3;

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);
  }, []);

  useEffect(() => {
    setCustomerEmail(user?.email || user?.username || "");
  }, [user]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !selectedTherapist) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/cart/booked-slots?date=${encodeURIComponent(
            selectedDate
          )}&staff=${encodeURIComponent(selectedTherapist.name)}`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        setBookedSlots(data || []);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, selectedTherapist]);

  const addToCart = async (bookingData: any) => {
    try {
      if (!token) {
        throw new Error("You need to log in to add to cart.");
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to add to cart: ${response.status} - ${
            errorData.message || "Bad Request"
          }`
        );
      }

      await fetchCart();
      toast.success("Service added to cart successfully.");
    } catch (error: any) {
      console.error("Error adding to cart:", error.message);
      toast.error(error.message || "Failed to add to cart.");
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!customerName.trim()) errors.push("Customer name is required.");
    if (!customerPhone.trim() || !/^\d{10}$/.test(customerPhone))
      errors.push("Phone number must be a valid 10-digit number.");
    if (
      !customerEmail.trim() ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customerEmail)
    )
      errors.push("Email must be in a valid format.");
    if (!selectedDate) errors.push("Please select a booking date.");
    if (!selectedSlot) errors.push("Please select a time slot.");

    if (errors.length > 0) {
      toast.error(errors.join(" "));
      return false;
    }
    return true;
  };

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

    if (isNaN(priceValue)) priceValue = 0;

    return (
      <>
        <span
          style={{
            textDecoration: discountedPrice != null ? "line-through" : "none",
          }}
        >
          {priceValue.toLocaleString("en-US")} VNĐ
        </span>
        {discountedPrice != null && (
          <span style={{ color: "green", marginLeft: "8px" }}>
            {discountedPrice.toLocaleString("en-US")} VNĐ
          </span>
        )}
      </>
    );
  };

  const calculateTotal = (): number => {
    return cart
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("en-US")} VNĐ`;
  };

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const today = getTodayDate();
    const isToday = selectedDate === today;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slot = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        if (isToday) {
          const slotHour = parseInt(slot.split(":")[0]);
          const slotMinute = parseInt(slot.split(":")[1]);

          if (
            slotHour < currentHour ||
            (slotHour === currentHour && slotMinute < currentMinute)
          ) {
            continue;
          }
        }

        if (!bookedSlots.includes(slot)) {
          slots.push(slot);
        }
      }
    }

    return slots;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to proceed with checkout.");
      return;
    }

    const completedItems = cart.filter((item) => item.status === "completed");
    if (completedItems.length === 0) {
      toast.error("No completed items in the cart to checkout.");
      return;
    }

    setShowCheckoutModal(true);

    const totalAmount = completedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    const orderName = completedItems[0]?.serviceName || "Multiple Services";
    let description = `Service ${orderName.substring(0, 25)}`;
    if (description.length > 25) description = description.substring(0, 25);

    const BASE_URL =
      window.location.hostname === "localhost"
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
      toast.error("Failed to initiate payment. Please try again.");
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
              if (!res.ok)
                throw new Error(`Failed to update cart item ${item.CartID}`);
            })
          )
      );

      await fetchCart();
      setShowCheckoutModal(false);
      toast.success("Payment and checkout completed successfully!");
    } catch (error) {
      console.error("Error updating cart status:", error);
      toast.error("Error updating payment status.");
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!id) {
          throw new Error("Service ID is missing.");
        }
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`Failed to fetch service: ${response.status}`);
        const serviceData = await response.json();
        setService(serviceData || null);
      } catch (error) {
        console.error("Error fetching service data:", error);
        toast.error("Failed to load service.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
    if (isAuthenticated) fetchCart();
  }, [id, isAuthenticated, fetchCart]);

  useEffect(() => {
    const fetchTherapists = async () => {
      if (!token) {
        setTherapistError("You are not logged in.");
        toast.error("You are not logged in.");
        return;
      }
      setLoadingTherapists(true);
      setTherapistError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch therapists: ${response.status} - ${
              errorData.message || "Unknown error"
            }`
          );
        }
        const data = await response.json();
        setTherapists(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username || staff.name || "Unknown",
            image: staff.avatar || "/default-avatar.png",
          }))
        );
      } catch (error: any) {
        console.error("Error fetching therapists:", error.message);
        setTherapistError(`Failed to load therapists: ${error.message}`);
        toast.error(`Failed to load therapists: ${error.message}`);
      } finally {
        setLoadingTherapists(false);
      }
    };

    if (isAuthenticated) fetchTherapists();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (service?.name) {
      const fetchRatings = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/ratings/service/${encodeURIComponent(
              service.name
            )}`
          );
          if (!response.ok) {
            throw new Error("Failed to load reviews.");
          }
          const data = await response.json();
          setRatings(data);
        } catch (error) {
          // console.error("Error fetching reviews:", error);
          // toast.error("Failed to load reviews.");
        } finally {
          setLoadingRatings(false);
        }
      };
      fetchRatings();
    }
  }, [service]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !service || !user?.username) {
      toast.error("Please fill in all required information!");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      toast.error("Invalid booking date!");
      return;
    }

    const totalPrice =
      service.discountedPrice ??
      (typeof service.price === "number"
        ? service.price
        : service.price
        ? parseFloat(service.price)
        : 0);

    const bookingData = {
      username: user.username,
      service_id: service.service_id,
      serviceName: service.name,
      bookingDate: selectedDate,
      startTime: selectedSlot!,
      customerName,
      customerEmail,
      customerPhone,
      notes: notes || undefined,
      Skincare_staff: selectedTherapist ? selectedTherapist.name : undefined,
      totalPrice,
      status: "pending",
    };

    await addToCart(bookingData);

    setSelectedDate("");
    setSelectedSlot(null);
  };

  // Logic lọc và phân trang cho đánh giá
  const filteredRatings =
    filterRating === "All"
      ? ratings
      : ratings.filter((rating) => rating.serviceRating === Number(filterRating));

  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredRatings.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(filteredRatings.length / reviewsPerPage);

  const handleReviewPageChange = (page: number) => {
    setCurrentReviewPage(page);
  };

  return (
    <Layout>
      <motion.div className="container mx-auto py-16 px-6 bg-gray-50 min-h-screen">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Book Your Service
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-white-500 rounded mx-auto"></div>
        </motion.h2>

        {isAuthenticated && (
          <CartComponent handleCheckout={handleCheckout} isBookingPage={true} />
        )}

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
                className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                  Confirm Payment
                </h3>
                <ul className="space-y-4">
                  {cart
                    .filter((item) => item.status === "completed")
                    .map((item, index) => (
                      <li
                        key={item.CartID || index}
                        className="flex justify-between py-2 border-b"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.serviceName}
                          </p>
                          <p className="text-gray-600">
                            {item.bookingDate} - {item.startTime}
                          </p>
                          {item.Skincare_staff && (
                            <p className="text-gray-600">
                              Therapist: {item.Skincare_staff}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-gray-800">
                          {formatPriceDisplay(
                            item.originalPrice || item.totalPrice || 0,
                            item.discountedPrice
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
                <div className="text-right text-xl font-bold mt-6 text-gray-800">
                  Total: {formatTotal()}
                </div>
                {qrCode && (
                  <div className="mt-6 text-center">
                    <p className="text-lg font-semibold mb-2">
                      Scan QR Code to Pay:
                    </p>
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="mx-auto max-w-[180px]"
                    />
                  </div>
                )}
                <p className="mt-4 text-blue-600 text-center">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to pay if QR code doesn't work
                  </a>
                </p>
                <div className="flex justify-end mt-8 space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCheckoutModal(false)}
                    className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800 font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap -mx-4">
          {/* Cột trái: Thông tin dịch vụ + Đánh giá */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0"
          >
            {/* Thông tin dịch vụ */}
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl shadow-lg">
                <p className="text-lg text-gray-600">Loading service details...</p>
              </div>
            ) : service ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={service.image || "/default-service.jpg"}
                  alt={service.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-service.jpg";
                  }}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xl font-semibold text-yellow-500">
                        Price:{" "}
                        {formatPriceDisplay(
                          service.price,
                          service.discountedPrice
                        )}
                      </p>
                      <p className="text-lg text-gray-600">
                        Duration: {service.duration || "N/A"} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-red-100 rounded-xl shadow-lg">
                <p className="text-lg text-red-600">
                  Service not found. Please try again.
                </p>
              </div>
            )}

            {/* Đánh giá */}
            <motion.div
              className="mt-8 bg-white p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                Customer Reviews
              </h3>
              {/* Bộ lọc sao */}
              <div className="mb-4">
                {/* <label className="block text-lg font-medium text-gray-700 mb-2">
                  Filter by Rating:
                </label> */}
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(e.target.value);
                    setCurrentReviewPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars ⭐</option>
                  <option value="4">4 Stars  ⭐</option>
                  <option value="3">3 Stars ⭐</option>
                  <option value="2">2 Stars ⭐</option>
                  <option value="1">1 Star ⭐</option>
                </select>
              </div>

              {loadingRatings ? (
                <p className="text-gray-600 text-center">Loading reviews...</p>
              ) : filteredRatings.length === 0 ? (
                <p className="text-gray-600 text-center">
                  No reviews match this rating.
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentReviews.map((rating) => (
                      <motion.div
                        key={rating._id}
                        className="p-4 border rounded-lg shadow-md bg-gray-50 hover:bg-gray-100 transition duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="font-bold text-lg text-blue-600">
                          {rating.createName}
                        </p>
                        <p className="text-yellow-500 text-lg">
                          Rating: {rating.serviceRating} ⭐
                        </p>
                        <p className="text-gray-600 mt-2">{rating.serviceContent}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Phân trang */}
                  {filteredRatings.length > reviewsPerPage && (
                    <div className="flex justify-center mt-6">
                      <motion.button
                        onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                        disabled={currentReviewPage === 1}
                        className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ←
                      </motion.button>
                      {Array.from({ length: totalReviewPages }, (_, i) => (
                        <motion.button
                          key={i + 1}
                          onClick={() => handleReviewPageChange(i + 1)}
                          className={`mx-2 w-10 h-10 rounded-full ${
                            currentReviewPage === i + 1
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                        disabled={currentReviewPage === totalReviewPages}
                        className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        →
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Cột phải: Form đặt lịch */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3 px-4"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-800">
              Booking Form
            </h3>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-8 rounded-xl shadow-lg"
            >
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                  }}
                  min={getTodayDate()}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {generateTimeSlots().map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 border rounded-lg text-lg font-medium transition ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Choose Therapist (Optional)
                </label>
                {loadingTherapists ? (
                  <p className="text-gray-600">Loading therapists...</p>
                ) : therapistError ? (
                  <p className="text-red-600">{therapistError}</p>
                ) : (
                  <select
                    value={selectedTherapist ? selectedTherapist.id : ""}
                    onChange={(e) => {
                      const therapist = therapists.find(
                        (t) => t.id === e.target.value
                      );
                      setSelectedTherapist(therapist || null);
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={therapists.length === 0}
                  >
                    <option value="">
                      {therapists.length > 0
                        ? "Select a therapist"
                        : "No therapists available"}
                    </option>
                    {therapists.map((therapist) => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows={3}
                />
              </div>
              <motion.button
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-yellow-600 to-white-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition duration-300"
                disabled={!isAuthenticated}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default EnhancedBookingPage; 