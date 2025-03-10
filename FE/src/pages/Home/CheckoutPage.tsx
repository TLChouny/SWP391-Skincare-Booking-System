// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "../../layout/Layout";

// // Các interface giữ nguyên như code gốc
// interface Therapist {
//   id: string;
//   name: string;
//   schedule: string[];
// }

// interface Service {
//   id: string;
//   name: string;
//   description: string;
//   image?: string;
//   duration?: number;
//   price?: number;
// }

// interface Booking {
//   service: Service;
//   customerName: string;
//   customerPhone: string;
//   selectedDate: string;
//   selectedTherapist: Therapist;
//   selectedSlot: string;
//   timestamp: number;
//   status: "pending" | "completed";
// }

// const CheckoutPage: React.FC = () => {
//   const [cart, setCart] = useState<Booking[]>([]);
//   const [isPaid, setIsPaid] = useState<boolean>(false);
//   const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedCart: Booking[] = JSON.parse(localStorage.getItem("cart") || "[]");
//     setCart(storedCart);

//     if (storedCart.length === 0) {
//       navigate("/booking");
//     }
//   }, [navigate]);

//   const handlePaymentConfirm = () => {
//     const updatedCart: Booking[] = cart.map(item => ({ ...item, status: "completed" }));
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     setCart(updatedCart);
//     setIsPaid(true);
//     setShowConfirmModal(false);
//     setTimeout(() => {
//       localStorage.removeItem("cart");
//       navigate("/");
//     }, 3000);
//   };

//   const totalAmount = cart.reduce((sum, item) => sum + (item.service.price || 0), 0);

//   return (
//     <Layout>
//       <div className="container mx-auto py-16 px-4">
//         <h2 className="text-4xl font-bold text-center mb-10">Checkout</h2>

//         <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
//           {cart.length === 0 ? (
//             <p className="text-center text-gray-600">Giỏ hàng của bạn đang trống.</p>
//           ) : isPaid ? (
//             <div className="text-center">
//               <p className="text-green-500 text-xl font-semibold mb-4">Đặt dịch vụ thành công!</p>
//               <ul className="max-h-[60vh] overflow-y-auto">
//                 {cart.map((item, index) => (
//                   <li key={index} className="flex justify-between py-2 border-b">
//                     <div>
//                       <p><strong>{item.service.name}</strong></p>
//                       <p>{item.selectedDate} - {item.selectedSlot}</p>
//                       <p>Therapist: {item.selectedTherapist.name}</p>
//                     </div>
//                     <span>${item.service.price || 0}</span>
//                   </li>
//                 ))}
//               </ul>
//               <p className="text-gray-600 mt-4">Bạn sẽ được chuyển hướng về trang chủ trong giây lát...</p>
//             </div>
//           ) : (
//             <>
//               <ul className="max-h-[50vh] overflow-y-auto mb-4">
//                 {cart.map((item, index) => (
//                   <li key={index} className="flex justify-between py-2 border-b">
//                     <div>
//                       <p><strong>{item.service.name}</strong></p>
//                       <p>{item.selectedDate} - {item.selectedSlot}</p>
//                       <p>Therapist: {item.selectedTherapist.name}</p>
//                     </div>
//                     <span>${item.service.price || 0}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="text-right text-lg font-bold mt-4">
//                 Tổng cộng: ${totalAmount}
//               </div>
//               <button
//                 onClick={() => setShowConfirmModal(true)}
//                 className="mt-6 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
//               >
//                 Thanh toán ngay
//               </button>
//             </>
//           )}
//         </div>

//         {/* Modal Confirm Payment */}
//         {showConfirmModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//               <h3 className="text-2xl font-bold mb-4">Xác nhận thanh toán</h3>
//               <p className="mb-4">Vui lòng xác nhận thông tin thanh toán:</p>
//               <ul className="mb-4 max-h-[40vh] overflow-y-auto">
//                 {cart.map((item, index) => (
//                   <li key={index} className="py-2 border-b">
//                     <p><strong>{item.service.name}</strong></p>
//                     <p>{item.selectedDate} - {item.selectedSlot}</p>
//                     <p>Therapist: {item.selectedTherapist.name}</p>
//                     <p>Giá: ${item.service.price || 0}</p>
//                   </li>
//                 ))}
//               </ul>
//               <p className="text-lg font-bold mb-4">Tổng cộng: ${totalAmount}</p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setShowConfirmModal(false)}
//                   className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition duration-300"
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   onClick={handlePaymentConfirm}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
//                 >
//                   Xác nhận
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default CheckoutPage;