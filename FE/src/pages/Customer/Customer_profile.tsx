import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Layout from "../../layout/Layout";

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
  Skincare_staff?: string;
  totalPrice?: number;
  status: "pending" | "checked-in" | "completed" | "cancelled";
  action?: "checkin" | "checkout" | null;
}

// Định nghĩa statusStyles với các thuộc tính CSS và Unicode
const statusStyles = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: "⏳",
  },
  "checked-in": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: "✔",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: "✔",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: "✖",
  },
};

const CustomerProfile: React.FC = () => {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;
  const API_BASE_URL = "http://localhost:5000/api"; // Adjust based on your API

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to view order history.");
      }
      const response = await fetch(`${API_BASE_URL}/cart?status=completed,cancelled`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch orders: ${response.status} - ${errorData.message || "Unknown error"}`
        );
      }
      const data: Booking[] = await response.json();
      console.log("Fetched orders:", data);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to load order history."
      );
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
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
        <h1 className="text-3xl font-bold text-center mb-6">Order History</h1>
        {loading ? (
          <p className="text-center text-gray-600">Loading data...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">
                      Cart ID
                    </th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Service Name</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Customer Name</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Phone</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Service DateTime</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Therapist</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Total Price</th>
                    <th className="py-3 px-4 border-b text-left whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-600">
                        No order history available
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order) => {
                      const statusStyle = statusStyles[order.status];
                      return (
                        <tr
                          key={order.CartID}
                          className="hover:bg-gray-50 transition-colors duration-300"
                        >
                          <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                            {order.CartID || "N/A"}
                          </td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">{order.serviceName}</td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">{order.customerName}</td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">{order.customerPhone}</td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            {order.bookingDate} {order.startTime}
                          </td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            {order.Skincare_staff || "N/A"}
                          </td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            {order.totalPrice?.toLocaleString("vi-VN") || "N/A"} VND
                          </td>
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {statusStyle.icon} {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`py-2 px-4 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } transition-all duration-300`}
              >
                Previous
              </button>
              <span className="py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`py-2 px-4 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } transition-all duration-300`}
              >
                Next
              </button>
            </div>
          </>
        )}
        <div className="text-center mt-6">
          <button
            onClick={fetchOrders}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Order History"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerProfile;