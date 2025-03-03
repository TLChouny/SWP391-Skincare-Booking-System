import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Định nghĩa interface cho Booking
interface Booking {
  CartID: string;
  Status: string;
  BookingID: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  service_id: number;
  serviceName: string;
  serviceType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  currency: string;
  discountCode?: string;
  Skincare_staff?: string;
}

const StaffCheckIn: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]); // Định kiểu rõ ràng cho bookings
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/cart/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data: Booking[] = await response.json(); // Định kiểu cho data
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (cartId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/checkin/${cartId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Status: "Checked-in" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check-in");
      }

      toast.success("Check-in thành công!");
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.CartID === cartId
            ? { ...booking, Status: "Checked-in" }
            : booking
        )
      );
    } catch (error) {
      console.error("Error during check-in:", error);
      toast.error("Check-in thất bại");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-6">
        Quản lý Check-in cho Staff
      </h1>

      {loading ? (
        <p className="text-center">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Booking ID</th>
                <th className="py-2 px-4 border-b">Tên khách hàng</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Số điện thoại</th>
                <th className="py-2 px-4 border-b">Dịch vụ</th>
                <th className="py-2 px-4 border-b">Loại dịch vụ</th>
                <th className="py-2 px-4 border-b">Ngày đặt</th>
                <th className="py-2 px-4 border-b">Giờ bắt đầu</th>
                <th className="py-2 px-4 border-b">Giờ kết thúc</th>
                <th className="py-2 px-4 border-b">Thời lượng (phút)</th>
                <th className="py-2 px-4 border-b">Tổng giá (VND)</th>
                <th className="py-2 px-4 border-b">Trạng thái</th>
                <th className="py-2 px-4 border-b">Hành động</th>
                <th className="py-2 px-4 border-b">Chuyên viên</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-4">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.CartID} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{booking.BookingID}</td>
                    <td className="py-2 px-4 border-b">
                      {booking.customerName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.customerEmail}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.customerPhone}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.serviceName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.serviceType}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {booking.bookingDate}
                    </td>
                    <td className="py-2 px-4 border-b">{booking.startTime}</td>
                    <td className="py-2 px-4 border-b">{booking.endTime}</td>
                    <td className="py-2 px-4 border-b">{booking.duration}</td>
                    <td className="py-2 px-4 border-b">
                      {booking.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">{booking.Status}</td>
                    <td className="py-2 px-4 border-b">
                      {booking.Status === "Active" ? (
                        <button
                          onClick={() => handleCheckIn(booking.CartID)}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Check-in
                        </button>
                      ) : (
                        <span className="text-green-500">Đã Check-in</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffCheckIn;