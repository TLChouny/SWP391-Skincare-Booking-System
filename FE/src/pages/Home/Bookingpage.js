import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServices } from "../../api/apiService";
import Layout from "../../layout/Layout";
const mockTherapists = [
    { id: "1", name: "Dr. Alice" },
    { id: "2", name: "Dr. Bob" },
];
const mockSchedules = {
    "1": ["09:00 AM", "10:00 AM", "02:00 PM"],
    "2": ["11:00 AM", "01:00 PM", "03:00 PM"],
};
const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState(mockTherapists);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await getServices();
                const foundService = response.data.find((s) => s.id === id);
                setService(foundService || null);
            }
            catch (error) {
                console.error("Error fetching service:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);
    const handleTherapistSelect = (event) => {
        const therapistId = event.target.value;
        const therapist = therapists.find(t => t.id === therapistId);
        setSelectedTherapist(therapist);
        setSchedule(mockSchedules[therapistId] || []);
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!customerName || !customerPhone || !selectedDate || !selectedTherapist || !selectedSlot) {
            alert("Please fill in all fields before booking.");
            return;
        }
        navigate("/checkout", {
            state: {
                service,
                customerName,
                customerPhone,
                selectedDate,
                selectedTherapist,
                selectedSlot,
            },
        });
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "container mx-auto py-16", children: [_jsx("h2", { className: "text-4xl font-bold text-center mb-10", children: "Booking Service" }), _jsxs("div", { className: "flex flex-wrap -mx-4", children: [_jsx("div", { className: "w-full lg:w-1/3 px-4 mb-8 lg:mb-0", children: loading ? (_jsx("p", { className: "text-lg text-gray-600", children: "Loading service details..." })) : service ? (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-2xl font-semibold mb-4", children: service.name }), _jsx("img", { src: service.image, alt: service.name, className: "w-full h-auto rounded-lg shadow-lg mb-6" }), _jsx("p", { className: "text-lg text-gray-600 mb-4", children: service.description }), _jsxs("p", { className: "text-xl font-bold text-gray-900", children: ["Price: ", service.price] })] })) : (_jsx("p", { className: "text-lg text-red-600", children: "Service not found. Please try again." })) }), _jsxs("div", { className: "w-full lg:w-2/3 px-4", children: [_jsx("h3", { className: "text-2xl font-semibold mb-4", children: "Booking Form" }), _jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { className: "block text-lg text-gray-700", children: "Name" }), _jsx("input", { type: "text", value: customerName, onChange: (e) => setCustomerName(e.target.value), placeholder: "Enter your name", className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-lg text-gray-700", children: "Phone Number" }), _jsx("input", { type: "text", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), placeholder: "Enter your phone number", className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-lg text-gray-700", children: "Choose Date" }), _jsx("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-lg text-gray-700", children: "Select Therapist" }), _jsxs("select", { onChange: handleTherapistSelect, className: "w-full p-3 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "Choose a therapist" }), therapists.map((therapist) => (_jsx("option", { value: therapist.id, children: therapist.name }, therapist.id)))] })] }), selectedTherapist && schedule.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-xl font-semibold mb-2", children: "Available Time Slots" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: schedule.map((slot) => (_jsx("button", { type: "button", className: `p-2 border rounded-lg ${selectedSlot === slot ? 'bg-blue-500 text-white' : 'bg-gray-100'}`, onClick: () => setSelectedSlot(slot), children: slot }, slot))) })] })), _jsx("div", { children: _jsx("button", { type: "submit", className: "w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300", children: "Book Now" }) })] })] })] })] }) }));
};
export default BookingPage;
