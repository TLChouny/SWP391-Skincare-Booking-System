// Tính tổng số người dùng
export const calculateTotalUsers = (users: any[]) => {
    const filteredUsers = users.filter((user) => user.role === "user");
    return filteredUsers.length;
  };
  
  
  // Tính tổng số đơn hàng đã hoàn thành
  export const calculateTotalBookings = (carts: any[]) => { 
    return carts.filter((cart) => cart.status === "reviewed" || cart.status === "checked-out").length;
  };
  

  
  // Tính đánh giá trung bình
 // utils/utils.ts
 export const calculateOverallAverageRating = (ratings: any[]) => {
    if (!ratings.length) return 0;
  
    const totalStars = ratings.reduce((sum, r) => sum + (r.serviceRating || 0), 0);
    const avg = totalStars / ratings.length;
  
    return Number(avg.toFixed(1)); // làm tròn 1 số sau dấu phẩy
  };
  
  
  
  
  
  // Tính tổng số tiền thanh toán
  // Tính tổng tiền của các payment thành công
export const calculateTotalSuccessfulPayments = (payments: any[]) => {
    return payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };
  
  
  