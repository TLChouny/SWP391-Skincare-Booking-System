import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/Homepage";
import BookingPage from "../pages/Home/Bookingpage";
import Login from "../layout/Login";
import Header from "../layout/Header";
import Register from "../layout/Register";
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
import SettingPage from "../pages/Home/Settingpage";
import TherapistManagement from "../components/Therapist/TherapistManagement";
import TherapistSchedule from "../pages/Therapist/TherapistSchedule";
import TherapistAppointments from "../pages/Therapist/TherapistAppointments";
import ServiceHistory from "../pages/Therapist/ServiceHistory";
import ServiceExecution from "../pages/Therapist/ServiceExecution";
import CustomerRecords from "../pages/Therapist/CustomerRecords";
import TherapistProfile from "../pages/Therapist/TherapistProfile";
import StaffManagement from "../components/Staff/StaffManagement";
import StaffBooking from "../pages/Staff/StaffBooking";
import StaffPayment from "../pages/Staff/StaffPayment";
import StaffService from "../pages/Staff/StaffService";
import CheckoutPage from "../pages/Home/Checkoutpage";
import ContactPage from "../pages/Home/ContactPage";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/setting' element={<SettingPage />} />
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
        {/* The therapist router */}
        <Route path='/therapist' element={<TherapistManagement />}>
          <Route path='therapistSchedule' element={<TherapistSchedule />} />
          <Route
            path='therapistAppointments'
            element={<TherapistAppointments />}
          />
          <Route path='therapistProfile' element={<TherapistProfile />} />

          <Route path='serviceHistory' element={<ServiceHistory />} />
          <Route path='serviceExecution' element={<ServiceExecution />} />
          <Route path='customerRecords' element={<CustomerRecords />} />
        </Route>
        {/* Staff router */}
        <Route path='/staff' element={<StaffManagement />}>
          <Route path='staffBooking' element={<StaffBooking />} />
          <Route path='staffPayment' element={<StaffPayment />} />
          <Route path='staffService' element={<StaffService />} />
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
