import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/Homepage";
import BookingPage from "../pages/Home/Bookingpage";
import Login from "../layout/Login";
import Header from "../layout/Header";
import Register from "../layout/Register";
import { AuthProvider } from "../context/AuthContext";
//homepage
import ServicePage from "../pages/Home/Servicepage";
import SettingPage from "../pages/Home/Settingpage";
// import CheckoutPage from "../pages/Home/CheckoutPage";
import ContactPage from "../pages/Home/ContactPage";
import BlogPage from "../pages/Home/Blogpage";
import TestPage from "../pages/Home/SkinAssessmentQuiz";

//manager
import ManageUser from "../pages/admin/ManageUser";
import ManageCategory from "../pages/admin/ManageCategory";
import ManageBlog from "../pages/admin/ManageBlog";
import ManagePayment from "../pages/admin/ManagePayment";
import ManageRating from "../pages/admin/ManageRating";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminDashboard from "../components/Admin/AdminDashboard";
import ManageQuestion from "../pages/admin/ManageQuestion";

//staff
import CheckIn from "../pages/Staff/CheckIn";
import AssignSpecialists from "../pages/Staff/AssignSpecialists";
import CheckOut from "../pages/Staff/CheckOut";
import AppointmentSchedules from "../pages/Staff/AppointmentSchedules";
import StaffManagement from "../components/Staff/StaffManagement";

//therapist
import ServiceHistory from "../pages/Therapist/ServiceHistory";
import TherapistManagement from "../components/Therapist/TherapistManagement";
import ListOfAssigned from "../pages/Therapist/ListOfAssigned";
import PerformService from "../pages/Therapist/PerformService";
import Forgot_password from "../layout/Forgot_password";
import ManageService from "../pages/admin/ManageService";

//customer
import ProfileUser from "../pages/Customer/Customer_profile";
const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route
            path='/forgot-password'
            element={
              <>
                <Header />
                <Forgot_password />
              </>
            }
          />
          <Route path='/settings' element={<SettingPage />} />
          <Route path='/booking/:id' element={<BookingPage />} />
          {/* <Route path='/checkout' element={<CheckoutPage />} /> */}
          <Route path='/contact' element={<ContactPage />} />{" "}
          <Route path='/services' element={<ServicePage />} />
          <Route path='/blog' element={<BlogPage />} />
          <Route path='/test' element={<TestPage />} />
          {/* <Route path="/blog-details/:id" element={<BlogPage />} /> */}
          <Route path='/admin' element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path='user-management' element={<ManageUser />} />
            <Route path='service-management' element={<ManageService />} />
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
            <Route path="check-out" element={<CheckOut />} />
            <Route
              path='appointment-schedules'
              element={<AppointmentSchedules />}
            />
          </Route>
          {/* Staff router */}
          <Route path='/dashboard' element={<ProfileUser />} />
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
    </AuthProvider>
  );
};

export default AppRoutes;
