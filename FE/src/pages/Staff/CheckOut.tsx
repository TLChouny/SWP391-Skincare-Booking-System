// "use client";

// import React, { useState, useEffect } from "react";
// import { Table, Button, message } from "antd";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const StaffCheckout: React.FC = () => {
//   const [checkIns, setCheckIns] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Hàm lấy danh sách check-in với status "completed" từ API
//   const fetchCompletedCheckIns = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/checkins?status=completed", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//       });
//       const data = await response.json();
//       setCheckIns(data);
//     } catch (error) {
//       console.error("Error fetching completed check-ins:", error);
//       toast.error("Không thể tải danh sách check-in đã hoàn thành!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm xử lý checkout
//   const handleCheckout = async (checkInId) => {
//     try {
//       const response = await fetch(`/api/checkout/${checkInId}`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: "checkedOut", checkOutTime: new Date().toISOString() }),
//       });

//       if (response.ok) {
//         toast.success("Checkout thành công!");
//         // Cập nhật lại danh sách sau khi checkout
//         setCheckIns(checkIns.filter((item) => item.id !== checkInId));
//       } else {
//         throw new Error("Checkout thất bại!");
//       }
//     } catch (error) {
//       console.error("Error during checkout:", error);
//       toast.error("Có lỗi xảy ra khi checkout!");
//     }
//   };

//   // Lấy dữ liệu khi component mount
//   useEffect(() => {
//     fetchCompletedCheckIns();
//   }, []);

//   // Cấu hình cột cho bảng (dựa trên hình ảnh)
//   const columns = [
//     {
//       title: "Customer Name",
//       dataIndex: "customerName",
//       key: "customerName",
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//     },
//     {
//       title: "Phone",
//       dataIndex: "phone",
//       key: "phone",
//     },
//     {
//       title: "Service",
//       dataIndex: "service",
//       key: "service",
//     },
//     {
//       title: "Booking Date",
//       dataIndex: "bookingDate",
//       key: "bookingDate",
//     },
//     {
//       title: "Start Time",
//       dataIndex: "startTime",
//       key: "startTime",
//     },
//     {
//       title: "Total Price (VND)",
//       dataIndex: "totalPrice",
//       key: "totalPrice",
//       render: (text) => `${text.toLocaleString()} VND`,
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Button
//           type="primary"
//           onClick={() => handleCheckout(record.id)}
//           disabled={record.status === "checkedOut"} // Vô hiệu hóa nếu đã checkout
//         >
//           Checkout
//         </Button>
//       ),
//     },
//     {
//       title: "Specialist",
//       dataIndex: "specialist",
//       key: "specialist",
//     },
//   ];

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Staff Checkout Management</h1>
//       <Table
//         columns={columns}
//         dataSource={checkIns}
//         rowKey="id"
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//         bordered
//       />
//       <ToastContainer autoClose={3000} />
//     </div>
//   );
// };

// export default StaffCheckout;
