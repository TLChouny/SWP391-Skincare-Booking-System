import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
        // getBookings().then((res) => setBookings(res.data));
    }, []);
    return (_jsxs("div", { children: [_jsx("h1", { children: "Admin Dashboard" }), _jsx("h2", { children: "All Bookings" }), _jsx("ul", { children: bookings.map((booking) => (_jsxs("li", { children: [booking.name, " - ", booking.service, " on ", booking.date] }, booking.id))) })] }));
};
export default AdminDashboard;
