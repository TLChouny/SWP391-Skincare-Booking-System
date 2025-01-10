import React, { useEffect, useState } from "react";
import { getBookings } from "../../api/api";
import { Booking } from "../../types/booking";

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getBookings().then((res) => setBookings(res.data));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>All Bookings</h2>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {booking.name} - {booking.service} on {booking.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
