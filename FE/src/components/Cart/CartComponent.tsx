import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Booking } from "../../types/booking";

// Define a minimal type for the user object from useAuth
type AuthUser = {
  username?: string;
  email?: string;
};

interface CartComponentProps {
  handleCheckout?: () => Promise<void>;
  isBookingPage?: boolean;
}

const CartComponent: React.FC<CartComponentProps> = ({ handleCheckout, isBookingPage = false }) => {
  const { cart, fetchCart, loadingCart, cartError, user, token } = useAuth();
  const [showCart, setShowCart] = useState<boolean>(false);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load cart in CartComponent:", error);
        }
      }
    };

    if ((user as AuthUser)?.username) {
      loadCart();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchCart, user]);

  // Filter cart items for the current user
  const userCart = cart.filter((item) => item.username === (user as AuthUser)?.username);

  // Debug: Log the cart data
  useEffect(() => {
    console.log("Cart data:", cart);
    console.log("User cart filtered:", userCart);
  }, [cart, userCart]);

  const calculateTotal = (): number => {
    return userCart
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("vi-VN")} VNĐ`;
  };

  // Map status to user-friendly Vietnamese labels
  const getStatusLabel = (status: string | undefined): string => {
    switch (status) {
      case "pending":
        return "Chưa xác định";
      case "checked-in":
        return "Đã check-in";
      case "completed":
        return "Đã hoàn thành";
      case "checked-out":
        return "Đã thanh toán";
      case "cancel":
        return "Đã hủy";
      default:
        console.warn("Unexpected status value:", status); // Debug log
        return "Không xác định";
    }
  };

  // Map status to corresponding colors
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "checked-in":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "checked-out":
        return "text-purple-500";
      case "cancel":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const toggleCart = () => setShowCart((prev) => !prev);

  const handleCancelCart = async (cartID: string | undefined) => {
    if (!cartID) {
      toast.error("Không thể hủy giỏ hàng: ID giỏ hàng không hợp lệ.");
      return;
    }

    try {
      if (!token) {
        throw new Error("Bạn cần đăng nhập để hủy giỏ hàng.");
      }

      console.log(`Attempting to cancel cart item with ID: ${cartID}`); // Debug log

      const response = await fetch(`${API_BASE_URL}/cart/${cartID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "cancel" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể hủy giỏ hàng: Lỗi server");
      }

      const data = await response.json();
      console.log(`Successfully canceled cart item with ID: ${cartID}`, data); // Debug log

      // Làm mới giỏ hàng từ server
      await fetchCart();
      toast.success("Giỏ hàng đã được hủy thành công!");
    } catch (error) {
      console.error("Lỗi khi hủy giỏ hàng:", error);
      toast.error(error instanceof Error ? error.message : "Không thể hủy giỏ hàng.");
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleCart}
        className="fixed top-28 right-4 p-3 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
        aria-label="Toggle cart"
      >
        🛒
        {userCart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {userCart.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-36 right-4 bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[70vh] overflow-y-auto z-50"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Giỏ hàng của bạn</h3>
            {loadingCart ? (
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            ) : cartError ? (
              <p className="text-red-600">{cartError}</p>
            ) : userCart.length > 0 ? (
              <>
                {userCart.map((item) => (
                  <motion.div
                    key={item.CartID || `cart-item-${Math.random()}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 border-b pb-2"
                  >
                    <p className="font-semibold text-gray-800">{item.serviceName}</p>
                    <p className="text-gray-600">Ngày đặt: {item.bookingDate} - {item.startTime}</p>
                    <p className="text-gray-600">
                      Khách hàng: {item.customerName} ({item.customerEmail})
                    </p>
                    {item.Skincare_staff && (
                      <p className="text-gray-600">Nhân viên: {item.Skincare_staff}</p>
                    )}
                    <p className="text-gray-600">
                      Tổng tiền: {item.totalPrice?.toLocaleString("vi-VN") || "N/A"} VNĐ
                    </p>
                    <p className={`${getStatusColor(item.status)}`}>
                      Trạng thái: {getStatusLabel(item.status)}
                    </p>
                    {item.status === "pending" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancelCart(item.CartID)}
                        className="mt-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Hủy
                      </motion.button>
                    )}
                  </motion.div>
                ))}
                <p className="text-lg font-semibold text-gray-800 mt-4">Tổng: {formatTotal()}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout || (() => (window.location.href = "/booking"))}
                  disabled={!userCart.some((item) => item.status === "completed")}
                  className={`w-full p-3 rounded-lg mt-4 ${
                    !userCart.some((item) => item.status === "completed")
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Thanh toán
                </motion.button>
              </>
            ) : (
              <p className="text-gray-600">Giỏ hàng của bạn trống.</p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300 mt-2"
            >
              Đóng
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartComponent;