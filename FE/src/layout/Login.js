import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import layerImage from "../assets/logo7.png";
const Login = () => {
    const [email, setEmail] = useState(""); // Đổi từ username thành email
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const validateEmail = (email) => email.trim() !== "";
    const validatePassword = (password) => password.length >= 8;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            toast.error("Email is empty");
            return;
        }
        if (!validatePassword(password)) {
            toast.error("Password is too short");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.msg || "Login failed");
                return;
            }
            const data = await response.json();
            toast.success("Login successful");
            // Lưu username vào localStorage
            localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));
            if (data.role === "user") {
                navigate("/");
            }
            else if (data.role === "admin") {
                navigate("/admin/user-management");
            }
        }
        catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "h-[86vh] flex items-center justify-center px-5 lg:px-0", children: [_jsx(ToastContainer, {}), _jsxs("div", { className: "flex justify-center flex-1 max-w-screen-lg bg-white border shadow sm:rounded-lg", children: [_jsx("div", { className: "flex-1 hidden text-center md:flex", children: _jsx("img", { src: layerImage, alt: "logo", className: "m-5 rounded-lg justify-center items-center aspect-square" }) }), _jsx("div", { className: "p-4 lg:w-1/2 xl:w-1/2 sm:p-12 md:w-1/3", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("h1", { className: "text-2xl font-extrabold text-blue-900 xl:text-4xl", children: "Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col flex-1 w-full max-w-xs gap-4 mx-auto mt-8", children: [_jsx("input", { className: "w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white", type: "email", placeholder: "Please enter your email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsxs("div", { className: "relative", children: [_jsx("input", { className: "w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white", type: passwordVisible ? "text" : "password", placeholder: "Please enter your password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", className: "absolute text-gray-500 right-3 top-3", onClick: () => setPasswordVisible(!passwordVisible), children: passwordVisible ? _jsx(EyeInvisibleOutlined, {}) : _jsx(EyeOutlined, {}) })] }), _jsx("button", { type: "submit", disabled: loading, className: `flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg focus:shadow-outline focus:outline-none ${loading ? "bg-gray-500" : "bg-blue-900 hover:bg-indigo-700"}`, children: loading ? "Đang xử lý..." : "Login" }), _jsx("div", { className: "mt-1 text-center", children: _jsx(Link, { to: "/forgot-password", className: "text-sm font-medium text-blue-900 hover:underline", children: "Forgot password" }) }), _jsxs("p", { className: "mt-6 text-xs text-center text-gray-600", children: ["Don't have an account -", " ", _jsx(Link, { to: "/register", children: _jsx("span", { className: "font-semibold text-blue-900", children: "Sign up" }) })] })] })] }) })] })] }));
};
export default Login;
