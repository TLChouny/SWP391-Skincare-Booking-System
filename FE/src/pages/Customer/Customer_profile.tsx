import React, { useState, useEffect } from "react";
import { useAuth, Booking } from "../../context/AuthContext"; // Import Booking type
import Layout from "../../layout/Layout";

// Define status styles
const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", icon: "✔" },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: "✔" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", icon: "✖" },
} as const;

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Booking[]>([]); // Use Booking type instead of any[]
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !user?.username) {
        throw new Error("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
      }

      const encodedUsername = encodeURIComponent(user.username);
      console.log("📌 Fetching orders for:", encodedUsername);

      const response = await fetch(`${API_BASE_URL}/cart/user/${encodedUsername}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch orders: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data: Booking[] = await response.json(); // Type the response
      console.log("📌 Orders received:", data);
      setOrders(data);
    } catch (error) { // Explicitly type error as Error
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Lịch Sử Đơn Hàng</h1>
        {loading ? (
          <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600">Không có đơn hàng nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Mã Đơn</th>
                  <th className="py-3 px-4 border-b text-left">Tên Dịch Vụ</th>
                  <th className="py-3 px-4 border-b text-left">Khách Hàng</th>
                  <th className="py-3 px-4 border-b text-left">Số Điện Thoại</th>
                  <th className="py-3 px-4 border-b text-left">Ngày & Giờ</th>
                  <th className="py-3 px-4 border-b text-left">Chuyên Viên</th>
                  <th className="py-3 px-4 border-b text-left">Tổng Tiền</th>
                  <th className="py-3 px-4 border-b text-left">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const statusStyle =
                    statusStyles[order.status] || {
                      bg: "bg-gray-100",
                      text: "text-gray-800",
                      icon: "Pending",
                    };

                  return (
                    <tr key={order.CartID} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{order.CartID || "N/A"}</td>
                      <td className="py-2 px-4 border-b">{order.serviceName}</td>
                      <td className="py-2 px-4 border-b">{order.customerName}</td>
                      <td className="py-2 px-4 border-b">{order.customerPhone}</td>
                      <td className="py-2 px-4 border-b">
                        {order.bookingDate} {order.startTime}
                      </td>
                      <td className="py-2 px-4 border-b">{order.Skincare_staff || "N/A"}</td>
                      <td className="py-2 px-4 border-b">
                        {order.totalPrice?.toLocaleString("vi-VN") || "N/A"} VNĐ
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={`px-2 py-0.5 rounded-full text-sm ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon} {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              Trang Trước
            </button>
            <span className="py-2 px-4">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              Trang Tiếp
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerProfile;