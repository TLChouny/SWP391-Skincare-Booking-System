import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

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
  status: "pending" | "checked-in" | "completed" | "cancelled";
  action?: "checkin" | "checkout" | null;
}

interface CartComponentProps {
  handleCheckout?: () => Promise<void>;
  isBookingPage?: boolean;
}

const CartComponent: React.FC<CartComponentProps> = ({
  handleCheckout,
  isBookingPage = false,
}) => {
  const { cart, fetchCart, loadingCart, cartError } = useAuth();
  const [showCart, setShowCart] = useState<boolean>(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (err: any) {
        toast.error("Failed to load cart: " + err.message);
      }
    };
    loadCart();
  }, [fetchCart]);

  const calculateTotal = (): number => {
    return cart
      .filter((item) => item.status === "checked-in")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("vi-VN")} VNĐ`;
  };

  const toggleCart = () => setShowCart(!showCart);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleCart}
        className="fixed top-28 right-4 p-3 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
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
            className="fixed top-36 right-4 bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Cart</h3>
            {loadingCart ? (
              <p className="text-gray-600">Loading cart...</p>
            ) : cartError ? (
              <p className="text-red-600">{cartError}</p>
            ) : cart.length > 0 ? (
              <>
                {cart.map((item, index) => (
                  <motion.div key={item.CartID || index} className="mb-4 border-b pb-2">
                    <p className="font-semibold text-gray-800">{item.serviceName}</p>
                    <p>Date: {item.bookingDate} - {item.startTime}</p>
                    {item.Skincare_staff && <p>Therapist ID: {item.Skincare_staff}</p>}
                    <p>Total: {item.totalPrice?.toLocaleString("vi-VN")} VND</p>
                    <p
                      className={`${
                        item.status === "completed"
                          ? "text-green-500"
                          : item.status === "cancelled"
                          ? "text-red-500"
                          : item.status === "checked-in"
                          ? "text-blue-500"
                          : "text-yellow-500"
                      }`}
                    >
                      Status: {item.status}
                    </p>
                  </motion.div>
                ))}
                <p className="text-lg font-semibold text-gray-800 mt-4">
                  Total: {formatTotal()}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout || (() => (window.location.href = "/booking"))}
                  disabled={!cart.some((item) => item.status === "checked-in")}
                  className={`w-full p-3 rounded-lg mt-4 ${
                    cart.some((item) => item.status === "checked-in")
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Proceed to Checkout (Customer)
                </motion.button>
              </>
            ) : (
              <p className="text-gray-600">Your cart is empty.</p>
            )}
            <motion.button
              onClick={toggleCart}
              className="w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300 mt-2"
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartComponent;