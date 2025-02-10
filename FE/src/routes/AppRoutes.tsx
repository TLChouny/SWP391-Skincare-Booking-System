import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/Homepage";
import BookingPage from "../pages/Home/Bookingpage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Login from "../layout/Login";
import Header from "../layout/Header";
import Register from "../layout/Register";
import ContactPage from "../pages/Home/ContactPage";
{
  /* Đảm bảo dùng đúng trang này */
}
import ServicePage from "../pages/Home/Servicepage";
import BlogPage from "../pages/Home/Blogpage";
import Dashboard from "../components/Dashboard/Dashboard";
import ManageUser from "../pages/admin/ManageUser";
import ManageCategory from "../pages/admin/ManageCategory";
import ManageBlog from "../pages/admin/ManageBlog";
import ManagePayment from "../pages/admin/ManagePayment";
import ManageRating from "../pages/admin/ManageRating";
import ManageQuestion from "../pages/admin/ManageQuestion";
import CheckoutPage from "../pages/Home/CheckoutPage";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/booking/:id' element={<BookingPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/contact' element={<ContactPage />} />{" "}
        {/* Modal sẽ hiện ra ở đây */}
        <Route path='/services' element={<ServicePage />} />
        <Route path='/blog' element={<BlogPage />} />
        {/* <Route path="/blog-details/:id" element={<BlogPage />} /> */}
        <Route path='/admin' element={<Dashboard />}>
          <Route path='user-management' element={<ManageUser />} />
          <Route path='category-management' element={<ManageCategory />} />
          <Route path='blog-management' element={<ManageBlog />} />
          <Route path='payment-management' element={<ManagePayment />} />
          <Route path='rating-management' element={<ManageRating />} />
          <Route path='question-management' element={<ManageQuestion />} />
        </Route>
        <Route
          path='/login'
          element={
            <>
              <Header />
              <Login />
            </>
          }
        />
        <Route
          path='/register'
          element={
            <>
              <Header />
              <Register />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
