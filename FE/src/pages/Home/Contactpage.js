import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
const ContactPage = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const handleOpenModal = () => {
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted, navigating to homepage...");
        navigate("/");
    };
    return (_jsxs("div", { className: "container mx-auto py-16 text-center", children: [_jsx("button", { onClick: handleOpenModal, className: "py-2 px-4 bg-blue-500 text-white rounded-lg", children: "Contact Us" }), _jsx(AnimatePresence, { children: showModal && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, transition: { duration: 0.3 }, className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center", children: _jsxs(motion.div, { initial: { scale: 0.9 }, animate: { scale: 1 }, exit: { scale: 0.9 }, transition: { duration: 0.3 }, className: "bg-white p-8 rounded-lg shadow-lg w-1/2 relative", children: [_jsx("h3", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Contact Information" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("input", { type: "text", placeholder: "Name", className: "mb-4 p-2 border w-full", required: true }), _jsx("input", { type: "text", placeholder: "Phone Number", className: "mb-4 p-2 border w-full", required: true }), _jsxs("div", { className: "flex justify-center gap-2 mt-4", children: [_jsx("button", { type: "submit", className: "py-2 px-4 bg-blue-500 text-white rounded-lg", onClick: handleSubmit, children: "Submit" }), _jsx("button", { type: "button", onClick: handleCloseModal, className: "py-2 px-4 bg-gray-500 text-white rounded-lg", children: "Cancel" })] })] })] }) })) })] }));
};
export default ContactPage;
