import React, { useEffect, useState } from "react";
import { getBookings } from "../api/api"; // Import the API function to fetch bookings
import { Booking } from "../types/booking"; // Import the Booking interface
import Layout from "../layout/Layout";

const HomePage: React.FC = () => {
  // // State to hold the bookings data
  // const [bookings, setBookings] = useState<Booking[]>([]);

  // // Fetch the bookings data when the component mounts
  // useEffect(() => {
  //   getBookings()
  //     .then((response) => {
  //       setBookings(response.data.Booking); // Update the state with the bookings data
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching bookings:", error); // Handle any errors
  //     });
  // }, []);

  return (
    <div>
      <Layout>
      <header>
        <h1>Welcome to Skincare Center</h1>
      </header>
      <section>
        <h2>Our Services</h2>
        <ul>
          <li>Facial Treatment - $50</li>
          <li>Acne Therapy - $70</li>
        </ul>
      </section>
      </Layout>
    </div>
  );
};

export default HomePage;
