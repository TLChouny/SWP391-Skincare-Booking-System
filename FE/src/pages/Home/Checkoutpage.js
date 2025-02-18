import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
const CheckoutPage = () => {
    const [cart, setCart] = useState([]);
    const [timeLeft, setTimeLeft] = useState(600); // 10 phút
    const navigate = useNavigate();
    useEffect(() => {
        // Lấy danh sách dịch vụ đã đặt từ localStorage hoặc state
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(storedCart);
        // Bộ đếm ngược
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert("Thời gian thanh toán đã hết. Đơn hàng bị hủy.");
                    localStorage.removeItem("cart");
                    navigate("/booking");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);
    const handlePayment = () => {
        alert("Thanh toán thành công!");
        localStorage.removeItem("cart");
        navigate("/");
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "container mx-auto py-16", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-10", children: "Checkout" }), _jsxs("div", { className: "text-center text-xl text-red-500 mb-4", children: ["Th\u1EDDi gian c\u00F2n l\u1EA1i: ", formatTime(timeLeft)] }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto", children: cart.length === 0 ? (_jsx("p", { className: "text-center text-gray-600", children: "Gi\u1ECF h\u00E0ng c\u1EE7a b\u1EA1n \u0111ang tr\u1ED1ng." })) : (_jsxs(_Fragment, { children: [_jsx("ul", { children: cart.map((item, index) => (_jsxs("li", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { children: item.name }), _jsxs("span", { children: [item.price, " VND"] })] }, index))) }), _jsxs("div", { className: "text-right text-lg font-bold mt-4", children: ["T\u1ED5ng c\u1ED9ng: ", cart.reduce((sum, item) => sum + item.price, 0), " VND"] }), _jsx("button", { onClick: handlePayment, className: "mt-6 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600", children: "Thanh to\u00E1n ngay" })] })) })] }) }));
};
export default CheckoutPage;
