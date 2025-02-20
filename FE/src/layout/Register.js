import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import logo from "../assets/logo7.png";
const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    const validatePassword = (password) => password.length >= 6;
    const validateForm = () => {
        if (!formData.username.trim()) {
            toast.error("Username is required");
            return false;
        }
        if (!validateEmail(formData.email)) {
            toast.error("Invalid email");
            return false;
        }
        if (!validatePassword(formData.password)) {
            toast.error("Password must be at least 8 characters long");
            return false;
        }
        return true;
    };
    const handleInputChange = (e) => {
        setFormData(Object.assign(Object.assign({}, formData), { [e.target.name]: e.target.value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/auth/register", {
                // API endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: "user",
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.msg || "Registration failed"); // Xử lý lỗi từ backend
                return;
            }
            const data = await response.json();
            toast.success("Registration successful");
            navigate("/login");
        }
        catch (error) {
            console.error("Network Error:", error);
            toast.error("Registration failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "h-[86vh] flex items-center justify-center px-5 lg:px-0", children: [_jsx(ToastContainer, {}), _jsxs("div", { className: "flex justify-center flex-1 max-w-screen-lg bg-white border shadow sm:rounded-lg", children: [_jsx("div", { className: "flex-1 hidden text-center md:flex", children: _jsx("img", { src: logo, alt: "logo", className: "m-5 bg-center bg-no-repeat bg-inherit rounded-lg justify-center items-center aspect-square" }) }), _jsx("div", { className: "p-4 lg:w-1/2 xl:w-1/2 md:w-1/3", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-center", children: _jsx("h1", { className: "mt-4 mb-2 text-2xl font-extrabold text-blue-900 xl:text-4xl", children: "Sign up" }) }), _jsx("form", { onSubmit: handleSubmit, className: "flex-1 w-full", children: _jsxs("div", { className: "flex flex-col max-w-xs gap-4 mx-auto", children: [_jsx("label", { className: "text-sm font-medium text-left text-gray-700", children: "Username" }), _jsx("input", { className: "w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white", type: "text", name: "username", placeholder: "Please enter your username", value: formData.username, onChange: handleInputChange }), _jsx("label", { className: "text-sm font-medium text-left text-gray-700", children: "Password" }), _jsxs("div", { className: "relative w-full", children: [_jsx("input", { className: "w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white", type: passwordVisible ? "text" : "password", name: "password", placeholder: "Please enter your password", value: formData.password, onChange: handleInputChange }), _jsx("button", { type: "button", className: "absolute text-gray-500 right-3 top-3", onClick: () => setPasswordVisible(!passwordVisible), children: passwordVisible ? (_jsx(EyeInvisibleOutlined, {})) : (_jsx(EyeOutlined, {})) })] }), _jsx("label", { className: "text-sm font-medium text-left text-gray-700", children: "Email" }), _jsx("input", { className: "w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white", type: "email", name: "email", placeholder: "Please enter your email", value: formData.email, onChange: handleInputChange }), _jsx("button", { type: "submit", disabled: loading, className: "flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out bg-blue-900 rounded-lg hover:bg-indigo-700 focus:shadow-outline focus:outline-none", children: loading ? "Đang xử lý..." : "Sign up" }), _jsxs("p", { className: "mt-2 mb-4 text-xs text-center text-gray-600", children: ["Have an account?", " ", _jsx(Link, { to: "/login", children: _jsx("span", { className: "font-semibold text-blue-900", children: "Login" }) })] })] }) })] }) })] })] }));
};
export default Register;
