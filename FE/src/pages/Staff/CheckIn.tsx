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
  Skincare_staff?: string; // Chỉ lưu name, không cần object
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

const StaffCheckIn: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableStaff, setAvailableStaff] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<{ [cartId: string]: string | null }>({}); // Lưu name
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 15;
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Please log in to fetch staff list.");
        }
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
            `Failed to fetch staff list: ${response.status} - ${errorData.message || "Unknown error"}`
          );
        }
        const data = await response.json();
        console.log("Fetched skincare staff:", data);
        setAvailableStaff(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username || staff.name || "Unknown",
          }))
        );
      } catch (error) {
        console.error("Error fetching staff list:", error);
        toast.error(
          error instanceof Error ? `Failed to load staff list: ${error.message}` : "Unable to load staff list."
        );
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
      if (!token) {
        throw new Error("Please log in to view bookings.");
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
        throw new Error(
          `Failed to fetch bookings: ${response.status} - ${errorData.message || "Unknown error"}`
        );
      }
      const data: Booking[] = await response.json();
      console.log("Fetched bookings:", data);
      setBookings(data);

      // Khởi tạo selectedStaff dựa trên Skincare_staff.name
      const initialSelectedStaff: { [cartId: string]: string | null } = {};
      data.forEach((booking) => {
        initialSelectedStaff[booking.CartID] = booking.Skincare_staff || null;
      });
      setSelectedStaff(initialSelectedStaff);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to load booking list."
      );
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
      console.log("Updating staff assignment payload:", { cartId, Skincare_staff: staffName });
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          Skincare_staff: staffName, // Chỉ gửi name
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to update staff assignment: ${response.status} - ${errorData.message || "Unknown error"}`
        );
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
      toast.error(
        error instanceof Error ? `Failed to update staff: ${error.message}` : "Update failed."
      );
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
      console.log("Check-in payload:", { cartId, status: "checked-in", action: "checkout" });
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
        console.error("Check-in error response:", errorData);
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
      if (!booking) {
        toast.error("Booking not found.");
        return;
      }
      if (booking.status !== "checked-in" && booking.status !== "pending") {
        toast.error("Can only check-out bookings with 'pending' or 'checked-in' status.");
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

  // Tính toán dữ liệu hiển thị cho trang hiện tại
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
                  <th className="py-3 px-4 border-b text-left whitespace-nowrap">Specialist</th>
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
                  currentBookings.map((booking) => (
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
                          className={
                            booking.status === "pending"
                              ? "text-yellow-500"
                              : booking.status === "checked-in"
                              ? "text-blue-500"
                              : booking.status === "completed"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {booking.status === "pending" ? (
                          <button
                            onClick={() => handleCheckIn(booking.CartID)}
                            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-all duration-300 whitespace-nowrap"
                          >
                            Check-in
                          </button>
                        ) : booking.status === "checked-in" ? (
                          <button
                            onClick={() => handleCheckOut(booking.CartID)}
                            className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-all duration-300 whitespace-nowrap"
                          >
                            Check-out
                          </button>
                        ) : (
                          <span className="text-gray-500">No Action</span>
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
                            <option value="">Select a specialist</option>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
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


// "use client"

// import React from "react"
// import { useState, useEffect, useRef } from "react"
// import { ToastContainer, toast } from "react-toastify"
// import "react-toastify/dist/ReactToastify.css"
// import { RefreshCw, Clock, CheckCircle, User, MoreVertical } from "lucide-react"

// // Card components
// const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`}>{children}</div>
// )

// const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <div className={`p-6 pt-0 ${className || ""}`}>{children}</div>
// )

// // Table components
// const Table = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <table className={`w-full caption-bottom text-sm ${className || ""}`}>{children}</table>
// )

// const TableHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <thead className={`[&_tr]:border-b ${className || ""}`}>{children}</thead>
// )

// const TableBody = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <tbody className={`[&_tr:last-child]:border-0 ${className || ""}`}>{children}</tbody>
// )

// const TableRow = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ""}`}>
//     {children}
//   </tr>
// )

// const TableHead = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className || ""}`}>
//     {children}
//   </th>
// )

// const TableCell = ({
//   className,
//   colSpan,
//   children,
// }: { className?: string; colSpan?: number; children: React.ReactNode }) => (
//   <td className={`p-4 align-middle ${className || ""}`} colSpan={colSpan}>
//     {children}
//   </td>
// )

// // Button component
// const Button = ({
//   variant = "default",
//   size = "default",
//   className,
//   disabled,
//   onClick,
//   title,
//   children,
// }: {
//   variant?: string;
//   size?: string;
//   className?: string;
//   disabled?: boolean;
//   onClick?: () => void;
//   title?: string;
//   children: React.ReactNode;
// }) => {
//   const baseClass =
//     "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

//   let variantClass = ""
//   if (variant === "default") variantClass = "bg-primary text-primary-foreground hover:bg-primary/90"
//   if (variant === "outline")
//     variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
//   if (variant === "ghost") variantClass = "hover:bg-accent hover:text-accent-foreground"

//   let sizeClass = ""
//   if (size === "default") sizeClass = "h-10 px-4 py-2"
//   if (size === "sm") sizeClass = "h-9 rounded-md px-3"
//   if (size === "icon") sizeClass = "h-10 w-10"

//   return (
//     <button
//       className={`${baseClass} ${variantClass} ${sizeClass} ${className || ""}`}
//       disabled={disabled}
//       onClick={onClick}
//       title={title}
//     >
//       {children}
//     </button>
//   )
// }

// // Badge component
// const Badge = ({
//   variant = "default",
//   className,
//   children,
// }: { variant?: string; className?: string; children: React.ReactNode }) => {
//   const baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"

//   let variantClass = ""
//   if (variant === "default") variantClass = "border-transparent bg-primary text-primary-foreground"
//   if (variant === "outline") variantClass = "text-foreground"

//   return <div className={`${baseClass} ${variantClass} ${className || ""}`}>{children}</div>
// }

// // Tabs components
// const Tabs = ({
//   defaultValue,
//   value,
//   onValueChange,
//   className,
//   children,
// }: {
//   defaultValue?: string;
//   value?: string;
//   onValueChange?: (value: string) => void;
//   className?: string;
//   children: React.ReactNode;
// }) => (
//   <div className={`${className || ""}`} data-value={value || defaultValue}>
//     {children}
//   </div>
// )

// const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//   <div
//     className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ""}`}
//   >
//     {children}
//   </div>
// )

// const TabsTrigger = ({
//   value,
//   className,
//   children,
// }: { value: string; className?: string; children: React.ReactNode }) => (
//   <button
//     className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className || ""}`}
//     data-value={value}
//     onClick={() => {
//       const tabs = document.querySelector("[data-value]")
//       if (tabs) {
//         const onValueChange = (tabs as any).__onValueChange
//         if (onValueChange) onValueChange(value)
//       }
//     }}
//   >
//     {children}
//   </button>
// )

// // Select components
// const Select = ({
//   defaultValue,
//   onValueChange,
//   disabled,
//   className,
//   children,
// }: {
//   defaultValue?: string;
//   onValueChange: (value: string) => void;
//   disabled?: boolean;
//   className?: string;
//   children: React.ReactNode;
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedValue, setSelectedValue] = useState(defaultValue || "")
//   const selectRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
//         setIsOpen(false)
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   return (
//     <div className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""} ${className || ""}`} ref={selectRef}>
//       {React.Children.map(children, (child) => {
//         if (React.isValidElement(child) && child.type === SelectTrigger) {
//           return React.cloneElement(child as React.ReactElement, {
//             onClick: () => setIsOpen(!isOpen),
//             selectedValue,
//           })
//         }
//         if (React.isValidElement(child) && child.type === SelectContent) {
//           return isOpen
//             ? React.cloneElement(child as React.ReactElement, {
//                 onSelect: (value: string) => {
//                   setSelectedValue(value)
//                   onValueChange(value)
//                   setIsOpen(false)
//                 },
//               })
//             : null
//         }
//         return child
//       })}
//     </div>
//   )
// }

// const SelectTrigger = ({
//   className,
//   onClick,
//   selectedValue,
//   children,
// }: {
//   className?: string;
//   onClick?: () => void;
//   selectedValue?: string;
//   children: React.ReactNode;
// }) => (
//   <div
//     className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background cursor-pointer hover:bg-muted/30 ${className || ""}`}
//     onClick={onClick}
//   >
//     {children}
//   </div>
// )

// const SelectValue = ({ placeholder, className, children }: { placeholder?: string; className?: string; children?: React.ReactNode }) => (
//   <div className={`truncate ${className || ""}`}>{children || placeholder}</div>
// )

// const SelectContent = ({
//   className,
//   onSelect,
//   children,
// }: {
//   className?: string;
//   onSelect?: (value: string) => void;
//   children: React.ReactNode;
// }) => (
//   <div
//     className={`absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full ${className || ""}`}
//   >
//     <div className="max-h-[200px] overflow-auto p-1">
//       {React.Children.map(children, (child) => {
//         if (React.isValidElement(child) && child.type === SelectItem) {
//           return React.cloneElement(child as React.ReactElement, {
//             onSelect,
//           })
//         }
//         return child
//       })}
//     </div>
//   </div>
// )

// const SelectItem = ({
//   value,
//   className,
//   onSelect,
//   children,
// }: {
//   value: string;
//   className?: string;
//   onSelect?: (value: string) => void;
//   children: React.ReactNode;
// }) => (
//   <div
//     className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className || ""}`}
//     onClick={() => onSelect && onSelect(value)}
//   >
//     {children}
//   </div>
// )

// // Skeleton component
// const Skeleton = ({ className }: { className?: string }) => (
//   <div className={`animate-pulse rounded-md bg-muted ${className || ""}`} />
// )

// interface Booking {
//   CartID: string
//   service_id: number
//   serviceName: string
//   customerName: string
//   customerEmail: string
//   customerPhone: string
//   bookingDate: string
//   startTime: string
//   endTime?: string
//   totalPrice: number
//   Skincare_staff?: string
//   status: "pending" | "checked-in" | "completed" | "cancelled"
//   action?: "checkin" | "checkout" | null
//   notes?: string
//   BookingID: string
//   serviceType: string
//   duration: number
//   discountCode?: string
//   currency: string
//   createdAt: Date
//   updatedAt: Date
// }

// const StaffCheckIn = () => {
//   const [bookings, setBookings] = useState<Booking[]>([])
//   const [availableStaff, setAvailableStaff] = useState<{ id: string; name: string }[]>([])
//   const [loading, setLoading] = useState<boolean>(false)
//   const [staffLoading, setStaffLoading] = useState<boolean>(false)
//   const [selectedStaff, setSelectedStaff] = useState<{ [cartId: string]: string | null }>({})
//   const [currentPage, setCurrentPage] = useState(1)
//   const [activeTab, setActiveTab] = useState<string>("all")
//   const [searchTerm, setSearchTerm] = useState<string>("")
//   const bookingsPerPage = 10
//   const API_BASE_URL = "http://localhost:5000/api"

//   useEffect(() => {
//     fetchBookings()
//   }, [])

//   useEffect(() => {
//     const fetchStaff = async () => {
//       setStaffLoading(true)
//       try {
//         const token = localStorage.getItem("authToken")
//         if (!token) {
//           throw new Error("Please log in to fetch staff list.")
//         }
//         const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "x-auth-token": token,
//           },
//         })
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}))
//           throw new Error(`Failed to fetch staff list: ${response.status} - ${errorData.message || "Unknown error"}`)
//         }
//         const data = await response.json()
//         setAvailableStaff(
//           data.map((staff: any) => ({
//             id: staff._id,
//             name: staff.username || staff.name || "Unknown",
//           })),
//         )
//       } catch (error) {
//         console.error("Error fetching staff list:", error)
//         toast.error(
//           error instanceof Error ? `Failed to load staff list: ${error.message}` : "Unable to load staff list.",
//         )
//       } finally {
//         setStaffLoading(false)
//       }
//     }

//     fetchStaff()
//   }, [])

//   const fetchBookings = async () => {
//     setLoading(true)
//     try {
//       const token = localStorage.getItem("authToken")
//       if (!token) {
//         throw new Error("Please log in to view bookings.")
//       }
//       const response = await fetch(`${API_BASE_URL}/cart?status=pending,checked-in`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "x-auth-token": token,
//         },
//       })
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(`Failed to fetch bookings: ${response.status} - ${errorData.message || "Unknown error"}`)
//       }
//       const data: Booking[] = await response.json()
//       setBookings(data)

//       const initialSelectedStaff: { [cartId: string]: string | null } = {}
//       data.forEach((booking) => {
//         initialSelectedStaff[booking.CartID] = booking.Skincare_staff || null
//       })
//       setSelectedStaff(initialSelectedStaff)
//     } catch (error) {
//       console.error("Error fetching bookings:", error)
//       toast.error(error instanceof Error ? error.message : "Unable to load booking list.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateStaffAssignment = async (cartId: string, staffName: string | null) => {
//     try {
//       const token = localStorage.getItem("authToken")
//       if (!token) {
//         toast.error("Please log in to assign staff.")
//         return
//       }
//       const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "x-auth-token": token,
//         },
//         body: JSON.stringify({
//           Skincare_staff: staffName,
//         }),
//       })
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(
//           `Failed to update staff assignment: ${response.status} - ${errorData.message || "Unknown error"}`,
//         )
//       }
//       const updatedBooking = await response.json()
//       setBookings((prevBookings) =>
//         prevBookings.map((booking) => (booking.CartID === cartId ? { ...booking, ...updatedBooking.cart } : booking)),
//       )
//       setSelectedStaff((prev) => ({ ...prev, [cartId]: staffName }))
//       toast.success("Staff assignment updated successfully!")
//     } catch (error) {
//       console.error("Error updating staff assignment:", error)
//       toast.error(error instanceof Error ? `Failed to update staff: ${error.message}` : "Update failed.")
//     }
//   }

//   const handleCheckIn = async (cartId: string) => {
//     try {
//       const token = localStorage.getItem("authToken")
//       if (!token) {
//         toast.error("Please log in to perform check-in.")
//         return
//       }
//       const booking = bookings.find((b) => b.CartID === cartId)
//       if (!booking) {
//         toast.error("Booking not found.")
//         return
//       }
//       if (booking.status !== "pending") {
//         toast.error("Can only check-in bookings with 'pending' status.")
//         return
//       }
//       const response = await fetch(`${API_BASE_URL}/cart/check-in/${cartId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "x-auth-token": token,
//         },
//         body: JSON.stringify({
//           status: "checked-in",
//           action: "checkout",
//         }),
//       })
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(`Failed to check-in: ${response.status} - ${errorData.message || "Unknown error"}`)
//       }
//       const updatedCart = await response.json()
//       setBookings((prevBookings) =>
//         prevBookings.map((booking) => (booking.CartID === cartId ? { ...booking, ...updatedCart.cart } : booking)),
//       )
//       toast.success("Check-in successful! Next action: checkout.")
//     } catch (error) {
//       console.error("Error during check-in:", error)
//       toast.error(error instanceof Error ? `Check-in failed: ${error.message}` : "Check-in failed.")
//     }
//   }

//   const handleCheckOut = async (cartId: string) => {
//     try {
//       const token = localStorage.getItem("authToken")
//       if (!token) {
//         toast.error("Please log in to perform check-out.")
//         return
//       }
//       const booking = bookings.find((b) => b.CartID === cartId)
//       if (!booking) {
//         toast.error("Booking not found.")
//         return
//       }
//       if (booking.status !== "checked-in" && booking.status !== "pending") {
//         toast.error("Can only check-out bookings with 'pending' or 'checked-in' status.")
//         return
//       }
//       const response = await fetch(`${API_BASE_URL}/cart/check-out/${cartId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "x-auth-token": token,
//         },
//         body: JSON.stringify({
//           status: "completed",
//           action: null,
//         }),
//       })
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(`Failed to check-out: ${response.status} - ${errorData.message || "Unknown error"}`)
//       }
//       const updatedCart = await response.json()
//       setBookings((prevBookings) =>
//         prevBookings.map((booking) => (booking.CartID === cartId ? { ...booking, ...updatedCart.cart } : booking)),
//       )
//       toast.success("Check-out successful! Payment confirmed.")
//     } catch (error) {
//       console.error("Error during check-out:", error)
//       toast.error(error instanceof Error ? `Check-out failed: ${error.message}` : "Check-out failed.")
//     }
//   }

//   const goToPreviousPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1)
//   }

//   const goToNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1)
//   }

//   // Status badge renderer
//   const renderStatusBadge = (status: string) => {
//     switch (status) {
//       case "pending":
//         return (
//           <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
//             Pending
//           </Badge>
//         )
//       case "checked-in":
//         return (
//           <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
//             Checked In
//           </Badge>
//         )
//       case "completed":
//         return (
//           <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
//             Completed
//           </Badge>
//         )
//       case "cancelled":
//         return (
//           <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
//             Cancelled
//           </Badge>
//         )
//       default:
//         return <Badge variant="outline">{status}</Badge>
//     }
//   }

//   // Loading skeleton
//   const renderSkeletonRows = () => {
//     return Array(5)
//       .fill(0)
//       .map((_, index) => (
//         <TableRow key={index}>
//           <TableCell>
//             <Skeleton className="h-4 w-24" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-32" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-32" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-24" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-24" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-24" />
//           </TableCell>
//           <TableCell>
//             <Skeleton className="h-4 w-24" />
//           </TableCell>
//         </TableRow>
//       ))
//   }

//   // Bookings Table Component
//   function BookingsTable({ activeTab }: { activeTab: string }) {
//     const filteredBookingsForTable = bookings.filter((booking) => {
//       const matchesTab =
//         activeTab === "all" ||
//         (activeTab === "pending" && booking.status === "pending") ||
//         (activeTab === "checked-in" && booking.status === "checked-in");

//       const matchesSearch =
//         booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.BookingID.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.customerPhone.includes(searchTerm) ||
//         booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

//       return matchesTab && matchesSearch;
//     });

//     const indexOfLastBooking = currentPage * bookingsPerPage;
//     const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
//     const currentBookingsForTable = filteredBookingsForTable.slice(indexOfFirstBooking, indexOfLastBooking);

//     return (
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader className="sticky top-0 bg-background z-10">
//             <TableRow>
//               <TableHead className="w-[100px]">ID</TableHead>
//               <TableHead className="w-[180px]">Khách hàng</TableHead>
//               <TableHead className="w-[180px]">Dịch vụ</TableHead>
//               <TableHead className="w-[120px]">Thời gian</TableHead>
//               <TableHead className="w-[80px]">Giá</TableHead>
//               <TableHead className="w-[100px]">Trạng thái</TableHead>
//               <TableHead className="w-[140px]">Nhân viên</TableHead>
//               <TableHead className="text-right w-[120px]">Thao tác</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               renderSkeletonRows()
//             ) : currentBookingsForTable.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                   {searchTerm ? "Không tìm thấy lịch hẹn phù hợp" : "Không có lịch hẹn nào"}
//                 </TableCell>
//               </TableRow>
//             ) : (
//               currentBookingsForTable.map((booking) => (
//                 <TableRow key={booking.CartID} className="group hover:bg-muted/50">
//                   <TableCell className="font-medium">{booking.BookingID}</TableCell>
//                   <TableCell>
//                     <div className="flex flex-col">
//                       <span className="font-medium truncate max-w-[160px]">{booking.customerName}</span>
//                       <span className="text-xs text-muted-foreground">{booking.customerPhone}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="max-w-[160px] truncate" title={booking.serviceName}>
//                       {booking.serviceName}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="text-xs">
//                       <div>{booking.bookingDate}</div>
//                       <div className="text-muted-foreground">{booking.startTime}</div>
//                     </div>
//                   </TableCell>
//                   <TableCell>{booking.totalPrice.toLocaleString("vi-VN")}</TableCell>
//                   <TableCell>{renderStatusBadge(booking.status)}</TableCell>
//                   <TableCell>
//                     {staffLoading ? (
//                       <Skeleton className="h-8 w-24" />
//                     ) : (
//                       <Select
//                         defaultValue={booking.Skincare_staff || "none"}
//                         onValueChange={(value: string) => {
//                           const staffName = value === "none" ? null : value
//                           updateStaffAssignment(booking.CartID, staffName)
//                         }}
//                         disabled={availableStaff.length === 0}
//                       >
//                         <SelectTrigger className="w-[120px]">
//                           <SelectValue placeholder="Chọn nhân viên">{booking.Skincare_staff || "Chưa gán"}</SelectValue>
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none">Chưa gán</SelectItem>
//                           {availableStaff.map((staff) => (
//                             <SelectItem key={staff.id} value={staff.name}>
//                               {staff.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-1">
//                       {booking.status === "pending" ? (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => handleCheckIn(booking.CartID)}
//                           className="bg-blue-500 hover:bg-blue-600 h-8 px-2"
//                         >
//                           Check-in
//                         </Button>
//                       ) : booking.status === "checked-in" ? (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => handleCheckOut(booking.CartID)}
//                           className="bg-green-500 hover:bg-green-600 h-8 px-2"
//                         >
//                           Check-out
//                         </Button>
//                       ) : (
//                         <span className="text-muted-foreground text-xs">Hoàn thành</span>
//                       )}

//                       <Button variant="ghost" size="icon" className="h-8 w-8" title="Xem chi tiết">
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     )
//   }

//   const totalPages = Math.ceil(
//     bookings.filter((booking) => {
//       const matchesTab =
//         activeTab === "all" ||
//         (activeTab === "pending" && booking.status === "pending") ||
//         (activeTab === "checked-in" && booking.status === "checked-in");

//       const matchesSearch =
//         booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.BookingID.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         booking.customerPhone.includes(searchTerm) ||
//         booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

//       return matchesTab && matchesSearch;
//     }).length / bookingsPerPage
//   );

//   return (
//     <div className="container mx-auto p-4">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
//         <div>
//           <h1 className="text-xl font-bold">Quản lý Check-in</h1>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Tìm kiếm..."
//               className="px-3 py-1 pr-8 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value)
//                 setCurrentPage(1)
//               }}
//             />
//             <span className="absolute right-2 top-1.5 text-gray-400">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </span>
//           </div>

//           <Button variant="outline" size="icon" onClick={fetchBookings} disabled={loading} className="h-8 w-8">
//             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//             <span className="sr-only">Làm mới</span>
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
//         <Card>
//           <CardContent className="p-3 flex items-center gap-3">
//             <div className="bg-blue-100 p-2 rounded-full">
//               <Clock className="h-4 w-4 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Chờ check-in</p>
//               <p className="text-lg font-bold">
//                 {loading ? <Skeleton className="h-6 w-12" /> : bookings.filter((b) => b.status === "pending").length}
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-3 flex items-center gap-3">
//             <div className="bg-green-100 p-2 rounded-full">
//               <CheckCircle className="h-4 w-4 text-green-600" />
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Đã check-in</p>
//               <p className="text-lg font-bold">
//                 {loading ? <Skeleton className="h-6 w-12" /> : bookings.filter((b) => b.status === "checked-in").length}
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-3 flex items-center gap-3">
//             <div className="bg-purple-100 p-2 rounded-full">
//               <User className="h-4 w-4 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-xs text-muted-foreground">Nhân viên</p>
//               <p className="text-lg font-bold">
//                 {staffLoading ? <Skeleton className="h-6 w-12" /> : availableStaff.length}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="mb-4">
//         <CardContent className="p-0">
//           <Tabs
//             defaultValue="all"
//             value={activeTab}
//             onValueChange={(value: string) => setActiveTab(value)}
//             className="w-full"
//           >
//             <div className="border-b px-2">
//               <TabsList className="h-10">
//                 <TabsTrigger
//                   value="all"
//                   className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
//                 >
//                   Tất cả
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="pending"
//                   className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
//                 >
//                   Chờ check-in
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="checked-in"
//                   className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
//                 >
//                   Đã check-in
//                 </TabsTrigger>
//               </TabsList>
//             </div>
//           </Tabs>
//           <div className="max-h-[calc(100vh-280px)] overflow-auto">
//             <BookingsTable activeTab={activeTab} />
//           </div>
//         </CardContent>
//       </Card>

//       {!loading && bookings.length > 0 && (
//         <div className="flex justify-center mt-2 space-x-2">
//           <Button
//             onClick={goToPreviousPage}
//             disabled={currentPage === 1}
//             variant="outline"
//             size="sm"
//             className={`h-8 px-2 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
//           >
//             Trước
//           </Button>
//           <span className="py-1 px-2 text-sm">
//             {currentPage} / {totalPages}
//           </span>
//           <Button
//             onClick={goToNextPage}
//             disabled={currentPage === totalPages}
//             variant="outline"
//             size="sm"
//             className={`h-8 px-2 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
//           >
//             Sau
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default StaffCheckIn