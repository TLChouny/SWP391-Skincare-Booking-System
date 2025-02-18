import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layout/Layout";
const ServicePage = () => {
    var _a;
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products/");
                const formattedData = response.data.map((service) => (Object.assign(Object.assign({}, service), { price: formatPrice(service.price) })));
                setServices(formattedData);
            }
            catch (error) {
                console.error("Error fetching services:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);
    // Hàm format giá tiền thành dạng "100.000 VNĐ"
    const formatPrice = (price) => {
        let priceValue = 0;
        if (typeof price === "object" && price.$numberDecimal) {
            priceValue = parseFloat(price.$numberDecimal);
        }
        else if (typeof price === "number") {
            priceValue = price;
        }
        else if (typeof price === "string") {
            priceValue = parseFloat(price.replace(/\./g, ""));
        }
        return `${priceValue.toLocaleString("vi-VN")} VNĐ`;
    };
    const selectedServiceDetails = services.find((service) => service.name === selectedService);
    const closeModal = () => {
        setSelectedService(null);
    };
    const splitDescription = (description) => {
        return description.split("\n").map((line, index) => (_jsxs("p", { className: "text-lg text-gray-600 flex items-start", children: [_jsx("span", { className: "mr-2 text-blue-500", children: "\u2022" }), line] }, index)));
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "container mx-auto px-6 py-16", children: [_jsx("h2", { className: "text-4xl font-bold mb-12 text-center text-gray-800", children: "Skincare Combo Packages" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8", children: loading ? (_jsx("div", { className: "col-span-3 text-xl font-semibold text-center text-gray-500", children: "Loading services..." })) : (services.map((service, index) => {
                        var _a;
                        return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white", onClick: () => setSelectedService(service.name), children: [_jsx("h3", { className: "text-2xl font-semibold text-gray-800", children: service.name }), _jsxs("p", { className: "text-gray-600 text-sm", children: ["Category: ", ((_a = service.category) === null || _a === void 0 ? void 0 : _a.name) || "N/A"] }), _jsx("img", { className: "mt-4 rounded-lg shadow-md object-cover h-40 w-full", src: service.image || "/default-image.jpg", alt: service.name }), _jsx("p", { className: "mt-4 text-lg font-bold text-gray-900", children: service.price }), _jsxs("p", { className: "text-gray-600 text-sm", children: ["Duration: ", service.duration, " min"] })] }, index));
                    })) }), selectedService && selectedServiceDetails && (_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out", children: _jsxs("div", { className: "bg-white p-12 rounded-lg shadow-lg w-2/3 relative transform scale-100 transition-all duration-500 ease-in-out opacity-100 max-w-4xl", children: [_jsx("button", { onClick: closeModal, className: "absolute top-2 right-2 text-gray-600 text-3xl transition-transform transform hover:scale-125", children: "\u00D7" }), _jsx("h3", { className: "text-4xl font-semibold text-gray-800 mb-6", children: selectedServiceDetails.name }), _jsxs("p", { className: "text-xl text-gray-700 mb-2", children: [_jsx("strong", { children: "Price:" }), " ", selectedServiceDetails.price] }), _jsxs("p", { className: "text-gray-600 text-sm", children: [_jsx("strong", { children: "Category:" }), " ", ((_a = selectedServiceDetails.category) === null || _a === void 0 ? void 0 : _a.name) || "N/A"] }), _jsxs("p", { className: "text-gray-600 text-sm", children: [_jsx("strong", { children: "Duration:" }), " ", selectedServiceDetails.duration, " min"] }), _jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "text-2xl font-semibold text-gray-800 mb-4", children: "Description" }), _jsx("div", { className: "space-y-4", children: splitDescription(selectedServiceDetails.description) })] }), _jsx("img", { src: selectedServiceDetails.image || "/default-image.jpg", alt: selectedServiceDetails.name, className: "rounded-lg shadow-lg w-full h-auto object-cover mb-6 transition-transform duration-500 ease-in-out transform hover:scale-105" }), _jsx("div", { className: "flex justify-between mt-4", children: _jsx("button", { onClick: closeModal, className: "px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200", children: "Close" }) })] }) }))] }) }));
};
export default ServicePage;
