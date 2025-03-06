import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Booking {
  CartID: string;
  service_id: number;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  totalPrice: number;
  Skincare_staff?: string;
  status: "pending" | "checked-in" | "completed" | "cancelled";
  action?: "checkin" | "checkout";
  notes?: string;
}

const StaffCheckIn: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to view bookings.");
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch bookings: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data: Booking[] = await response.json();
      console.log("Fetched bookings:", data);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error instanceof Error ? error.message : "Unable to load booking list.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (cartId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to perform check-in.");
        return;
      }

      const booking = bookings.find((b) => b.CartID === cartId);
      if (booking?.status !== "pending") {
        toast.error("Can only check-in bookings with 'pending' status.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/check-in/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          status: "checked-in",
          action: "checkout",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to check-in: ${response.status} - ${errorData.message || "Unknown error"}`
        );
      }

      const updatedCart = await response.json();
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.CartID === cartId ? { ...booking, ...updatedCart.cart } : booking
        )
      );
      toast.success("Check-in successful! Next action: checkout.");
    } catch (error) {
      console.error("Error during check-in:", error);
      toast.error(
        error instanceof Error ? `Check-in failed: ${error.message}` : "Check-in failed."
      );
    }
  };

  const handleCheckOut = async (cartId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to perform check-out.");
        return;
      }

      const booking = bookings.find((b) => b.CartID === cartId);
      if (booking?.status !== "checked-in") {
        toast.error("Can only check-out bookings with 'checked-in' status.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/check-out/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          status: "completed",
          action: undefined, // Xóa action sau khi hoàn tất
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to check-out: ${response.status} - ${errorData.message || "Unknown error"}`
        );
      }

      const updatedCart = await response.json();
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.CartID === cartId ? { ...booking, ...updatedCart.cart } : booking
        )
      );
      toast.success("Check-out successful! Payment confirmed.");
    } catch (error) {
      console.error("Error during check-out:", error);
      toast.error(
        error instanceof Error ? `Check-out failed: ${error.message}` : "Check-out failed."
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">Staff Check-in Management</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left">Customer Name</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Phone</th>
                <th className="py-3 px-4 border-b text-left">Service</th>
                <th className="py-3 px-4 border-b text-left">Booking Date</th>
                <th className="py-3 px-4 border-b text-left">Start Time</th>
                <th className="py-3 px-4 border-b text-left">Total Price (VND)</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
                <th className="py-3 px-4 border-b text-left">Action</th>
                <th className="py-3 px-4 border-b text-left">Specialist</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-gray-600">
                    No bookings available
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.CartID}
                    className="hover:bg-gray-50 transition-colors duration-300"
                  >
                    <td className="py-2 px-4 border-b">{booking.customerName}</td>
                    <td className="py-2 px-4 border-b">{booking.customerEmail}</td>
                    <td className="py-2 px-4 border-b">{booking.customerPhone}</td>
                    <td className="py-2 px-4 border-b">{booking.serviceName}</td>
                    <td className="py-2 px-4 border-b">{booking.bookingDate}</td>
                    <td className="py-2 px-4 border-b">{booking.startTime}</td>
                    <td className="py-2 px-4 border-b">
                      {booking.totalPrice.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`${
                          booking.status === "pending"
                            ? "text-yellow-500"
                            : booking.status === "checked-in"
                            ? "text-blue-500"
                            : booking.status === "completed"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.status === "pending" ? (
                        <button
                          onClick={() => handleCheckIn(booking.CartID)}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all duration-300"
                        >
                          Check-in
                        </button>
                      ) : booking.status === "checked-in" ? (
                        <button
                          onClick={() => handleCheckOut(booking.CartID)}
                          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-all duration-300"
                        >
                          Check-out
                        </button>
                      ) : (
                        <span className="text-gray-500">No Action</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{booking.Skincare_staff || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={fetchBookings}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Bookings"}
        </button>
      </div>
    </div>
  );
};

export default StaffCheckIn;