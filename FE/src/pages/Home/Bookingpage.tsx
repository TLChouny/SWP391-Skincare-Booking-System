"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layout/Layout";
import CartComponent from "../../components/Cart/CartComponent";

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
  status: "pending" | "checked-in" | "completed" | "cancelled"; // Đồng bộ với CartComponent và HomePage
  action?: "checkin" | "checkout" | null; // Thêm action để đồng bộ
}

const EnhancedBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [cart, setCart] = useState<Booking[]>([]);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const API_BASE_URL = "http://localhost:5000/api";

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);
  }, []);

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
      console.log("Cart data from server:", data);
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Không thể tải giỏ hàng.");
    }
  };

  const addToCart = async (bookingData: any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn cần đăng nhập để thêm vào giỏ hàng.");
      }

      console.log("Booking data gửi lên server:", JSON.stringify(bookingData, null, 2));

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
          `Failed to add to cart: ${response.status} - ${errorData.message || "Bad Request"}`
        );
      }

      const result = await response.json();
      console.log("Response from add to cart:", result);
      await fetchCart();
      toast.success("Đã thêm dịch vụ vào giỏ hàng.");
    } catch (error: any) {
      console.error("Error adding to cart:", error.message);
      toast.error(error.message || "Không thể thêm vào giỏ hàng.");
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!customerName.trim()) errors.push("Tên khách hàng không được để trống.");
    if (!customerPhone.trim() || !/^\d{10}$/.test(customerPhone))
      errors.push("Số điện thoại phải là 10 chữ số hợp lệ.");
    if (
      !customerEmail.trim() ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customerEmail)
    )
      errors.push("Email phải có định dạng hợp lệ.");
    if (!selectedDate) errors.push("Vui lòng chọn ngày đặt lịch.");
    if (!selectedSlot) errors.push("Vui lòng chọn khung giờ.");

    if (errors.length > 0) {
      toast.error(errors.join(" "));
      return false;
    }
    return true;
  };

  const formatPrice = (price?: number | { $numberDecimal: string }): string => {
    let priceValue = 0;
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    }
    return `${priceValue.toLocaleString("vi-VN")} VNĐ`;
  };

  const calculateTotal = (): number => {
    return cart
      .filter((item) => item.status === "checked-in")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("vi-VN")} VNĐ`;
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
            slotHour > currentHour ||
            (slotHour === currentHour && slotMinute > currentMinute)
          ) {
            slots.push(slot);
          }
        } else {
          slots.push(slot);
        }
      }
    }
    return slots;
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.warning("Please log in to proceed with checkout.");
      return;
    }

    const pendingItems = cart.filter((item) => item.status === "checked-in");
    if (pendingItems.length === 0) {
      toast.error("No pending items in the cart to checkout.");
      return;
    }

    setShowCheckoutModal(true);

    const totalAmount = calculateTotal();
    const orderName = service?.name || "Unknown Service";
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
    } catch (error) {
      console.error("Error updating cart status:", error);
      toast.error("Lỗi khi cập nhật trạng thái thanh toán.");
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Failed to fetch service: ${response.status}`);
        const productsData = await response.json();
        const foundService = productsData.find((s: Service) => s._id === id);
        setService(foundService || null);
      } catch (error) {
        console.error("Error fetching service data:", error);
        toast.error("Không thể tải dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
    if (isLoggedIn) fetchCart();
    else setCart([]);
  }, [id, isLoggedIn]);

  useEffect(() => {
    const fetchTherapists = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Bạn chưa đăng nhập.");
        return;
      }
      try {
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
        toast.error("Không thể tải danh sách chuyên viên.");
      }
    };

    if (isLoggedIn) fetchTherapists();
  }, [isLoggedIn]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !service) return;

    const bookingData = {
      service_id: service.service_id,
      startTime: selectedSlot,
      customerName,
      customerEmail,
      customerPhone,
      notes: notes || undefined,
      Skincare_staff: selectedTherapist?.id || undefined,
      discountCode: undefined,
    };

    await addToCart(bookingData);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSelectedTherapist(null);
  };

  return (
    <Layout>
      <motion.div className="container mx-auto py-16 relative">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">Book Your Service</h2>

        {/* Chỉ hiển thị CartComponent khi đăng nhập */}
        {isLoggedIn && (
          <CartComponent
            cart={cart}
            setCart={setCart}
            fetchCart={fetchCart}
            handleCheckout={handleCheckout}
            isBookingPage={true}
          />
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

        <div className="flex flex-wrap -mx-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
            className="w-full lg:w-2/3 px-4"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-800">Booking Form</h3>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
              <div>
                <label className="block text-lg text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {generateTimeSlots().map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 border rounded-lg ${
                        selectedSlot === slot ? "bg-blue-500 text-white" : "bg-gray-100"
                      }`}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">
                  Choose Therapist (Optional)
                </label>
                <select
                  value={selectedTherapist ? selectedTherapist.id : ""}
                  onChange={(e) => {
                    const therapist = therapists.find((t) => t.id === e.target.value);
                    setSelectedTherapist(therapist || null);
                  }}
                  className="w-full p-3 border rounded-lg"
                  disabled={therapists.length === 0}
                >
                  <option value="">
                    {therapists.length > 0 ? "Select a therapist" : "No therapists available"}
                  </option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                />
              </div>
              <motion.button
                type="submit"
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!isLoggedIn}
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