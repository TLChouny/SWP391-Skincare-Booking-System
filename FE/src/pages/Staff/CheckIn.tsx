import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import { Booking } from "../../types/booking";

const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", icon: "✔" },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: "✔" },
  "checked-out": { bg: "bg-purple-100", text: "text-purple-800", icon: "🚪" },
  cancel: { bg: "bg-red-100", text: "text-red-800", icon: "✖" },
  reviewed: { bg: "bg-indigo-100", text: "text-indigo-800", icon: "📝" },
} as const;

interface Staff {
  id: string;
  name: string;
}

const StaffCheckIn: React.FC = () => {
  const { user, cart, setCart, fetchCart, loadingCart, cartError } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<{
    [cartId: string]: string | null;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 15;
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchStaff();
    }
  }, [user, fetchCart]);

  useEffect(() => {
    setBookings(cart);
  }, [cart]);

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to fetch staff list.");

      const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch staff list: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data: { _id: string; username: string }[] = await response.json();
      setAvailableStaff(
        data.map((staff) => ({
          id: staff._id,
          name: staff.username || "Unknown",
        }))
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to load staff list: ${errorMessage}`);
      setAvailableStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const updateStaffAssignment = async (
    cartId: string,
    staffName: string | null
  ) => {
    if (!cartId) {
      toast.error("Invalid CartID");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to assign staff.");

      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ Skincare_staff: staffName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to update staff: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedBooking = await response.json();
      setBookings((prev) =>
        prev.map((booking) =>
          booking.CartID === cartId
            ? { ...booking, ...updatedBooking.cart }
            : booking
        )
      );
      setCart((prev) =>
        prev.map((booking) =>
          booking.CartID === cartId
            ? { ...booking, ...updatedBooking.cart }
            : booking
        )
      );
      setSelectedStaff((prev) => ({ ...prev, [cartId]: staffName }));
      toast.success("Staff assignment updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update staff: ${errorMessage}`);
    }
  };

  const handleCheckIn = async (cartId: string) => {
    if (!cartId) {
      toast.error("Invalid CartID");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to perform check-in.");

      const booking = bookings.find((b) => b.CartID === cartId);
      if (!booking) throw new Error("Booking not found.");
      if (booking.status !== "pending")
        throw new Error("Can only check-in 'pending' bookings.");

      const assignedStaff = selectedStaff[cartId] || booking.Skincare_staff;
      if (!assignedStaff) {
        throw new Error("Please assign a therapist before checking in.");
      }

      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          status: "checked-in",
          Skincare_staff: assignedStaff,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to check-in: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedCart = await response.json();
      setBookings((prev) =>
        prev.map((b) =>
          b.CartID === cartId ? { ...b, ...updatedCart.cart } : b
        )
      );
      setCart((prev) =>
        prev.map((b) =>
          b.CartID === cartId ? { ...b, ...updatedCart.cart } : b
        )
      );

      setSelectedStaff((prev) => ({
        ...prev,
        [cartId]: assignedStaff,
      }));

      toast.success("Check-in successful!");
      await fetchCart();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Check-in failed: ${errorMessage}`);
    }
  };

  const handleCheckOut = async (cartId: string) => {
    if (!cartId) {
      toast.error("Invalid CartID");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to perform check-out.");

      const booking = bookings.find((b) => b.CartID === cartId);
      if (!booking) throw new Error("Booking not found.");
      if (booking.status !== "completed") {
        throw new Error(
          "Can only check-out 'completed' bookings. Please wait for therapist to complete."
        );
      }

      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "checked-out" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to check-out: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedCart = await response.json();
      setBookings((prev) =>
        prev.map((b) =>
          b.CartID === cartId ? { ...b, ...updatedCart.cart } : b
        )
      );
      setCart((prev) =>
        prev.map((b) =>
          b.CartID === cartId ? { ...b, ...updatedCart.cart } : b
        )
      );
      toast.success("Check-out successful!");
      await fetchCart();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Check-out failed: ${errorMessage}`);
    }
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">
        Staff Check-in Management
      </h1>
      {loadingCart ? (
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      ) : cartError ? (
        <p className="text-center text-red-600">{cartError}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings available</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">
                    Customer Name
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Email
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Phone
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Service Name
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Booking Date
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Start Time
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    End Time
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Total Price (VND)
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Action
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Therapist
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking) => {
                  const hasTherapist =
                    !!booking.Skincare_staff ||
                    !!selectedStaff[booking.CartID || ""];
                  const statusStyle =
                    statusStyles[booking.status] || statusStyles.pending;
                  return (
                    <tr
                      key={booking.CartID || Math.random().toString()}
                      className="hover:bg-gray-50 transition-colors duration-300"
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                        {booking.customerName}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.customerEmail}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.customerPhone}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.serviceName}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.bookingDate}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.startTime}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.endTime || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.totalPrice?.toLocaleString("vi-VN") || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon} {booking.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.status === "pending" && hasTherapist ? (
                          <button
                            onClick={() => handleCheckIn(booking.CartID || "")}
                            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all duration-300 whitespace-nowrap"
                          >
                            Check-in
                          </button>
                        ) : booking.status === "cancel" ? (
                          <span className="text-red-500 font-semibold">
                            Cancelled
                          </span>
                        ) : booking.status === "checked-in" ? (
                          <span className="text-gray-500">
                            Waiting for Therapist to Complete
                          </span>
                        ) : booking.status === "completed" ? (
                          <button
                            onClick={() => handleCheckOut(booking.CartID || "")}
                            className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 transition-all duration-300 whitespace-nowrap"
                          >
                            Check-out
                          </button>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.status === "pending" ? (
                          // Chỉ hiển thị <select> khi trạng thái là "pending"
                          <>
                            {staffLoading ? (
                              <span className="text-gray-500">
                                Loading staff...
                              </span>
                            ) : (
                              <select
                                value={
                                  selectedStaff[booking.CartID || ""] || ""
                                }
                                onChange={(e) => {
                                  const staffName = e.target.value || null;
                                  setSelectedStaff((prev) => ({
                                    ...prev,
                                    [booking.CartID || ""]: staffName,
                                  }));
                                  updateStaffAssignment(
                                    booking.CartID || "",
                                    staffName
                                  );
                                }}
                                className="p-1 border rounded"
                                disabled={availableStaff.length === 0}
                              >
                                <option value="">Select a therapist</option>
                                {availableStaff.map((staff) => (
                                  <option key={staff.id} value={staff.name}>
                                    {staff.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </>
                        ) : (
                          // Với các trạng thái khác, chỉ hiển thị tên therapist (nếu có) dưới dạng văn bản
                          <span className="text-gray-700">
                            {selectedStaff[booking.CartID || ""] ||
                              booking.Skincare_staff ||
                              "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.notes || "N/A"}
                      </td>
                    </tr>
                  );
                })}
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
          <div className="text-center mt-6">
            <button
              onClick={fetchCart}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
              disabled={loadingCart}
            >
              {loadingCart ? "Refreshing..." : "Refresh Bookings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffCheckIn;