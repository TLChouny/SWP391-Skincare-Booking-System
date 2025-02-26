import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getServices } from "../../api/apiService";
import Layout from "../../layout/Layout";

// Interface cho Therapist
interface Therapist {
  id: string;
  name: string;
  schedule: string[];
}

// Interface cho Service
interface Service {
  id: string;
  name: string;
  description: string;
  image?: string;
  duration?: number;
  price?: number;
}

// Interface cho Booking (dữ liệu trong giỏ hàng)
interface Booking {
  service: Service;
  customerName: string;
  customerPhone: string;
  selectedDate: string;
  selectedTherapist: Therapist;
  selectedSlot: string;
  timestamp: number;
  status: "pending" | "completed";
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showCart, setShowCart] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [cart, setCart] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getServices();
        const foundService = response.data.find((s: Service) => s.id === id);
        setService(foundService || null);
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTherapists = async () => {
      try {
        const response = await fetch("https://666c0b8749dbc5d7145c5890.mockapi.io/api/therapist");
        const data: Therapist[] = await response.json();
        setTherapists(data);
      } catch (error) {
        console.error("Error fetching therapists:", error);
      }
    };

    fetchService();
    fetchTherapists();

    const storedCart: Booking[] = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    const latestPendingBooking = storedCart.find((item) => item.status === "pending");
    if (latestPendingBooking) {
      const timeElapsed = Math.floor((Date.now() - latestPendingBooking.timestamp) / 1000);
      const initialTimeLeft = 600 - timeElapsed;
      if (initialTimeLeft > 0) {
        setTimeLeft(initialTimeLeft);
      } else {
        localStorage.removeItem("cart");
        setCart([]);
        setTimeLeft(null);
      }
    } else if (storedCart.length > 0) {
      setTimeLeft(null);
      setPaymentSuccess(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem("cart");
          setCart([]);
          setShowCart(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  const handleTherapistSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const therapistId = event.target.value;
    const therapist = therapists.find((t) => t.id === therapistId) || null;
    setSelectedTherapist(therapist);
    setSchedule(therapist?.schedule || []);
    setSelectedSlot(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName || !customerPhone || !selectedDate || !selectedTherapist || !selectedSlot || !service) {
      alert("Please fill in all fields before booking.");
      return;
    }

    const bookingData: Booking = {
      service,
      customerName,
      customerPhone,
      selectedDate,
      selectedTherapist,
      selectedSlot,
      timestamp: Date.now(),
      status: "pending"
    };

    const updatedCart = [...cart, bookingData];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setShowCart(true);
    setTimeLeft(600);
    setPaymentSuccess(false);
  };

  const toggleCart = () => setShowCart(!showCart);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "Hết giờ";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckoutModal(true);
  };

  const handlePayment = () => {
    const updatedCart = cart.map((item) => ({ ...item, status: "completed" } as Booking));
    
    const bookingHistory: Booking[] = JSON.parse(localStorage.getItem("bookingHistory") || "[]");
    localStorage.setItem("bookingHistory", JSON.stringify([...bookingHistory, ...updatedCart]));
    
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setShowCheckoutModal(false);
    setShowCart(true);
    setPaymentSuccess(true);
    setTimeLeft(null);
  };

  return (
    <Layout>
      <div className="container mx-auto py-16 relative">
        <h2 className="text-4xl font-bold text-center mb-10">Booking Service</h2>

        <button
          onClick={toggleCart}
          className="fixed top-20 right-4 p-2 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        {showCart && (
          <div className="fixed top-28 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-10">
            <h3 className="text-lg font-semibold mb-2">Giỏ hàng</h3>
            {timeLeft !== null && !paymentSuccess && (
              <p className="text-red-500 mb-2">
                Thời gian còn lại: {formatTime(timeLeft)}
              </p>
            )}
            {paymentSuccess && (
              <p className="text-green-500 mb-2">
                Đặt dịch vụ thành công! Xem lại thông tin bên dưới.
              </p>
            )}
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div key={index} className="mb-2 border-b pb-2">
                  <p><strong>Dịch vụ:</strong> {item.service.name}</p>
                  <p><strong>Thời gian:</strong> {item.selectedDate} - {item.selectedSlot}</p>
                  <p><strong>Therapist:</strong> {item.selectedTherapist.name}</p>
                  {timeLeft === null && !paymentSuccess && (
                    <p className="text-red-500">Dịch vụ bị hủy (hết giờ)</p>
                  )}
                  {item.status === "completed" && (
                    <p className="text-green-500">Đã thanh toán</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">Giỏ hàng trống hoặc dịch vụ đã bị hủy.</p>
            )}
            {timeLeft !== null && !paymentSuccess && (
              <button
                onClick={handleCheckout}
                className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-2"
              >
                Thanh toán
              </button>
            )}
            <button
              onClick={toggleCart}
              className="w-full p-2 bg-gray-300 rounded-lg mt-2"
            >
              Đóng
            </button>
          </div>
        )}

        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-2xl font-semibold mb-4">Xác nhận thanh toán</h3>
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p><strong>{item.service.name}</strong></p>
                      <p>{item.selectedDate} - {item.selectedSlot}</p>
                      <p>Therapist: {item.selectedTherapist.name}</p>
                    </div>
                    <span>${item.service.price}</span>
                  </li>
                ))}
              </ul>
              <div className="text-right text-lg font-bold mt-4">
                Tổng cộng: ${cart.reduce((sum, item) => sum + (item.service.price || 0), 0)}
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePayment}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thanh toán ngay
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0">
            {loading ? (
              <p className="text-lg text-gray-600">Loading service details...</p>
            ) : service ? (
              <>
                <h3 className="text-2xl font-semibold mb-4">{service.name}</h3>
                <img src={service.image} alt={service.name} className="w-full h-auto rounded-lg shadow-lg mb-6" />
                <p className="text-lg text-gray-600 mb-4">{service.description}</p>
                <p className="text-xl font-bold text-gray-900">Price: ${service.price}</p>
                <p className="text-lg text-gray-600">Duration: {service.duration} minutes</p>
              </>
            ) : (
              <p className="text-lg text-red-600">Service not found. Please try again.</p>
            )}
          </div>

          <div className="w-full lg:w-2/3 px-4">
            <h3 className="text-2xl font-semibold mb-4">Booking Form</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg text-gray-700">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Choose Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Select Therapist</label>
                <select
                  onChange={handleTherapistSelect}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Choose a therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTherapist && schedule.length > 0 ? (
                <div>
                  <h4 className="text-xl font-semibold mb-2">Available Time Slots</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {schedule.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`p-2 border rounded-lg ${selectedSlot === slot ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedTherapist ? (
                <p className="text-gray-600">No available time slots for this therapist.</p>
              ) : null}
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
      </div>
    </Layout>
  );
};

export default BookingPage;