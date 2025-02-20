import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const SettingPage = () => {
    const [activeTab, setActiveTab] = useState("info");
    const [username, setUsername] = useState("User Name");
    const [email, setEmail] = useState("user@example.com");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };
    const handleSave = () => {
        if (activeTab === "password" && newPassword !== confirmPassword) {
            alert("New password and confirm password do not match!");
            return;
        }
        alert("Settings saved successfully!");
    };
    return (_jsxs("div", { className: `w-full h-screen flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`, children: [_jsxs("div", { className: `w-1/3 ${theme === "dark" ? "bg-gray-800" : "bg-white"} flex flex-col items-center justify-center shadow-lg p-6`, children: [_jsx("img", { src: "https://randomuser.me/api/portraits/men/75.jpg", alt: "User Avatar", className: "w-40 h-40 rounded-full mb-4 border-4 border-gray-300" }), _jsx("h2", { className: "text-xl font-semibold", children: username })] }), _jsxs("div", { className: `w-2/3 p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg flex flex-col`, children: [_jsxs("div", { className: "flex border-b mb-4", children: [_jsx("button", { className: `px-4 py-2 ${activeTab === "info" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`, onClick: () => setActiveTab("info"), children: "Change Info" }), _jsx("button", { className: `ml-4 px-4 py-2 ${activeTab === "password" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`, onClick: () => setActiveTab("password"), children: "Change Password" })] }), activeTab === "info" && (_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block", children: "Username" }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 dark:text-white" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 dark:text-white" })] }), _jsxs("div", { className: "mb-4 flex items-center", children: [_jsx("input", { type: "checkbox", checked: notifications, onChange: () => setNotifications(!notifications), className: "mr-2" }), _jsx("label", { children: "Enable Notifications" })] })] })), activeTab === "password" && (_jsxs("div", { children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block", children: "Current Password" }), _jsx("input", { type: "password", value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), className: "w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 dark:text-white" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block", children: "New Password" }), _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 dark:text-white" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block", children: "Confirm New Password" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full p-2 border rounded mt-1 bg-gray-100 text-gray-900 dark:text-white" })] })] })), _jsx("button", { onClick: handleSave, className: "w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded", children: "Save Changes" })] })] }));
};
export default SettingPage;
