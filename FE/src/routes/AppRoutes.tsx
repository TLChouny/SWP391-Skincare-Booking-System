  import React from "react";
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import HomePage from "../pages/Home/Homepage";
  import BookingPage from "../pages/Home/Bookingpage";
  import AdminDashboard from "../pages/Manager/AdminDashboard";
  import Login from "../layout/Login";
  import Header from "../layout/Header";
  import Register from "../layout/Register";
  import ContactPage from "../pages/Home/ContactPage";  {/* Đảm bảo dùng đúng trang này */}
  import ServicePage from "../pages/Home/Servicepage";
  import BlogPage from "../pages/Home/Blogpage";

  const AppRoutes: React.FC = () => {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} /> {/* Modal sẽ hiện ra ở đây */}
          <Route path="/services" element={<ServicePage />} />
          <Route path="/blog" element={<BlogPage />} />
          {/* <Route path="/blog-details/:id" element={<BlogPage />} /> */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<><Header/><Login /></>}/>
          <Route path="/register" element={<><Header/><Register/></>}/></Routes>
      </Router>
    );
  };

  export default AppRoutes;
