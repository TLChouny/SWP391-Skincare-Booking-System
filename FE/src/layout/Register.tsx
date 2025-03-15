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
    phone_number: "",
    gender: "other",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (email: string): boolean =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const validatePassword = (password: string): boolean => password.length >= 6;

  const validatePhoneNumber = (phone: string): boolean =>
    /^\d{10}$/.test(phone);

  const validateForm = (): boolean => {
    // Yêu cầu username
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }

    // Yêu cầu email
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email (must be Gmail)");
      return false;
    }

    // Yêu cầu password (dù schema không bắt buộc, nhưng thực tế cần)
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!validatePassword(formData.password)) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    // Phone number là tùy chọn, nhưng nếu nhập thì phải đúng định dạng
    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      toast.error("Phone number must be 10 digits");
      return false;
    }

    // Các field khác (gender, address) không cần validate vì là tùy chọn và có default
    return true;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
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
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          gender: formData.gender,
          address: formData.address,
          role: "user",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.msg || "Registration failed");
        return;
      }
      await response.json();
      setShowOtpModal(true);
      toast.success("OTP has been sent to your email");
    } catch (error) {
      console.error("Network Error:", error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://luluspa-production.up.railway.app/api";
  const handleOtpSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp: otp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.msg || "Invalid OTP");
        return;
      }

      toast.success("Bạn đã nhập mã OTP thành công");
      setShowOtpModal(false);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-[86vh] flex items-center justify-center px-5 lg:px-0'>
      <ToastContainer />
      <div className='flex justify-center flex-1 max-w-screen-lg bg-white border shadow sm:rounded-lg'>
        <div className='flex-1 hidden text-center md:flex'>
          <img
            src={logo}
            alt='logo'
            className='m-5 w-108 h-108 object-contain rounded-lg' // Sửa lại kích thước logo cho hợp lý
          />
        </div>
        <div className='p-4 lg:w-1/2 xl:w-1/2 md:w-1/3'>
          <div className='flex flex-col items-center'>
            <div className='text-center'>
              <h1 className='mt-4 mb-2 text-2xl font-extrabold text-blue-900 xl:text-4xl'>
                Sign up
              </h1>
            </div>
            <form onSubmit={handleSubmit} className='flex-1 w-full'>
              <div className='flex flex-col max-w-xs gap-4 mx-auto'>
                <label className='text-sm font-medium text-left text-gray-700'>
                  Username <span className='text-red-500'>*</span>
                </label>
                <input
                  className='w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                  type='text'
                  name='username'
                  placeholder='Enter your username'
                  value={formData.username}
                  onChange={handleInputChange}
                  required // Thêm thuộc tính HTML required
                />

                <label className='text-sm font-medium text-left text-gray-700'>
                  Password <span className='text-red-500'>*</span>
                </label>
                <div className='relative w-full'>
                  <input
                    className='w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                    type={passwordVisible ? "text" : "password"}
                    name='password'
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={handleInputChange}
                    required // Thêm thuộc tính HTML required
                  />
                  <button
                    type='button'
                    className='absolute text-gray-500 right-3 top-3'
                    onClick={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )}
                  </button>
                </div>

                <label className='text-sm font-medium text-left text-gray-700'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  className='w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                  type='email'
                  name='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required // Thêm thuộc tính HTML required
                />

                <label className='text-sm font-medium text-left text-gray-700'>
                  Phone Number
                </label>
                <input
                  className='w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                  type='text'
                  name='phone_number'
                  placeholder='Enter your phone number'
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />

                <label className='text-sm font-medium text-left text-gray-700'>
                  Gender
                </label>
                <select
                  className='w-full px-5 py-3 text-sm font-medium bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                  name='gender'
                  value={formData.gender}
                  onChange={handleInputChange}>
                  <option value='other'>Other</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                </select>
                <label className='text-sm font-medium text-left text-gray-700'>
                  Address
                </label>
                <input
                  className='w-full px-5 py-3 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white'
                  type='text'
                  name='address'
                  placeholder='Enter your address'
                  value={formData.address}
                  onChange={handleInputChange}
                />

                <button
                  type='submit'
                  disabled={loading}
                  className='flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out bg-blue-900 rounded-lg hover:bg-indigo-700 focus:shadow-outline focus:outline-none'>
                  {loading ? "Đang xử lý..." : "Sign up"}
                </button>
                <p className='mt-2 mb-4 text-xs text-center text-gray-600'>
                  Have an account?{" "}
                  <Link to='/login'>
                    <span className='font-semibold text-blue-900'>Login</span>
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full'>
            <h2 className='text-xl font-bold mb-4 text-center'>Xác nhận OTP</h2>
            <form onSubmit={handleOtpSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nhập mã OTP được gửi đến email của bạn
                </label>
                <input
                  type='text'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                  placeholder='Nhập OTP'
                />
              </div>
              <button
                type='submit'
                disabled={loading}
                className='w-full py-2 bg-blue-900 text-white rounded-lg hover:bg-indigo-700 transition-colors'>
                {loading ? "Đang xác nhận..." : "Xác nhận"}
              </button>
              <button
                type='button'
                onClick={() => setShowOtpModal(false)}
                className='w-full mt-2 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'>
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
