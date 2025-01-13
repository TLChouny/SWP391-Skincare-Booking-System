import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import layerImage from "../assets/logo7.png";

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const validateUsername = (username: string): boolean => username.trim() !== "";
    const validatePassword = (password: string): boolean => password.length >= 8;

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateUsername(username)) {
            toast.error("Username is empty");
            return;
        }

        if (!validatePassword(password)) {
            toast.error("Password is too short");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Login failed");
                return;
            }

            const data = await response.json();
            toast.success(data.message || "Login successful");

            localStorage.setItem("username", username);

            if (data.role === "user") {
                navigate("/user-homepage");
            } else if (data.role === "admin") {
                navigate("/admin");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[86vh] flex items-center justify-center px-5 lg:px-0">
            <ToastContainer />
            <div className="flex justify-center flex-1 max-w-screen-lg bg-white border shadow sm:rounded-lg">
                <div className="flex-1 hidden text-center md:flex">
                    <img
                        src={layerImage}
                        alt="logo"
                        className="m-5 rounded-lg justify-center items-center aspect-square"
                    />
                </div>

                <div className="p-4 lg:w-1/2 xl:w-1/2 sm:p-12 md:w-1/3">
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-extrabold text-blue-900 xl:text-4xl">
                            Login
                        </h1>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col flex-1 w-full max-w-xs gap-4 mx-auto mt-8"
                        >
                            <input
                                className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                                type="text"
                                placeholder="Please enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <div className="relative">
                                <input
                                    className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="Please enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute text-gray-500 right-3 top-3"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg focus:shadow-outline focus:outline-none ${loading
                                    ? "bg-gray-500"
                                    : "bg-blue-900 hover:bg-indigo-700"
                                    }`}
                            >
                                {loading ? "Đang xử lý..." : "Login"}
                            </button>

                            <div className="mt-1 text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-blue-900 hover:underline"
                                >
                                    Forgot password
                                </Link>
                            </div>

                            <p className="mt-6 text-xs text-center text-gray-600">
                                Don't have an account - {" "}
                                <Link to="/register">
                                    <span className="font-semibold text-blue-900">
                                        Sign up
                                    </span>
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
