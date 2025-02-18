import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import "../../src/index.css";
import logo from "../assets/logo7.png";
import { Link, useNavigate } from "react-router-dom";
import { Divider } from "antd";
const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    // State để mở/đóng modal
    const [showModal, setShowModal] = useState(false);
    // Hàm mở modal
    const handleOpenModal = () => {
        setShowModal(true);
    };
    // Hàm đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
    };
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };
    return (_jsxs("header", { style: { background: "#dad5c9" }, className: "bg-#dad5c9 to-indigo-500 text-black py-4 shadow-lg sticky top-0 z-50", children: [_jsxs("div", { className: "container mx-auto flex justify-between items-center px-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Link, { to: "/", children: _jsx("img", { src: logo, alt: "LuLuSpa Logo", className: "w-16 h-16 rounded-full" }) }), _jsxs("h1", { className: "text-2xl md:text-3xl font-extrabold tracking-wide", children: [_jsx("span", { className: "text-black-300", children: "LuLu" }), _jsx("span", { className: "text-yellow-300", children: "Spa" })] })] }), _jsx("nav", { children: _jsxs("ul", { className: "hidden md:flex space-x-8 text-lg font-medium", children: [_jsx("li", { children: _jsx(Link, { to: "/", className: "hover:text-yellow-300 transition duration-300 ease-in-out", children: "Home" }) }), _jsx("li", { children: _jsx(Link, { to: "/services", className: "hover:text-yellow-300 transition duration-300 ease-in-out", children: "Services" }) }), _jsx("li", { children: _jsx(Link, { to: "/booking", className: "hover:text-yellow-300 transition duration-300 ease-in-out", children: "Booking" }) }), _jsx("li", { children: _jsx(Link, { to: "/blog", className: "hover:text-yellow-300 transition duration-300 ease-in-out", children: "Blog" }) }), _jsx("li", { children: _jsx("button", { onClick: handleOpenModal, className: "hover:text-yellow-300 transition duration-300 ease-in-out", children: "Contact" }) })] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { title: "Book your appointment now", className: "hidden md:block bg-yellow-300 text-black py-2 px-6 rounded-lg shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out", children: "Book Now" }), _jsx("div", { className: "flex items-center space-x-2", children: user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "font-medium", children: ["Welcome, ", user.username] }), _jsx("button", { onClick: handleLogout, className: "ml-4 text-red-500", children: "Logout" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", children: _jsx("span", { children: "Login" }) }), _jsx(Divider, { type: "vertical", className: "border-black mt-1 h-7" }), _jsx(Link, { to: "/register", children: _jsx("span", { children: "Signup" }) })] })) })] })] }), showModal && (_jsx("div", { className: "fixed  inset-0 bg-black bg-opacity-50 flex justify-center items-center", children: _jsxs("div", { className: "bg-white p-8 rounded-lg shadow-lg w-1/2", children: [_jsx("button", { onClick: handleCloseModal, className: " text-2xl float-right", children: "\u00D7" }), _jsx("h3", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Contact Information" }), _jsxs("form", { children: [_jsx("input", { type: "text", placeholder: "Name", className: "mb-4 p-2 border w-full" }), _jsx("input", { type: "text", placeholder: "Phone Number", className: "mb-4 p-2 border w-full" }), _jsx("button", { className: "py-2 px-4 bg-blue-500 text-white rounded-lg mt-4", children: "Submit" })] }), _jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "text-gray-600", children: "Store Name: LuLuSpa" }), _jsx("p", { className: "text-gray-600", children: "Phone: 123-456-789" }), _jsx("p", { className: "text-gray-600", children: "Email: info@luluspa.com" }), _jsx("a", { href: "https://facebook.com/luluspa", className: "text-blue-600", children: "Facebook" })] })] }) }))] }));
};
export default Header;
