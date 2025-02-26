import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/Homepage";
import BookingPage from "../pages/Home/Bookingpage";
import Login from "../layout/Login";
import Header from "../layout/Header";
import Register from "../layout/Register";

import ServicePage from "../pages/Home/Servicepage";
import BlogPage from "../pages/Home/Blogpage";
import ManageUser from "../pages/admin/ManageUser";
import ManageCategory from "../pages/admin/ManageCategory";
import ManageBlog from "../pages/admin/ManageBlog";
import ManagePayment from "../pages/admin/ManagePayment";
import ManageRating from "../pages/admin/ManageRating";
import ManageQuestion from "../pages/admin/ManageQuestion";
import SettingPage from "../pages/Home/Settingpage";
import TherapistManagement from "../components/Therapist/TherapistManagement";
import ServiceHistory from "../pages/Therapist/ServiceHistory";
import StaffManagement from "../components/Staff/StaffManagement";
import CheckoutPage from "../pages/Home/Checkoutpage";
import ContactPage from "../pages/Home/ContactPage";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminDashboard from "../components/Admin/AdminDashboard";
import CheckIn from "../pages/Staff/CheckIn";
import AssignSpecialists from "../pages/Staff/AssignSpecialists";
import CheckOut from "../pages/Staff/CheckOut";
import AppointmentSchedules from "../pages/Staff/AppointmentSchedules";
import ListOfAssigned from "../pages/Therapist/ListOfAssigned";
import PerformService from "../pages/Therapist/PerformService";

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
        <Route path='/admin' element={<AdminDashboard />}>
          <Route index element={<AdminOverview />} />
          <Route path='user-management' element={<ManageUser />} />
          <Route path='category-management' element={<ManageCategory />} />
          <Route path='blog-management' element={<ManageBlog />} />
          <Route path='payment-management' element={<ManagePayment />} />
          <Route path='rating-management' element={<ManageRating />} />
          <Route path='question-management' element={<ManageQuestion />} />
        </Route>
        {/* The therapist router */}
        <Route path='/therapist' element={<TherapistManagement />}>
          <Route path='list-of-assigned' element={<ListOfAssigned />} />
          <Route path='perfom-service' element={<PerformService />} />
          <Route path='service-history' element={<ServiceHistory />} />
        </Route>
        {/* Staff router */}
        <Route path='/staff' element={<StaffManagement />}>
          <Route path='check-in' element={<CheckIn />} />
          <Route path='assign-specialists' element={<AssignSpecialists />} />
          <Route path='check-out' element={<CheckOut />} />
          <Route
            path='appointment-schedules'
            element={<AppointmentSchedules />}
          />
        </Route>
        {/* Login */}
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
