import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/Homepage";
import BookingPage from "../pages/Home/Bookingpage";
import AdminDashboard from "../pages/Manager/AdminDashboard";
import Login from "../layout/Login";
import Header from "../layout/Header";
import Register from "../layout/Register";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<><Header/><Login /></>}/>
        <Route path="/register" element={<><Header/><Register/></>}/>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
