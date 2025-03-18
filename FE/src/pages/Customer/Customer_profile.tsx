import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../layout/Layout";
import { Skeleton, Modal, Rate, Input, Button, message, Select } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Booking } from "../../types/booking";
import { motion } from "framer-motion";

const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", icon: "✔" },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: "✔" },
  cancel: { bg: "bg-red-100", text: "text-red-800", icon: "✖" },
  "checked-out": { bg: "bg-green-100", text: "text-purple-800", icon: "✔" },
  reviewed: { bg: "bg-gray-100", text: "text-gray-800", icon: "⭐" },
} as const;

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrderId, setSearchOrderId] = useState<string>("");
  const [sortStatus, setSortStatus] = useState<string>("All");
  const ordersPerPage = 10;
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  // const [reviewedOrders, setReviewedOrders] = useState<string[]>([]);
  // const [reviewedServices, setReviewedServices] = useState<{
  //   [key: string]: boolean;
  // }>({});

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);
  const fetchOrders = async () => {
    if (!user?.username) {
      setError("You need to log in to view your order history.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You need to log in to view your order history.");
      }

      const response = await fetch(
        `${API_BASE_URL}/cart/user/${encodeURIComponent(user.username)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data: Booking[] = await response.json();
      // console.log("📌 Orders Data from API:", data); 

      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // const loadReviewedOrders = () => {
  //   const storedReviews = localStorage.getItem("reviewedOrders");
  //   if (storedReviews) {
  //     setReviewedOrders(JSON.parse(storedReviews));
  //   }
  // };

  // const saveReviewedOrders = (updatedReviewedOrders: string[]) => {
  //   localStorage.setItem(
  //     "reviewedOrders",
  //     JSON.stringify(updatedReviewedOrders)
  //   );
  //   setReviewedOrders(updatedReviewedOrders);
  // };

  const openReviewModal = (order: Booking) => {
    if (!order.BookingID) {
      message.warning("Invalid order ID.");
      return;
    }
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setRating(5);
    setReviewText("");
  };
  const handleSubmitReview = async () => {
    if (!selectedOrder || !user?.username) {
      message.error("Error: No order selected or not logged in.");
      return;
    }

    // console.log("📌 Selected Order Data:", selectedOrder); 

    const reviewData = {
      bookingID: selectedOrder.BookingID,
      service_id: selectedOrder.service_id, 
      serviceName: selectedOrder.serviceName,
      serviceRating: rating,
      serviceContent: reviewText,
      createName: user.username,
    };

    // console.log("📌 Sending Review Data:", reviewData);

    if (!reviewData.service_id) {
      // console.error("❌ Error: Service ID is missing!");
      message.error("Error: Service ID is missing.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You need to log in to submit a review.");
      }

      const response = await fetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(reviewData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Unable to submit review.");
      }

      toast.success("Review submitted successfully!");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.BookingID === selectedOrder.BookingID
            ? { ...order, status: "reviewed" }
            : order
        )
      );

      closeReviewModal();
    } catch (err) {
      toast.error("Error submitting review.");
      console.error("Error submitting review:", err);
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) =>
      searchOrderId
        ? (order.BookingID || "N/A")
            .toLowerCase()
            .includes(searchOrderId.toLowerCase())
        : true
    )
    .filter((order) =>
      sortStatus === "All" ? true : order.status === sortStatus
    );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredAndSortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
        <motion.h1
          className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Order History
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-white-500 rounded mx-auto"></div>
        </motion.h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Order ID
              </label>
              <Input
                placeholder="Enter Order ID"
                value={searchOrderId}
                onChange={(e) => {
                  setSearchOrderId(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Status
              </label>
              <Select
                value={sortStatus}
                onChange={(value) => {
                  setSortStatus(value);
                  setCurrentPage(1);
                }}
                className="w-full"
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "checked-in", label: "Checked In" },
                  { value: "completed", label: "Completed" },
                  { value: "cancel", label: "Cancel" },
                  { value: "checked-out", label: "Checked Out" },
                ]}
              />
            </div>
          </div>

          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} className="p-6" />
          ) : error ? (
            <p className="text-center text-red-600 p-6">{error}</p>
          ) : filteredAndSortedOrders.length === 0 ? (
            <p className="text-center text-gray-600 p-6">No orders found</p>
          ) : (
            <>
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Service Name
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Review
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      Received result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <motion.tr
                      key={order.CartID}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-4 px-6 text-gray-800">
                        {order.BookingID || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {order.serviceName}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {order.customerName}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            statusStyles[order.status]?.bg || "bg-gray-100"
                          } ${
                            statusStyles[order.status]?.text || "text-gray-800"
                          }`}
                        >
                          {statusStyles[order.status]?.icon || "⏳"}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {order.status === "checked-out" && !order.reviewed ? (
                          <Button
                            type="primary"
                            onClick={() => openReviewModal(order)}
                          >
                            Review
                          </Button>
                        ) : order.reviewed ? (
                          <span className="text-green-500 font-bold">
                            Reviewed
                          </span>
                        ) : (
                          <span className="text-gray-400">{order.status}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {order.description
                          ? order?.description
                          : "No result yet"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center py-6">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  ←
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    type={currentPage === i + 1 ? "primary" : "default"}
                    className={`mx-2 w-10 h-10 rounded-full ${
                      currentPage === i + 1
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  →
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title="Review Order"
        open={isModalOpen}
        onCancel={closeReviewModal}
        onOk={handleSubmitReview}
        okText="Submit"
        cancelText="Cancel"
        styles={{ body: { padding: "24px" } }} 
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4">
            <b>{selectedOrder?.serviceName || "No service name"}</b>
          </p>
          <Rate
            value={rating}
            onChange={(value) => setRating(value)}
            className="mb-4"
          />
          <Input.TextArea
            placeholder="Enter your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mt-4 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400"
            rows={4}
          />
        </motion.div>
      </Modal>
    </Layout>
  );
};

export default CustomerProfile;
