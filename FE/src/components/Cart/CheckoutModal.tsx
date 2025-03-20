import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Booking } from "../../types/booking";
import { JSX } from "react/jsx-runtime";

interface CheckoutModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cart: Booking[];
  fetchCart: () => Promise<void>;
  loadingCart: boolean;
  cartError: string | null;
  paymentUrl: string;
  setPaymentUrl: (url: string) => void;
  qrCode: string;
  setQrCode: (code: string) => void;
  API_BASE_URL: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  showModal,
  setShowModal,
  cart,
  fetchCart,
  loadingCart,
  cartError,
  paymentUrl,
  setPaymentUrl,
  qrCode,
  setQrCode,
  API_BASE_URL,
}) => {
  const [isPaymentCreated, setIsPaymentCreated] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

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

  const calculateTotal = (): number => {
    return cart
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const formatTotal = (): string => {
    const totalValue = calculateTotal();
    return `${totalValue.toLocaleString("en-US")} VND`;
  };

  const handleCheckout = async () => {
    if (isCreatingPayment) {
      return;
    }

    const completedItems = cart.filter((item) => item.status === "completed");
    if (completedItems.length === 0) {
      toast.error("No items are selected for payment.");
      setShowModal(false);
      return;
    }

    if (isPaymentCreated || paymentUrl) {
      return;
    }

    setIsCreatingPayment(true);
    try {
      const totalAmount = calculateTotal();
      const orderName = completedItems[0]?.serviceName || "Multiple Services";
      let description = `Service ${orderName.substring(0, 25)}`;
      if (description.length > 25) description = description.substring(0, 25);

      const BASE_DOMAIN =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://luluspa-production.up.railway.app";

      const returnUrl = `${BASE_DOMAIN}/success.html`;
      const cancelUrl = `${BASE_DOMAIN}/cancel.html`;

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
      setIsPaymentCreated(true);
    } catch (error: any) {
      console.error("❌ Error during payment process:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setShowModal(false);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  useEffect(() => {
    if (showModal && !isPaymentCreated && !paymentUrl && !isCreatingPayment) {
      handleCheckout();
    }
  }, [showModal, cart]);

  useEffect(() => {
    if (!showModal) {
      setIsPaymentCreated(false);
      setIsCreatingPayment(false);
    }
  }, [showModal]);

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "1rem",
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "32rem",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: "1.5rem",
  };

  const listItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #e5e7eb",
  };

  const listItemLastStyle: React.CSSProperties = {
    borderBottom: "none",
  };

  const totalSectionStyle: React.CSSProperties = {
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  };

  const qrCodeSectionStyle: React.CSSProperties = {
    marginTop: "1.5rem",
    textAlign: "center",
  };

  const buttonFooterStyle: React.CSSProperties = {
    position: "sticky",
    bottom: 0,
    backgroundColor: "white",
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "right",
    gap: "1rem",
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  };

  const buttonSecondaryHoverStyle: React.CSSProperties = {
    backgroundColor: "#d1d5db",
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={modalOverlayStyle}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={modalContentStyle}
          >
            <div style={modalBodyStyle}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1.5rem" }}>
                Confirm Payment
              </h3>

              {loadingCart ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem 0" }}>
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
                <p style={{ textAlign: "center", color: "#dc2626" }}>{cartError}</p>
              ) : cart.filter((item) => item.status === "completed").length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280" }}>
                  No items to pay for.
                </p>
              ) : (
                <>
                  <ul style={{ maxHeight: "40vh", overflowY: "auto" }}>
                    {cart
                      .filter((item) => item.status === "completed")
                      .map((item, index, array) => (
                        <li
                          key={item.CartID || index}
                          style={{
                            ...listItemStyle,
                            ...(index === array.length - 1 ? listItemLastStyle : {}),
                          }}
                        >
                          <div style={{ fontSize: "0.875rem" }}>
                            <p style={{ fontWeight: 600, color: "#1f2937" }}>
                              {item.serviceName}
                            </p>
                            <p style={{ color: "#6b7280" }}>
                              {item.bookingDate} - {item.startTime}
                            </p>
                            {item.Skincare_staff && (
                              <p style={{ color: "#6b7280" }}>
                                Therapist: {item.Skincare_staff}
                              </p>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap" }}>
                            {formatPriceDisplay(
                              item.originalPrice || item.totalPrice || 0,
                              item.discountedPrice
                            )}
                          </span>
                        </li>
                      ))}
                  </ul>

                  <div style={totalSectionStyle}>
                    <p style={{ textAlign: "right", fontSize: "1.25rem", fontWeight: 700, color: "#1f2937" }}>
                      Total: {formatTotal()}
                    </p>
                  </div>

                  {qrCode && (
                    <div style={qrCodeSectionStyle}>
                      <p style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Scan QR to Pay
                      </p>
                      <img
                        src={qrCode}
                        alt="QR Code"
                        style={{ maxWidth: "180px", margin: "0 auto", display: "block" }}
                      />
                      <p style={{ marginTop: "1rem", color: "#2563eb" }}>
                        <a
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline", color: "#2563eb" }}
                        >
                          Click here if QR doesn't work
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={buttonFooterStyle}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                style={buttonSecondaryStyle}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, buttonSecondaryHoverStyle)
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, buttonSecondaryStyle)
                }
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;