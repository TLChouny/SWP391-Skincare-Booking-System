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
  const { user, booking, setBooking, fetchBooking, loadingBooking, bookingError } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<{
    [bookingId: string]: string | null;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 15;
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    if (user) {
      fetchBooking();
      fetchStaff();
    }
  }, [user, fetchBooking]);

  useEffect(() => {
    setBookings(booking);
    setSelectedStaff((prev) => {
      const updatedSelectedStaff = { ...prev };
      booking.forEach((b) => {
        if (b.BookingID && b.Skincare_staff) {
          updatedSelectedStaff[b.BookingID] = b.Skincare_staff;
        }
      });
      return updatedSelectedStaff;
    });
  }, [booking]);

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const token = localStorage.getItem("token");
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
    bookingId: string,
    staffName: string | null
  ) => {
    if (!bookingId) {
      toast.error("Invalid BookingID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to assign staff.");

      const bookingItem = bookings.find((b) => b.BookingID === bookingId);
      if (!bookingItem) throw new Error("Booking not found.");

      const isStaffBooked = booking.some(
        (b) =>
          b.BookingID !== bookingId &&
          b.Skincare_staff === staffName &&
          b.bookingDate === bookingItem.bookingDate &&
          b.startTime === bookingItem.startTime &&
          ["pending", "checked-in", "completed"].includes(b.status)
      );

      if (isStaffBooked) {
        throw new Error(
          `Therapist ${staffName} is already booked for this time slot.`
        );
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
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
        prev.map((b) =>
          b.BookingID === bookingId
            ? { ...b, ...updatedBooking.booking }
            : b
        )
      );
      setBooking((prev) =>
        prev.map((b) =>
          b.BookingID === bookingId
            ? { ...b, ...updatedBooking.booking }
            : b
        )
      );
      setSelectedStaff((prev) => ({ ...prev, [bookingId]: staffName }));
      toast.success("Staff assignment updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update staff: ${errorMessage}`);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    if (!bookingId) {
      toast.error("Invalid BookingID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to perform check-in.");

      const bookingItem = bookings.find((b) => b.BookingID === bookingId);
      if (!bookingItem) throw new Error("Booking not found.");
      if (bookingItem.status !== "pending")
        throw new Error("Can only check-in 'pending' bookings.");

      const assignedStaff = selectedStaff[bookingId] || bookingItem.Skincare_staff;
      if (!assignedStaff) {
        throw new Error("Please assign a therapist before checking in.");
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
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

      const updatedBooking = await response.json();
      setBookings((prev) =>
        prev.map((b) =>
          b.BookingID === bookingId ? { ...b, ...updatedBooking.booking } : b
        )
      );
      setBooking((prev) =>
        prev.map((b) =>
          b.BookingID === bookingId ? { ...b, ...updatedBooking.booking } : b
        )
      );

      setSelectedStaff((prev) => ({
        ...prev,
        [bookingId]: assignedStaff,
      }));

      toast.success("Check-in successful!");
      await fetchBooking();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Check-in failed: ${errorMessage}`);
    }
  };

  const getAvailableStaffForBooking = (bookingItem: Booking): Staff[] => {
    if (!bookingItem.bookingDate || !bookingItem.startTime) return availableStaff;

    const bookedStaff = booking
      .filter(
        (b) =>
          b.BookingID !== bookingItem.BookingID &&
          b.bookingDate === bookingItem.bookingDate &&
          b.startTime === bookingItem.startTime &&
          b.Skincare_staff &&
          ["pending", "checked-in", "completed"].includes(b.status)
      )
      .map((b) => b.Skincare_staff!);

    return availableStaff.filter((staff) => !bookedStaff.includes(staff.name));
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
      {loadingBooking ? (
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
      ) : bookingError ? (
        <p className="text-center text-red-600">{bookingError}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings available</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">
                    BookingID
                  </th>
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
                {currentBookings.map((bookingItem) => {
                  const hasTherapist =
                    !!bookingItem.Skincare_staff ||
                    !!selectedStaff[bookingItem.BookingID || ""];
                  const statusStyle =
                    statusStyles[bookingItem.status] || statusStyles.pending;
                  const filteredAvailableStaff = ["pending", "checked-in"].includes(
                    bookingItem.status
                  )
                    ? getAvailableStaffForBooking(bookingItem)
                    : availableStaff;

                  return (
                    <tr
                      key={bookingItem.BookingID || Math.random().toString()}
                      className="hover:bg-gray-50 transition-colors duration-300"
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                        {bookingItem.BookingID}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                        {bookingItem.customerName}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.customerEmail}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.customerPhone}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.serviceName}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.bookingDate}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.startTime}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.endTime || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.totalPrice?.toLocaleString("vi-VN") || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon} {bookingItem.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.status === "pending" && hasTherapist ? (
                          <button
                            onClick={() => handleCheckIn(bookingItem.BookingID || "")}
                            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all duration-300 whitespace-nowrap"
                          >
                            Check-in
                          </button>
                        ) : bookingItem.status === "cancel" ? (
                          <span className="text-red-500 font-semibold">
                            Cancelled
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {bookingItem.status === "checked-in"
                              ? "Waiting for Therapist to Complete"
                              : "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {["pending", "checked-in"].includes(bookingItem.status) ? (
                          staffLoading ? (
                            <span className="text-gray-500">
                              Loading staff...
                            </span>
                          ) : (
                            <select
                              value={
                                selectedStaff[bookingItem.BookingID || ""] ||
                                bookingItem.Skincare_staff ||
                                ""
                              }
                              onChange={(e) => {
                                const staffName = e.target.value || null;
                                setSelectedStaff((prev) => ({
                                  ...prev,
                                  [bookingItem.BookingID || ""]: staffName,
                                }));
                                updateStaffAssignment(
                                  bookingItem.BookingID || "",
                                  staffName
                                );
                              }}
                              className="p-1 border rounded"
                              disabled={filteredAvailableStaff.length === 0}
                            >
                              <option value="">Select a therapist</option>
                              {filteredAvailableStaff.map((staff) => (
                                <option key={staff.id} value={staff.name}>
                                  {staff.name}
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          <span className="text-gray-700">
                            {bookingItem.Skincare_staff ||
                              selectedStaff[bookingItem.BookingID || ""] ||
                              "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.notes || "N/A"}
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
              onClick={fetchBooking}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all duration-300"
              disabled={loadingBooking}
            >
              {loadingBooking ? "Refreshing..." : "Refresh Bookings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffCheckIn;