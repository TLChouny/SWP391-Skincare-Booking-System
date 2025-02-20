import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import CheckoutPage from "../pages/Home/CheckoutPage";
import ContactPage from "../pages/Home/ContactPage";
const AppRoutes = () => {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(HomePage, {}) }), _jsx(Route, { path: '/setting', element: _jsx(SettingPage, {}) }), _jsx(Route, { path: '/booking/:id', element: _jsx(BookingPage, {}) }), _jsx(Route, { path: '/checkout', element: _jsx(CheckoutPage, {}) }), _jsx(Route, { path: '/contact', element: _jsx(ContactPage, {}) }), " ", _jsx(Route, { path: '/services', element: _jsx(ServicePage, {}) }), _jsx(Route, { path: '/blog', element: _jsx(BlogPage, {}) }), _jsxs(Route, { path: '/admin', element: _jsx(Dashboard, {}), children: [_jsx(Route, { path: 'user-management', element: _jsx(ManageUser, {}) }), _jsx(Route, { path: 'category-management', element: _jsx(ManageCategory, {}) }), _jsx(Route, { path: 'blog-management', element: _jsx(ManageBlog, {}) }), _jsx(Route, { path: 'payment-management', element: _jsx(ManagePayment, {}) }), _jsx(Route, { path: 'rating-management', element: _jsx(ManageRating, {}) }), _jsx(Route, { path: 'question-management', element: _jsx(ManageQuestion, {}) })] }), _jsxs(Route, { path: '/therapist', element: _jsx(TherapistManagement, {}), children: [_jsx(Route, { path: 'therapistSchedule', element: _jsx(TherapistSchedule, {}) }), _jsx(Route, { path: 'therapistAppointments', element: _jsx(TherapistAppointments, {}) }), _jsx(Route, { path: 'therapistProfile', element: _jsx(TherapistProfile, {}) }), _jsx(Route, { path: 'serviceHistory', element: _jsx(ServiceHistory, {}) }), _jsx(Route, { path: 'serviceExecution', element: _jsx(ServiceExecution, {}) }), _jsx(Route, { path: 'customerRecords', element: _jsx(CustomerRecords, {}) })] }), _jsxs(Route, { path: '/staff', element: _jsx(StaffManagement, {}), children: [_jsx(Route, { path: 'staffBooking', element: _jsx(StaffBooking, {}) }), _jsx(Route, { path: 'staffPayment', element: _jsx(StaffPayment, {}) }), _jsx(Route, { path: 'staffService', element: _jsx(StaffService, {}) })] }), _jsx(Route, { path: '/login', element: _jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx(Login, {})] }) }), _jsx(Route, { path: '/register', element: _jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx(Register, {})] }) })] }) }));
};
export default AppRoutes;
