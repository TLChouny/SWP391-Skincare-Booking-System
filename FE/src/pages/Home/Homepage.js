import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";
import { getServices } from "../../api/apiService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
const HomePage = () => {
    const [services, setServices] = useState([]);
    const [hoveredService] = useState(null);
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        getServices()
            .then((response) => {
            if ((response === null || response === void 0 ? void 0 : response.data) && Array.isArray(response.data)) {
                setServices(response.data);
            }
            else {
                console.error("Dữ liệu trả về không hợp lệ:", response);
            }
        })
            .catch((error) => {
            console.error("Lỗi khi lấy dịch vụ:", error);
        });
    }, []);
    const handleBookNow = (id) => {
        navigate(`/booking/${id}`);
    };
    const handleNext = () => {
        setCurrentServiceIndex((prevIndex) => (prevIndex + 1) % Math.ceil(services.length / 3));
    };
    return (_jsxs(Layout, { children: [_jsxs("section", { className: "relative w-full h-screen overflow-hidden", children: [_jsx("video", { src: video1, autoPlay: true, loop: true, muted: true, playsInline: true, className: "absolute top-0 left-0 w-full h-full object-cover", style: { width: '100%', height: '100%' } }), _jsxs("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-6", children: [_jsx(motion.h1, { className: "text-5xl font-bold mb-4", initial: { opacity: 0, y: -50 }, animate: { opacity: [0, 1, 0], y: [0, -10, 0] }, transition: { duration: 3, repeat: Infinity }, children: "Discover the Magic of LuLuSpaspa" }), _jsx(motion.p, { className: "text-xl", initial: { opacity: 0, y: 20 }, animate: { opacity: [0, 1, 0], y: [20, 10, 20] }, transition: { delay: 0.5, duration: 3, repeat: Infinity }, children: "Your Skin, Our Passion" }), _jsx(motion.button, { onClick: () => handleBookNow("service_id"), className: "mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:bg-blue-600 transition", whileHover: { scale: 1.1 }, children: "Book Your Appointment" })] })] }), _jsx("section", { className: "bg-gray-100 py-16", children: _jsxs("div", { className: "container mx-auto text-center", children: [_jsx("h2", { className: "text-4xl font-extrabold text-gray-900 mb-6", children: "Skincare Packages" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8", children: _jsx(AnimatePresence, { children: services.length > 0 ? (services.slice(currentServiceIndex * 3, (currentServiceIndex + 1) * 3).map((service) => (_jsxs(motion.div, { className: "bg-white p-6 rounded-lg shadow-lg transition border-2 border-yellow-300", initial: { opacity: 1, x: 0 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, children: [_jsx(motion.img, { src: service.image || "/default-service.jpg", alt: service.name, className: "w-full h-48 object-cover rounded-lg mb-4" }), _jsx("h3", { className: "text-3xl font-semibold text-gray-800 mt-2", children: service.name }), _jsx(AnimatePresence, { children: hoveredService === service && (_jsxs(motion.div, { className: "absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-4 rounded-lg", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, children: [_jsx("p", { children: service.description }), _jsx("p", { className: "mt-2 text-xl font-bold", children: service.price ? `$${service.price}` : "Contact for Price" })] })) }), _jsx("button", { onClick: () => handleBookNow(service.id), className: "mt-4 py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-500 transition", children: "Book Now" })] }, service.id)))) : (_jsx("p", { className: "text-gray-600", children: "No services available at the moment." })) }) }), _jsx("button", { onClick: () => handleNext(), className: "mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition", children: "Next" })] }) }), _jsx("section", { className: "py-16 bg-white", children: _jsxs("div", { className: "container mx-auto text-center", children: [_jsx("h2", { className: "text-4xl font-extrabold text-gray-900 mb-6", children: "Latest from our Blog" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8", children: [...Array(3)].map((_, index) => (_jsxs(motion.div, { className: "bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl border-2 border-yellow-300", whileHover: { scale: 1.05 }, children: [_jsxs("h3", { className: "text-2xl font-semibold text-gray-800", children: ["Blog Title ", index + 1] }), _jsx("p", { className: "mt-4 text-gray-600", children: "Short description of the blog post..." }), _jsx("button", { className: "mt-6 py-2 px-4 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition", children: "Read More" })] }, index))) })] }) })] }));
};
export default HomePage;
