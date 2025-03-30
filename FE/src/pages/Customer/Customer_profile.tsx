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
  const [products, setProducts] = useState<any[]>([]);
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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Booking | null>(null);
  const [serviceImage, setServiceImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
      fetchProducts();
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
        throw new Error("Failed to fetch orders");
      }

      const data: Booking[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

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

    const reviewData = {
      bookingID: selectedOrder.BookingID,
      service_id: selectedOrder.service_id,
      serviceName: selectedOrder.serviceName,
      serviceRating: rating,
      serviceContent: reviewText,
      createName: user.username,
    };

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

  const openDetailModal = (order: Booking) => {
    setSelectedDetailOrder(order);
    setServiceImage(null);
    const product = products.find((p) => p.service_id === order.service_id);
    if (product && product.image) {
      setServiceImage(product.image);
    }
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailOrder(null);
    setServiceImage(null);
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

  // Hàm định dạng giá tiền với dấu chấm ngăn cách hàng nghìn
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return "N/A";
    return `${Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
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
                Search by Booking ID
              </label>
              <Input
                placeholder="Enter Booking ID"
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
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[15%]">
                      Booking ID
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[20%]">
                      Service Name
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[15%]">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[15%]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[10%]">
                      Review
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[20%]">
                      Received result
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 w-[5%]">
                      {/* Details */}
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
                      <td className="py-4 px-6 text-gray-800 w-[15%]">
                        {order.BookingID || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-gray-800 w-[20%] whitespace-nowrap">
                        {order.serviceName}
                      </td>
                      <td className="py-4 px-6 text-gray-800 w-[15%] whitespace-nowrap">
                        {order.customerName}
                      </td>
                      <td className="py-4 px-6 w-[15%]">
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
                      <td className="py-4 px-6 w-[10%]">
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
                      <td className="py-4 px-6 text-gray-800 w-[20%]">
                        {order.description
                          ? order.description
                          : "No result yet"}
                      </td>
                      <td className="py-4 px-6 w-[5%] text-center">
                        <span
                          onClick={() => openDetailModal(order)}
                          className="text-gray-500 hover:text-blue-500 cursor-pointer text-lg"
                        >
                          👁️
                        </span>
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

      {/* Modal chi tiết */}
      <Modal
        title={
          <div className="text-2xl font-bold text-black">
            Order Details
            <div className="mt-1 h-1 w-16 bg-gray-300 rounded" />
          </div>
        }
        open={isDetailModalOpen}
        onCancel={closeDetailModal}
        footer={[
          <Button
            key="close"
            onClick={closeDetailModal}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6"
          >
            Close
          </Button>,
        ]}
        width={600}
        styles={{
          body: { padding: "0" },
        }}
      >
        {selectedDetailOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white"
          >
            <div className="space-y-6">
              {/* Thông tin đơn hàng */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black mb-2">Order Information</h3>
                <div className="space-y-2">
                  <p className="flex justify-between border-b border-gray-200 pb-2">
                    <strong className="font-semibold">Booking ID:</strong>
                    <span>{selectedDetailOrder.BookingID || "N/A"}</span>
                  </p>
                  <p className="flex justify-between border-b border-gray-200 pb-2">
                    <strong className="font-semibold">Status:</strong>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        statusStyles[selectedDetailOrder.status]?.bg || "bg-gray-100"
                      } ${
                        statusStyles[selectedDetailOrder.status]?.text || "text-gray-800"
                      }`}
                    >
                      {statusStyles[selectedDetailOrder.status]?.icon || "⏳"}{" "}
                      {selectedDetailOrder.status}
                    </span>
                  </p>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <div className="flex-1">
                      <strong className="font-semibold">Start Time:</strong>
                      <span className="ml-2">{selectedDetailOrder.startTime}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <strong className="font-semibold">End Time:</strong>
                      <span className="ml-2">{selectedDetailOrder.endTime || "N/A"}</span>
                    </div>
                  </div>
                  <p className="flex justify-between pt-2">
                    <strong className="font-semibold">Booking Date:</strong>
                    <span>{selectedDetailOrder.bookingDate}</span>
                  </p>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black mb-2">Customer Information</h3>
                <div className="space-y-1">
                  <p className="flex justify-between">
                    <strong className="font-semibold">Name:</strong>
                    <span>{selectedDetailOrder.customerName}</span>
                  </p>
                  <p className="flex justify-between">
                    <strong className="font-semibold">Phone:</strong>
                    <span>{selectedDetailOrder.customerPhone}</span>
                  </p>
                  <p className="flex justify-between">
                    <strong className="font-semibold">Email:</strong>
                    <span>{selectedDetailOrder.customerEmail}</span>
                  </p>
                </div>
              </div>

              {/* Thông tin dịch vụ */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black mb-2">Service Information</h3>
                <div className="flex gap-4">
                  <div className="w-48">
                    {serviceImage ? (
                      <img
                        src={serviceImage}
                        alt={selectedDetailOrder.serviceName}
                        className="w-48 h-48 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg shadow-md text-gray-500 font-medium">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="flex justify-between">
                      <strong className="font-semibold">Service Name:</strong>
                      <span>{selectedDetailOrder.serviceName}</span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="font-semibold">Therapist:</strong>
                      <span>
                        {selectedDetailOrder.selectedTherapist?.name ||
                          selectedDetailOrder.Skincare_staff ||
                          "Not assigned"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="font-semibold">Original Price:</strong>
                      <span>{formatPrice(selectedDetailOrder.originalPrice)}</span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="font-semibold">Discounted Price:</strong>
                      <span>{formatPrice(selectedDetailOrder.discountedPrice)}</span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="font-semibold">Total Price:</strong>
                      <span className="text-green-600 font-semibold">
                        {formatPrice(selectedDetailOrder.totalPrice)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ghi chú và kết quả */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black mb-2">Additional Information</h3>
                <div className="space-y-1">
                  <p className="flex justify-between">
                    <strong className="font-semibold">Notes:</strong>
                    <span>{selectedDetailOrder.notes || "No notes"}</span>
                  </p>
                  <p className="flex justify-between">
                    <strong className="font-semibold">Result:</strong>
                    <span>{selectedDetailOrder.description || "No result yet"}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Modal>
    </Layout>
  );
};

export default CustomerProfile;