import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<Booking[]>([]);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart: Booking[] = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    if (storedCart.length === 0) {
      navigate("/booking");
    }
  }, [navigate]);

  const handlePayment = () => {
    const updatedCart: Booking[] = cart.map(item => ({ ...item, status: "completed" }));
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    setIsPaid(true);
    setTimeout(() => {
      localStorage.removeItem("cart");
      navigate("/");
    }, 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto py-16">
        <h2 className="text-4xl font-bold text-center mb-10">Checkout</h2>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          {cart.length === 0 ? (
            <p className="text-center text-gray-600">Giỏ hàng của bạn đang trống.</p>
          ) : isPaid ? (
            <>
              <p className="text-center text-green-500 text-xl font-semibold mb-4">Đặt dịch vụ thành công!</p>
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p><strong>{item.service.name}</strong></p>
                      <p>{item.selectedDate} - {item.selectedSlot}</p>
                      <p>Therapist: {item.selectedTherapist.name}</p>
                    </div>
                    <span>${item.service.price || 0}</span>
                  </li>
                ))}
              </ul>
              <p className="text-center text-gray-600 mt-4">Bạn sẽ được chuyển hướng về trang chủ trong giây lát...</p>
            </>
          ) : (
            <>
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p><strong>{item.service.name}</strong></p>
                      <p>{item.selectedDate} - {item.selectedSlot}</p>
                      <p>Therapist: {item.selectedTherapist.name}</p>
                    </div>
                    <span>${item.service.price || 0}</span>
                  </li>
                ))}
              </ul>
              <div className="text-right text-lg font-bold mt-4">
                Tổng cộng: ${cart.reduce((sum, item) => sum + (item.service.price || 0), 0)}
              </div>
              <button
                onClick={handlePayment}
                className="mt-6 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Thanh toán ngay
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;