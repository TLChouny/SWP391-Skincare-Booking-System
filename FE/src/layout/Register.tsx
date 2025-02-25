import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import logo from "../assets/logo7.png";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (email: string): boolean =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const validatePassword = (password: string): boolean => password.length >= 6;

  const validateForm = (): boolean => {
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/register", {
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
        toast.error(errorData.msg || "Registration failed");
        return;
      }

      // Giả sử API trả về success và gửi OTP qua email
      await response.json();
      setShowOtpModal(true); // Hiển thị modal OTP sau khi đăng ký thành công
      toast.success("OTP has been sent to your email");
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      // Gọi API để xác nhận OTP
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.msg || "Invalid OTP");
        return;
      }

      toast.success("Registration completed successfully");
      setShowOtpModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("OTP verification failed");
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
            src={logo}
            alt="logo"
            className="m-5 bg-center bg-no-repeat bg-inherit rounded-lg justify-center items-center aspect-square"
          />
        </div>
        <div className="p-4 lg:w-1/2 xl:w-1/2 md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <h1 className="mt-4 mb-2 text-2xl font-extrabold text-blue-900 xl:text-4xl">
                Sign up
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 w-full">
              <div className="flex flex-col max-w-xs gap-4 mx-auto">
                <label className="text-sm font-medium text-left text-gray-700">
                  Username
                </label>
                <input
                  className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="text"
                  name="username"
                  placeholder="Please enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                />

                <label className="text-sm font-medium text-left text-gray-700">
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Please enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute text-gray-500 right-3 top-3"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>

                <label className="text-sm font-medium text-left text-gray-700">
                  Email
                </label>
                <input
                  className="w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  name="email"
                  placeholder="Please enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out bg-blue-900 rounded-lg hover:bg-indigo-700 focus:shadow-outline focus:outline-none"
                >
                  {loading ? "Đang xử lý..." : "Sign up"}
                </button>
                <p className="mt-2 mb-4 text-xs text-center text-gray-600">
                  Have an account?{" "}
                  <Link to="/login">
                    <span className="font-semibold text-blue-900">Login</span>
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Xác nhận OTP</h2>
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã OTP được gửi đến email của bạn
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nhập OTP"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-900 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? "Đang xác nhận..." : "Xác nhận"}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full mt-2 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;