import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách dịch vụ đã đặt từ localStorage hoặc state
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    // Bộ đếm ngược
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Thời gian thanh toán đã hết. Đơn hàng bị hủy.");
          localStorage.removeItem("cart");
          navigate("/booking");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handlePayment = () => {
    alert("Thanh toán thành công!");
    localStorage.removeItem("cart");
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-4xl font-bold text-center mb-10">Checkout</h2>

      <div className="text-center text-xl text-red-500 mb-4">
        Thời gian còn lại: {formatTime(timeLeft)}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Giỏ hàng của bạn đang trống.</p>
        ) : (
          <>
            <ul>
              {cart.map((item, index) => (
                <li key={index} className="flex justify-between py-2 border-b">
                  <span>{item.name}</span>
                  <span>{item.price} VND</span>
                </li>
              ))}
            </ul>
            <div className="text-right text-lg font-bold mt-4">
              Tổng cộng: {cart.reduce((sum, item) => sum + item.price, 0)} VND
            </div>
            <button
              onClick={handlePayment}
              className="mt-6 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Thanh toán ngay
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
