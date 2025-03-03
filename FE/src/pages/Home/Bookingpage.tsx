"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getTherapists } from "../../api/apiService";
import Layout from "../../layout/Layout";

interface Service {
  _id: string;
  service_id: number;
  name: string;
  description: string;
  image?: string;
  duration?: number;
  price?: number | { $numberDecimal: string };
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

interface Booking {
  service: Service;
  customerName: string;
  customerPhone: string;
  selectedDate: string;
  selectedSlot: string;
  selectedTherapist: Therapist | null;
  timestamp: number;
  status: "pending" | "confirmed" | "completed";
}

const EnhancedBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [cart, setCart] = useState<Booking[]>([]);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch("http://localhost:5000/api/products/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const productsData = await productsResponse.json();
        const foundService = productsData.find((s: Service) => s._id === id);
        setService(foundService || null);

        const therapistsResponse = await getTherapists();
        setTherapists(therapistsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Could not load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const storedCart: Booking[] = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, [id]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName || !customerPhone || !selectedDate || !selectedSlot || !service) {
      alert("Please fill in all required fields before booking.");
      return;
    }

    const bookingData: Booking = {
      service,
      customerName,
      customerPhone,
      selectedDate,
      selectedSlot,
      selectedTherapist,
      timestamp: Date.now(),
      status: "pending",
    };

    const updatedCart = [...cart, bookingData];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setShowCart(true);
  };

  const toggleCart = () => setShowCart(!showCart);

  const handleCheckout = async () => {
    setShowCart(false);
    setShowCheckoutModal(true);

    const totalAmount = calculateTotal() ;
    const orderName = `Booking_${Date.now()}`;
    let description = `Dịch vụ ${orderName}`;

    if (description.length > 25) {
      description = description.substring(0, 25);
    }

    const returnUrl = "http://localhost:5000/success.html";
    const cancelUrl = "http://localhost:5000/cancel.html";

    try {
      const response = await fetch(
        "http://localhost:5000/api/payments/create",
        {
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
        }
      );

      const data = await response.json();
      console.log("🔍 API Response:", data);

      if (!response.ok || data.error !== 0 || !data.data) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }

      setPaymentUrl(data.data.checkoutUrl);
      setQrCode(data.data.qrCode);
    } catch (error: any) {
      console.error("❌ Error during checkout:", error);

      let errorMessage = "Payment initiation failed.";
      if (error.message.includes("API Error")) {
        errorMessage += ` ${error.message}`;
      } else {
        errorMessage += " Please check your connection and try again.";
      }

      alert(errorMessage);
      setShowCheckoutModal(false); // Đóng modal thanh toán nếu lỗi xảy ra
    }
  };


  const handlePayment = () => {
    const updatedCart = cart.map((item) => ({ ...item, status: "completed" } as Booking));
    const bookingHistory: Booking[] = JSON.parse(localStorage.getItem("bookingHistory") || "[]");
    localStorage.setItem("bookingHistory", JSON.stringify([...bookingHistory, ...updatedCart]));
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setShowCheckoutModal(false);
    setShowCart(true);
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatPrice = (price: number | { $numberDecimal: string } | undefined): string => {
    let priceValue = 0;
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    } else if (typeof price === "string") {
      // Phân tích chuỗi thủ công mà không dùng replace hoặc split
      priceValue = parsePriceFromString(price); // Gọi hàm parsePriceFromString
    } else {
      priceValue = 0; // Giá trị mặc định nếu undefined
    }
    return `${priceValue.toLocaleString("vi-VN")} VNĐ`;
  };

  const calculateTotal = (): number => {
    const total = cart
      .filter((item) => item.status === "confirmed")
      .reduce((sum, item) => {
        const priceStr = formatPrice(item.service.price); // Đảm bảo luôn là string
        if (priceStr) {
          const priceValue = parsePriceFromString(priceStr); // Trích xuất số
          return sum + (priceValue || 0);
        }
        return sum;
      }, 0);
    return total; // Chia 100000 để đồng bộ với logic cũ nếu cần
  };

  // Hàm phụ trợ để trích xuất số từ chuỗi định dạng tiền tệ mà không dùng replace hoặc split
  const parsePriceFromString = (priceStr: string): number => {
    // Loại bỏ tất cả ký tự không phải số và "VNĐ"
    const numMatch = priceStr.match(/\d+/g); // Lấy tất cả chuỗi số
    if (numMatch && numMatch.length > 0) {
      return Number.parseInt(numMatch.join(""), 10) || 0; // Chuyển chuỗi số thành số nguyên
    }
    return 0; // Giá trị mặc định nếu không tìm thấy số
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal(); // Nhân lại để lấy giá trị gốc
    return `${totalValue.toLocaleString("vi-VN")} VNĐ`;
  };

  const isAllServicesConfirmed = () => {
    return cart.every((item) => item.status === "confirmed" || item.status === "completed");
  };

  const isAllServicesCompleted = () => {
    return cart.every((item) => item.status === "completed");
  };

  const simulateStaffConfirmation = (bookingIndex: number) => {
    const updatedCart = [...cart];
    updatedCart[bookingIndex].status = "confirmed";
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart([]);
    setShowCart(false);
  };

  const toggleExpand = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto py-16 relative"
      >
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Book Your Service
        </h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCart}
          className="fixed top-28 right-4 p-3 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 transition-colors duration-300"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-36 right-4 bg-white p-6 rounded-lg shadow-xl max-w-md w-80 md:w-96 h-[calc(100vh-160px)] z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Your Cart</h3>
                {cart.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCart}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Clear Cart
                  </motion.button>
                )}
              </div>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 border-b pb-2"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <p className="font-semibold text-gray-800">{item.service.name}</p>
                      <span>{expandedItems.has(index) ? "−" : "+"}</span>
                    </div>
                    <AnimatePresence>
                      {expandedItems.has(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 text-gray-600"
                        >
                          <p>Date: {item.selectedDate} - {item.selectedSlot}</p>
                          {item.selectedTherapist && (
                            <p>Therapist: {item.selectedTherapist.name}</p>
                          )}
                          <p
                            className={`${
                              item.status === "completed"
                                ? "text-green-500"
                                : item.status === "confirmed"
                                ? "text-blue-500"
                                : "text-yellow-500"
                            }`}
                          >
                            Status: {item.status}
                          </p>
                          {item.status === "pending" && (
                            <button
                              onClick={() => simulateStaffConfirmation(index)}
                              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                            >
                              Simulate Staff Confirmation
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600">Your cart is empty.</p>
              )}
              {cart.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout}
                  disabled={!isAllServicesConfirmed() || isAllServicesCompleted()}
                  className={`w-full p-3 rounded-lg transition-colors duration-300 mt-4 ${
                    isAllServicesConfirmed() && !isAllServicesCompleted()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Proceed to Checkout
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 mt-2"
              >
                Close
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                  Confirm Payment
                </h3>
                <ul className="space-y-4">
                  {cart
                    .filter((item) => item.status === "confirmed")
                    .map((item, index) => (
                      <li key={index} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-semibold text-gray-800">{item.service.name}</p>
                          <p className="text-gray-600">{item.selectedDate} - {item.selectedSlot}</p>
                          {item.selectedTherapist && (
                            <p className="text-gray-600">Therapist: {item.selectedTherapist.name}</p>
                          )}
                        </div>
                        <span className="font-bold text-gray-800">{formatPrice(item.service.price)}</span>
                      </li>
                    ))}
                </ul>
                <div className="text-right text-xl font-bold mt-6 text-gray-800">
                  Total: {formatTotal()}
                </div>
                <div className="mt-6">
                  <p className="text-lg font-semibold mb-2">Scan QR Code to Pay:</p>
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
                    className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePayment}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Confirm Payment
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap -mx-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-600">Loading service details...</p>
              </div>
            ) : service ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">{service.name}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xl font-semibold text-yellow-500">
                        Price: {formatPrice(service.price)}
                      </p>
                      <p className="text-lg text-gray-600">
                        Duration: {service.duration || "N/A"} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
                <p className="text-lg text-red-600">Service not found. Please try again.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-2/3 px-4"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-800">Booking Form</h3>
            <form className="space-y-6 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {generateTimeSlots().map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 border rounded-lg transition-colors duration-300 ${
                        selectedSlot === slot ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Therapist (Optional)</label>
                <select
                  value={selectedTherapist ? selectedTherapist.id : ""}
                  onChange={(e) => {
                    const therapist = therapists.find((t) => t.id === e.target.value);
                    setSelectedTherapist(therapist || null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                >
                  <option value="">Select a therapist (optional)</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
              >
                Book Now
              </motion.button>
            </form>
            <p className="mt-6 text-gray-600 italic">
              Note: If you don't select a therapist, one will be assigned to you upon check-in at our facility.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default EnhancedBookingPage;