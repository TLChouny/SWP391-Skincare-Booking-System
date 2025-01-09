import React, { useState, useEffect } from "react";
import { getBookings, createBooking } from "../api/api";
import { Booking } from "../types/booking";

const BookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBooking, setNewBooking] = useState<Booking>({
    name: "",
    date: "",
    service: "",
  });

  useEffect(() => {
    getBookings().then((res) => setBookings(res.data));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handleSubmit = async () => {
    await createBooking(newBooking);
    const res = await getBookings();
    setBookings(res.data);
    setNewBooking({ name: "", date: "", service: "" });
  };

  return (
    <div>
      <h1>Booking Page</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newBooking.name}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="date"
          value={newBooking.date}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="service"
          placeholder="Service"
          value={newBooking.service}
          onChange={handleInputChange}
        />
        <button type="button" onClick={handleSubmit}>
          Book Now
        </button>
      </form>

      <h2>Existing Bookings</h2>
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

export default BookingPage;
