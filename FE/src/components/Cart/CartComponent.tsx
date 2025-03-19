import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Booking } from "../../types/booking";
import { JSX } from "react/jsx-runtime";

type AuthUser = {
  username?: string;
  email?: string;
};

interface CartComponentProps {
  handleCheckout?: () => Promise<void>;
  isBookingPage?: boolean;
}

const CartComponent: React.FC<CartComponentProps> = ({
  handleCheckout,
  // isBookingPage = false,
}) => {
  const { cart, fetchCart, loadingCart, cartError, user, token, setCart } =
    useAuth();
  const [showCart, setShowCart] = useState<boolean>(false);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  // Fetch cart data when the user is logged in
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
  const userCart = cart.filter(
    (item) => item.username === (user as AuthUser)?.username
  );

  // Log cart data for debugging (optional)
  useEffect(() => {
    // console.log("Cart data:", cart);
    // console.log("User cart filtered:", userCart);
  }, [cart, userCart]);

  // Format price display with optional discount
  const formatPriceDisplay = (
    originalPrice: number,
    discountedPrice?: number | null
  ): JSX.Element => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            textDecoration: discountedPrice != null ? "line-through" : "none",
            color: discountedPrice != null ? "#6b7280" : "#1f2937",
            fontWeight: 500,
          }}
        >
          {originalPrice.toLocaleString("en-US")} VND
        </span>
        {discountedPrice != null && (
          <span style={{ color: "#16a34a", fontWeight: 600 }}>
            {discountedPrice.toLocaleString("en-US")} VND
          </span>
        )}
      </div>
    );
  };

  // Calculate total price for completed items
  const calculateTotal = (): number => {
    return userCart
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  // Format total price
  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("en-US")} VND`;
  };

  // Get status label in English
  const getStatusLabel = (status: string | undefined): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "checked-in":
        return "Checked In";
      case "completed":
        return "Completed";
      case "checked-out":
        return "Checked Out";
      case "cancel":
        return "Cancelled";
      case "reviewed":
        return "Reviewed";
      default:
        console.warn("Unexpected status value:", status);
        return "Unknown";
    }
  };

  // Define status styles with icons (reused from StaffCheckIn)
  const statusStyles = {
    pending: { icon: "⏳", color: "#854d0e", backgroundColor: "#fef9c3" },
    "checked-in": { icon: "✏️", color: "#1e40af", backgroundColor: "#dbeafe" },
    completed: { icon: "✔", color: "#065f46", backgroundColor: "#d1fae5" },
    "checked-out": { icon: "🚪", color: "#5b21b6", backgroundColor: "#ede9fe" },
    // cancel: { icon: "✖", color: "#991b1b", backgroundColor: "#fee2e2" },
    reviewed: { icon: "📝", color: "#c2410c", backgroundColor: "#ffedd5" },
  } as const;

  // Calculate the count of items in each status
  const statusCounts = userCart.reduce(
    (acc, item) => {
      const status = item.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Define the statuses to display in the tab
  const statusTabs = [
    { status: "pending", label: "Pending" },
    { status: "checked-in", label: "Checked In" },
    { status: "completed", label: "Completed" },
    { status: "checked-out", label: "Checked Out" },
    // { status: "cancel", label: "Cancelled" },
    { status: "reviewed", label: "Reviewed" },
  ];

  // Toggle cart visibility
  const toggleCart = () => setShowCart((prev) => !prev);

  // Handle cart item cancellation
  const handleCancelCart = async (cartID: string | undefined) => {
    if (!cartID) {
      toast.error("Cannot cancel cart: Invalid cart ID.");
      return;
    }

    try {
      if (!token) {
        throw new Error("You need to log in to cancel the cart.");
      }

      const response = await fetch(`${API_BASE_URL}/cart/${cartID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete cart: Server error");
      }

      setCart((prevCart: Booking[]) =>
        prevCart.filter((item) => item.CartID !== cartID)
      );

      toast.success("Cart item cancelled successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error cancelling cart:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel cart."
      );
    }
  };

  // Define reusable styles
  const cartContainerStyle: React.CSSProperties = {
    position: "fixed",
    top: "9rem",
    right: "4rem",
    backgroundColor: "white",
    padding: "0.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "27rem",
    maxHeight: "80vh",
    overflowY: "auto",
    zIndex: 50,
  };

  const cartItemStyle: React.CSSProperties = {
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    transition: "box-shadow 0.3s ease",
    marginBottom: "1rem",
  };

  const cartItemHoverStyle: React.CSSProperties = {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.25rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
  };

  const cartFooterStyle: React.CSSProperties = {
    position: "sticky",
    bottom: 0,
    backgroundColor: "white",
    paddingTop: "1rem",
    marginTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "0.5rem",
    transition: "background 0.3s ease",
    marginBottom: "0.5rem",
    border: "none",
    cursor: "pointer",
  };

  const buttonPrimaryHoverStyle: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    borderRadius: "0.5rem",
    transition: "background 0.3s ease",
    border: "none",
    cursor: "pointer",
  };

  const buttonSecondaryHoverStyle: React.CSSProperties = {
    backgroundColor: "#d1d5db",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    backgroundColor: "#d1d5db",
    color: "#6b7280",
    cursor: "not-allowed",
  };

  // Styles for the status tab
  const statusTabContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "1rem",
  };

  const statusTabItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  };

  const statusTabItemHoverStyle: React.CSSProperties = {
    transform: "scale(1.1)",
  };

  const statusIconStyle: React.CSSProperties = {
    fontSize: "1.5rem",
  };

  const statusLabelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#6b7280",
    textAlign: "center",
  };

  const statusCountStyle: React.CSSProperties = {
    position: "absolute",
    top: "-0.5rem",
    right: "-0.5rem",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "0.625rem",
    borderRadius: "50%",
    width: "1rem",
    height: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <>
      {/* Cart Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleCart}
        style={{
          position: "fixed",
          top: "9rem",
          right: "1rem",
          padding: "0.75rem",
          backgroundColor: "#facc15",
          borderRadius: "50%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "none",
          cursor: "pointer",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#eab308")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#facc15")
        }
        aria-label="Toggle cart"
      >
        🛒
        {userCart.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              backgroundColor: "#ef4444",
              color: "white",
              fontSize: "0.75rem",
              borderRadius: "50%",
              width: "1.25rem",
              height: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {userCart.length}
          </span>
        )}
      </motion.button>

      {/* Cart Panel */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={cartContainerStyle}
          >
            {/* Cart Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937" }}>
                Your Cart
              </h3>
              <button
                onClick={toggleCart}
                style={{
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Status Tab */}
            <div style={statusTabContainerStyle}>
              {statusTabs.map((tab) => {
                const count = statusCounts[tab.status] || 0;
                const style = statusStyles[tab.status as keyof typeof statusStyles] || {
                  icon: "❓",
                  color: "#6b7280",
                  backgroundColor: "#f3f4f6",
                };

                return (
                  <div
                    key={tab.status}
                    style={statusTabItemStyle}
                    onMouseEnter={(e) =>
                      Object.assign(e.currentTarget.style, statusTabItemHoverStyle)
                    }
                    onMouseLeave={(e) =>
                      Object.assign(e.currentTarget.style, statusTabItemStyle)
                    }
                    aria-label={`${tab.label}: ${count} items`}
                  >
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          ...statusIconStyle,
                          color: count > 0 ? style.color : "#d1d5db",
                        }}
                      >
                        {style.icon}
                      </span>
                      {count > 0 && (
                        <span style={statusCountStyle}>{count}</span>
                      )}
                    </div>
                    <span style={statusLabelStyle}>{tab.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Cart Content */}
            {loadingCart ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "1.5rem 0",
                }}
              >
                <svg
                  style={{
                    animation: "spin 1s linear infinite",
                    height: "1.5rem",
                    width: "1.5rem",
                    color: "#2563eb",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                  ></path>
                </svg>
                <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
                  Loading cart...
                </span>
              </div>
            ) : cartError ? (
              <p style={{ color: "#dc2626", textAlign: "center" }}>{cartError}</p>
            ) : userCart.length > 0 ? (
              <>
                {/* Cart Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {userCart.map((item) => (
                    <motion.div
                      key={item.CartID || `cart-item-${Math.random()}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={cartItemStyle}
                      onMouseEnter={(e) =>
                        Object.assign(e.currentTarget.style, cartItemHoverStyle)
                      }
                      onMouseLeave={(e) =>
                        Object.assign(e.currentTarget.style, cartItemStyle)
                      }
                    >
                      <h4 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937" }}>
                        {item.serviceName}
                      </h4>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 500 }}>Booking Date:</span>{" "}
                        {item.bookingDate} - {item.startTime}
                      </p>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 500 }}>Customer:</span>{" "}
                        {item.customerName}
                      </p>
                      {item.Skincare_staff && (
                        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                          <span style={{ fontWeight: 500 }}>Therapist:</span>{" "}
                          {item.Skincare_staff}
                        </p>
                      )}
                      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 500 }}>Total:</span>{" "}
                        {formatPriceDisplay(
                          item.originalPrice || item.totalPrice || 0,
                          item.discountedPrice
                        )}
                      </p>
                      <p style={{ marginTop: "0.25rem" }}>
                        <span
                          style={{
                            ...statusBadgeStyle,
                            ...(statusStyles[item.status as keyof typeof statusStyles] || {
                              backgroundColor: "#f3f4f6",
                              color: "#4b5563",
                            }),
                          }}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </p>
                      {item.status === "pending" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelCart(item.CartID)}
                          style={{
                            marginTop: "0.5rem",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#ef4444",
                            color: "white",
                            borderRadius: "0.375rem",
                            fontSize: "0.875rem",
                            border: "none",
                            cursor: "pointer",
                            transition: "background 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#dc2626")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ef4444")
                          }
                        >
                          Cancel
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Cart Footer (Sticky) */}
                <div style={cartFooterStyle}>
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "#1f2937",
                      marginBottom: "1rem",
                    }}
                  >
                    Total: {formatTotal()}
                  </p>
                  <motion.button
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.55 }}
                    onClick={
                      handleCheckout ||
                      (() => (window.location.href = "/booking"))
                    }
                    disabled={
                      !userCart.some((item) => item.status === "completed")
                    }
                    style={{
                      ...buttonPrimaryStyle,
                      ...(userCart.some((item) => item.status === "completed")
                        ? {}
                        : buttonDisabledStyle),
                    }}
                    onMouseEnter={(e) =>
                      userCart.some((item) => item.status === "completed") &&
                      Object.assign(e.currentTarget.style, buttonPrimaryHoverStyle)
                    }
                    onMouseLeave={(e) =>
                      userCart.some((item) => item.status === "completed") &&
                      Object.assign(e.currentTarget.style, buttonPrimaryStyle)
                    }
                  >
                    Checkout
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 0.55 }}
                    onClick={toggleCart}
                    style={buttonSecondaryStyle}
                    onMouseEnter={(e) =>
                      Object.assign(e.currentTarget.style, buttonSecondaryHoverStyle)
                    }
                    onMouseLeave={(e) =>
                      Object.assign(e.currentTarget.style, buttonSecondaryStyle)
                    }
                  >
                    Close
                  </motion.button>
                </div>
              </>
            ) : (
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                Your cart is empty.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartComponent;