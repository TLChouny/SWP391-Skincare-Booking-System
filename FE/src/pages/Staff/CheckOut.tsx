import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
} from "react-icons/fa";
import { Payment } from "../../types/booking";
import { useAuth } from "../../context/AuthContext";

interface ApiResponse {
  error: number;
  message: string;
  data: {
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const StaffCheckOut: React.FC = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 15;
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    if (token) {
      fetchPayments();
    } else {
      console.warn("No token available, skipping fetch.");
      toast.warn("Please log in to view payments.");
    }
  }, [token]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch payments: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data: ApiResponse = await response.json();
      console.log("API Response:", data);

      // Kiểm tra dữ liệu an toàn
      const paymentData = data.data?.payments && Array.isArray(data.data.payments)
        ? data.data.payments
        : [];
      
      if (paymentData.length === 0) {
        console.warn("No payments found in API response");
        toast.info("No payments available.");
      }

      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to load payment list."
      );
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">All Payments View</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading data...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">
                    Payment Code
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Payment Name
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Amount (VND)
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Status
                  </th>
                  {/* Uncomment nếu muốn hiển thị thêm cột */}
                  {/* <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Description
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Created At
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Updated At
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-600">
                      No payments available
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment) => (
                    <tr
                      key={payment._id || payment.paymentID} // Fallback nếu _id không có
                      className="hover:bg-gray-50 transition-colors duration-300"
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                        {payment.paymentID || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {payment.description || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {payment.amount ? payment.amount.toLocaleString("vi-VN") : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "success"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status === "pending" && (
                            <FaHourglassHalf className="mr-1" />
                          )}
                          {payment.status === "success" && (
                            <FaCheckCircle className="mr-1" />
                          )}
                          {payment.status === "failed" && (
                            <FaTimesCircle className="mr-1" />
                          )}
                          {payment.status === "cancelled" && (
                            <FaBan className="mr-1" />
                          )}
                          {payment.status
                            ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
                            : "N/A"}
                        </span>
                      </td>
                      {/* Uncomment nếu muốn hiển thị thêm cột */}
                      {/* <td className="py-2 px-4 border-b whitespace-nowrap">
                        {payment.description || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : "N/A"}
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          onClick={fetchPayments}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Payments"}
        </button>
      </div>
    </div>
  );
};

export default StaffCheckOut;