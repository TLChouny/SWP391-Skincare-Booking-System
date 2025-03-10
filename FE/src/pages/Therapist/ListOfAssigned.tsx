import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

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

interface Booking {
  CartID: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  Skincare_staff?: string;
  totalPrice: number;
  status: "pending" | "checked-in" | "completed" | "cancelled";
  action?: "checkin" | "checkout" | null;
  notes?: string;
}

const ListOfAssigned: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchAssignedBookings();
  }, []);

  const fetchAssignedBookings = async () => {
    setLoading(true);
    setError(null); // Reset lỗi trước khi fetch
    try {
      const token = localStorage.getItem("authToken");
      const therapistName = localStorage.getItem("name"); // Giả định tên therapist lấy từ 'username'

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      if (!therapistName) {
        throw new Error("Therapist name not found. Please ensure you are logged in as a therapist.");
      }

      const response = await fetch(`${API_BASE_URL}/cart?status=pending,checked-in`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch bookings: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      const data: Booking[] = await response.json();
      // Lọc danh sách theo therapist đang đăng nhập
      const filteredBookings = data.filter((booking) => booking.Skincare_staff === therapistName);
      setBookings(filteredBookings);
    } catch (error) {
      console.error("Error fetching assigned bookings:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to load assigned bookings.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async (cartId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to complete the service.");
        return;
      }

      const booking = bookings.find((b) => b.CartID === cartId);
      if (!booking) {
        toast.error("Booking not found.");
        return;
      }

      if (booking.status !== "checked-in") {
        toast.error("Can only complete services that are checked-in.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          status: "completed",
          action: "checkout",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to complete service: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      const updatedBooking = await response.json();
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.CartID === cartId ? { ...booking, ...updatedBooking.cart } : booking
        )
      );
      toast.success("Service completed! Customer can now checkout.");
    } catch (error) {
      console.error("Error completing service:", error);
      toast.error(error instanceof Error ? `Failed to complete service: ${error.message}` : "Completion failed.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Assigned Bookings</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading assigned bookings...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Cart ID</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Service Name</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Customer Name</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Phone</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Booking Date</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Start Time</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">End Time</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Total Price (VND)</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Status</th>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-gray-600">
                    No assigned bookings available
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const statusStyle = statusStyles[booking.status];
                  return (
                    <tr
                      key={booking.CartID}
                      className="hover:bg-gray-50 transition-colors duration-300"
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.CartID}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.serviceName}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.customerName}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.customerPhone}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.bookingDate}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.startTime}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">{booking.endTime || "N/A"}</td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.totalPrice.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon} {booking.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.status === "checked-in" ? (
                          <button
                            onClick={() => handleCompleteService(booking.CartID)}
                            className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-all duration-300"
                          >
                            Complete Service
                          </button>
                        ) : (
                          <span className="text-gray-500">No Action</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-center mt-6">
        <button
          onClick={fetchAssignedBookings}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Bookings"}
        </button>
      </div>
    </div>
  );
};

export default ListOfAssigned;