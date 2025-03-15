import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../layout/Layout";
import { Skeleton, Modal, Rate, Input, Button, message } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Booking } from "../../types/booking";

// Define status styles
const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", icon: "✔" },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: "✔" },
  cancel: { bg: "bg-red-100", text: "text-red-800", icon: "✖" },
  "checked-out": { bg: "bg-green-100", text: "text-purple-800", icon: "✔" },
} as const;

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;
  const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://luluspa-production.up.railway.app/api";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
    } else {
      setOrders([]); // Đặt orders rỗng nếu user chưa đăng nhập
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.username) {
      setError("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
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
        throw new Error("Không thể tải đơn hàng.");
      }

      const data: Booking[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for review
  const openReviewModal = (order: Booking) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setRating(5);
    setReviewText("");
  };

  // Handle Review Submission
  const handleSubmitReview = async () => {
    if (!selectedOrder || !user?.username) {
      message.error("Lỗi: Không có đơn hàng được chọn hoặc chưa đăng nhập.");
      return;
    }

    const reviewData = {
      serviceID: selectedOrder.service_id,
      serviceName: selectedOrder.serviceName,
      serviceRating: rating,
      serviceContent: reviewText,
      createName: user.username,
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Bạn cần đăng nhập để gửi đánh giá.");
      }

      const response = await fetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error("Không thể gửi đánh giá.");
      }

      toast.success("Đánh giá đã được gửi thành công!");
      closeReviewModal();
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá.");
      console.error("Lỗi khi gửi đánh giá:", err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Lịch Sử Đơn Hàng</h1>

        <div className="overflow-x-auto min-h-[500px]">
          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-600">Không có đơn hàng nào</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Mã Đơn</th>
                  <th className="py-3 px-4 border-b text-left">Tên Dịch Vụ</th>
                  <th className="py-3 px-4 border-b text-left">Khách Hàng</th>
                  <th className="py-3 px-4 border-b text-left">Trạng Thái</th>
                  <th className="py-3 px-4 border-b text-left">Đánh Giá</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.CartID} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{order.BookingID || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{order.serviceName}</td>
                    <td className="py-2 px-4 border-b">{order.customerName}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-0.5 rounded-full text-sm ${
                          statusStyles[order.status]?.bg || "bg-gray-100"
                        } ${statusStyles[order.status]?.text || "text-gray-800"}`}
                      >
                        {statusStyles[order.status]?.icon || "⏳"} {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.status === "checked-out" ? (
                        <Button type="primary" onClick={() => openReviewModal(order)}>
                          Đánh Giá
                        </Button>
                      ) : (
                        <span className="text-gray-400">Chưa thể đánh giá</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal đánh giá */}
      <Modal
        title="Đánh Giá Dịch Vụ"
        open={isModalOpen}
        onCancel={closeReviewModal}
        onOk={handleSubmitReview}
        okText="Gửi"
        cancelText="Hủy"
      >
        <p>
          <b>{selectedOrder?.serviceName || "Không có tên dịch vụ"}</b>
        </p>
        <Rate value={rating} onChange={(value) => setRating(value)} />
        <Input.TextArea
          placeholder="Nhập nội dung đánh giá..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="mt-4"
        />
      </Modal>
    </Layout>
  );
};

export default CustomerProfile;