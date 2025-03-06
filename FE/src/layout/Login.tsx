import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import layerImage from "../assets/logo7.png";

const Login: React.FC = () => {
  const { setToken, setUser } = useAuth(); // Lấy hàm setToken và setUser từ context
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => email.trim() !== "";
  const validatePassword = (password: string): boolean => password.length >= 8;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Email không được để trống");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
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
        toast.error(errorData.msg || "Đăng nhập thất bại");
        return;
      }

      const data = await response.json();
      toast.success("Đăng nhập thành công");

      // Lưu token và user vào AuthContext
      setToken(data.token);
      setUser({ username: data.username, role: data.role });

      // Điều hướng dựa trên vai trò của người dùng
      if (data.role === "user") {
        navigate("/");
      } else if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "staff") {
        navigate("/staff/check-in");
      } else if (data.role === "skincare_staff") {
        navigate("/therapist");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại");
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
              Đăng nhập
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 w-full max-w-xs gap-4 mx-auto mt-8"
            >
              <input
                className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
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
                className={`flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg ${
                  loading ? "bg-gray-500" : "bg-blue-900 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
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
                Don't have an account -{" "}
                <Link to="/register">
                  <span className="font-semibold text-blue-900">Sign up</span>
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
