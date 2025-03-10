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
  action?: "checkin" | "checkout" | null;
  notes?: string;
  BookingID: string;
  serviceType: string;
  duration: number;
  discountCode?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
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

const StaffCheckIn: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableStaff, setAvailableStaff] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<{ [cartId: string]: string | null }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
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
          throw new Error(`Failed to fetch staff list: ${response.status} - ${errorData.message || "Unknown error"}`);
        }
        const data = await response.json();
        setAvailableStaff(data.map((staff: any) => ({
          id: staff._id,
          name: staff.username || staff.name || "Unknown",
        })));
      } catch (error) {
        console.error("Error fetching staff list:", error);
        toast.error(error instanceof Error ? `Failed to load staff list: ${error.message}` : "Unable to load staff list.");
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please log in to view bookings.");
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
      setBookings(data);
      const initialSelectedStaff: { [cartId: string]: string | null } = {};
      data.forEach((booking) => {
        initialSelectedStaff[booking.CartID] = booking.Skincare_staff || null;
      });
      setSelectedStaff(initialSelectedStaff);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error instanceof Error ? error.message : "Unable to load booking list.");
    } finally {
      setLoading(false);
    }
  };

  const updateStaffAssignment = async (cartId: string, staffName: string | null) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to assign staff.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          Skincare_staff: staffName,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update staff assignment: ${response.status} - ${errorData.message || "Unknown error"}`);
      }
      const updatedBooking = await response.json();
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.CartID === cartId ? { ...booking, ...updatedBooking.cart } : booking
        )
      );
      setSelectedStaff((prev) => ({ ...prev, [cartId]: staffName }));
      toast.success("Staff assignment updated successfully!");
    } catch (error) {
      console.error("Error updating staff assignment:", error);
      toast.error(error instanceof Error ? `Failed to update staff: ${error.message}` : "Update failed.");
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
      if (!booking) {
        toast.error("Booking not found.");
        return;
      }
      if (booking.status !== "pending") {
        toast.error("Can only check-in bookings with 'pending' status.");
        return;
      }
      if (!booking.Skincare_staff && !selectedStaff[cartId]) {
        toast.error("Please assign a therapist before checking in.");
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
        throw new Error(`Failed to check-in: ${response.status} - ${errorData.message || "Unknown error"}`);
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
      toast.error(error instanceof Error ? `Check-in failed: ${error.message}` : "Check-in failed.");
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
      if (!booking) {
        toast.error("Booking not found.");
        return;
      }
      if (booking.status !== "checked-in" && booking.status !== "pending") {
        toast.error("Can only check-out bookings with 'pending' or 'checked-in' status.");
        return;
      }
      if (!booking.Skincare_staff && !selectedStaff[cartId]) {
        toast.error("Please assign a therapist before checking out.");
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
          action: null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to check-out: ${response.status} - ${errorData.message || "Unknown error"}`);
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
      toast.error(error instanceof Error ? `Check-out failed: ${error.message}` : "Check-out failed.");
    }
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
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
      <h1 className="text-3xl font-bold text-center mb-6">Staff Check-in Management</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading data...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">BookingID</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Customer Name</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Email</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Phone</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Service Name</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Booking Date</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Start Time</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">End Time</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Total Price (VND)</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Action</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Therapist</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Notes</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Discount Code</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Duration (minutes)</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Created At</th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-4 text-gray-600">
                      No bookings available
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking) => {
                    const hasTherapist = !!booking.Skincare_staff || !!selectedStaff[booking.CartID];
                    const statusStyle = statusStyles[booking.status];
                    return (
                      <tr
                        key={booking.CartID}
                        className="hover:bg-gray-50 transition-colors duration-300"
                      >
                        <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">{booking.BookingID}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.customerName}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.customerEmail}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.customerPhone}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.serviceName}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.bookingDate}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.startTime}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.endTime || "N/A"}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.totalPrice.toLocaleString("vi-VN")}</td>
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
                              onClick={() => handleCheckIn(booking.CartID)}
                              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all duration-300 whitespace-nowrap"
                            >
                              Check-in
                            </button>
                          ) : booking.status === "checked-in" && hasTherapist ? (
                            <button
                              onClick={() => handleCheckOut(booking.CartID)}
                              className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-all duration-300 whitespace-nowrap"
                            >
                              Check-out
                            </button>
                          ) : (
                            <span className="text-gray-500">
                              {hasTherapist ? "No Action" : "Assign Therapist First"}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">
                          {booking.Skincare_staff || selectedStaff[booking.CartID] || "N/A"}
                          {staffLoading ? (
                            <span>Loading staff...</span>
                          ) : !booking.Skincare_staff && !selectedStaff[booking.CartID] ? (
                            <select
                              value={selectedStaff[booking.CartID] || ""}
                              onChange={(e) => {
                                const staffName = e.target.value || null;
                                setSelectedStaff((prev) => ({ ...prev, [booking.CartID]: staffName }));
                                updateStaffAssignment(booking.CartID, staffName);
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
                          ) : null}
                        </td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.notes || "N/A"}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.discountCode || "N/A"}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{booking.duration}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{new Date(booking.createdAt).toLocaleString()}</td>
                        <td className="py-2 px-4 border-b whitespace-nowrap">{new Date(booking.updatedAt).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`py-2 px-4 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"} transition-all duration-300`}
            >
              Previous
            </button>
            <span className="py-2 px-4">Page {currentPage} of {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`py-2 px-4 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"} transition-all duration-300`}
            >
              Next
            </button>
          </div>
        </>
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