import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import { Booking } from "../../types/booking";
import { Modal, Input } from "antd";

const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⏳" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", icon: "✔" },
  completed: { bg: "bg-green-100", text: "text-green-800", icon: "✔" },
  "checked-out": { bg: "bg-purple-100", text: "text-purple-800", icon: "🚪" },
  cancel: { bg: "bg-red-100", text: "text-red-800", icon: "✖" },
  reviewed: { bg: "bg-indigo-100", text: "text-indigo-800", icon: "📝" },
} as const;

const ListOfAssign: React.FC = () => {
  const { user, booking, setBooking, fetchBooking, loadingBooking, bookingError } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [resultText, setResultText] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBooking();
    }
  }, [user, fetchBooking]);

  useEffect(() => {
    setBookings(booking);
  }, [booking]);

  useEffect(() => {
    if (!isModalOpen) {
      setResultText("");
      setSelectedBooking(null);
    }
  }, [isModalOpen]);

  const openModal = (bookingItem: Booking, viewOnly = false) => {
    setSelectedBooking(bookingItem);
    setResultText(viewOnly ? bookingItem.description || "No result available" : "");
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setResultText("");
      setSelectedBooking(null);
    }, 300);
  };

  const saveResult = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/${selectedBooking.BookingID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ description: resultText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update result");
      }

      toast.success("Result updated successfully");
      closeModal();
      await fetchBooking();
    } catch (error) {
      toast.error("Error updating result");
      console.error(error);
    }
  };

  const handleComplete = async (bookingId: string) => {
    if (!bookingId) {
      toast.error("Invalid BookingID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to mark as complete.");

      const bookingItem = bookings.find((b) => b.BookingID === bookingId);
      if (!bookingItem) throw new Error("Booking not found.");
      if (bookingItem.status !== "checked-in")
        throw new Error("Can only complete 'checked-in' bookings.");

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to mark as complete: ${response.status} - ${
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
      toast.success("Booking marked as completed!");
      await fetchBooking();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to complete: ${errorMessage}`);
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
        Therapist Assigned Bookings
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
        <p className="text-center text-gray-600">No bookings assigned to you</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap sticky left-0 bg-gray-100 z-10">
                    Booking
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Customer Name
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
                    Total Price (VND)
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Action
                  </th>
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((bookingItem) => {
                  const statusStyle =
                    statusStyles[bookingItem.status] || statusStyles.pending;
                  return (
                    <tr
                      key={bookingItem.BookingID || Math.random().toString()}
                      className="hover:bg-gray-50 transition-colors duration-300"
                    >
                      <td className="py-2 px-4 border-b whitespace-nowrap sticky left-0 bg-white z-10">
                        {bookingItem.BookingID || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {bookingItem.customerName}
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
                        {bookingItem.status === "checked-in" ? (
                          bookingItem.description &&
                          bookingItem.description.trim() !== "" ? (
                            <button
                              onClick={() =>
                                handleComplete(bookingItem.BookingID || "")
                              }
                              className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-all duration-300 whitespace-nowrap"
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="text-red-500 text-sm">
                              Please send report
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500">No Action</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => openModal(bookingItem, true)}
                          className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition-all mr-2"
                        >
                          View
                        </button>
                        {bookingItem.status === "checked-in" ? (
                          <button
                            onClick={() => openModal(bookingItem, false)}
                            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all mr-2"
                          >
                            Update result
                          </button>
                        ) : (
                          <span className="text-gray-500"></span>
                        )}
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
      <Modal
        title={isViewMode ? "View Result" : "Update Result"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={!isViewMode ? saveResult : closeModal}
        okText={isViewMode ? "Close" : "Save"}
        cancelButtonProps={{
          style: { display: isViewMode ? "none" : "inline-block" },
        }}
      >
        {isViewMode ? (
          <p className="text-lg text-gray-700">{resultText}</p>
        ) : (
          <Input.TextArea
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            rows={4}
            placeholder="Enter result description..."
          />
        )}
      </Modal>
    </div>
  );
};

export default ListOfAssign;