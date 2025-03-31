import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Input, Button, Spin } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import layerImage from "../assets/logo7.png";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const isValidGmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidGmail(email)) {
      toast.error("Please enter a valid @gmail.com email!");
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      const response = await axios.post(`${API_URL}/auth/forgot-password/send-otp`, { email });

      console.log("Send OTP Response:", response.data);

      if (response.status === 200) {
        toast.success(response.data.message || "OTP has been sent, please check your email!");
        setIsOtpModalOpen(true);
      } else {
        toast.error(response.data.message || "Failed to send OTP!");
      }
    } catch (error: any) {
      console.error("API Error (Send OTP):", error.response?.data || error.message);
      toast.warn("Unable to send OTP, but you can still enter the code!");
      setIsOtpModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits!");
      return;
    }

    console.log("Data sent to BE:", { email, otp });

    setLoading(true);

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      console.log("Verify OTP Response:", response.data);

      if (response.status === 200) {
        toast.success(response.data.message || "OTP verified successfully!");
        setIsOtpModalOpen(false);
        setIsPasswordModalOpen(true);
      } else {
        toast.error(response.data.message || "Invalid OTP!");
      }
    } catch (error: any) {
      console.error("API Error (Verify OTP):", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error verifying OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true); // Thêm loading để cải thiện UX

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      const response = await axios.post(`${API_URL}/auth/forgot-password/reset`, {
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      console.log("Reset Password Response:", response.data);

      if (response.status === 200) {
        toast.success(response.data.message || "Password updated successfully!"); // Đảm bảo thông báo hiển thị
        setIsPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setTimeout(() => {
          navigate("/login"); // Chuyển hướng sau khi thông báo hiển thị
        }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo
      } else {
        toast.error(response.data.message || "Failed to reset password!");
      }
    } catch (error: any) {
      console.error("API Error (Reset Password):", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error resetting password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 lg:px-0">
      <ToastContainer />
      <div className="flex justify-center flex-1 max-w-screen-lg bg-white border shadow sm:rounded-lg">
        <div className="flex-1 hidden text-center md:flex">
          <img
            src={layerImage}
            alt="logo"
            className="m-5 rounded-lg aspect-square"
          />
        </div>

        <div className="p-4 lg:w-1/2 xl:w-1/2 sm:p-12 md:w-1/3">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-extrabold text-blue-900 xl:text-4xl">
              Forgot Password
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 w-full max-w-xs gap-4 mx-auto mt-8"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300"
              />

              <Button
                type="primary"
                htmlType="submit"
                block
                className={`flex items-center justify-center w-full h-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg ${
                  loading ? "bg-gray-500" : "bg-blue-900 hover:bg-indigo-700"
                }`}
                loading={loading}
              >
                {loading ? <Spin /> : "Reset Password"}
              </Button>

              <p className="mt-6 text-xs text-center text-gray-600">
                Have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-900">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Modal
        title="Enter OTP"
        open={isOtpModalOpen}
        onCancel={() => {
          setIsOtpModalOpen(false);
          setOtp("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsOtpModalOpen(false);
              setOtp("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOtpSubmit}
            loading={loading}
          >
            Verify
          </Button>,
        ]}
      >
        <p className="text-gray-600 mb-4">
          Please enter the OTP sent to your email.
        </p>
        <Input
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center text-xl"
        />
      </Modal>

      <Modal
        title="Reset Password"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setNewPassword("");
          setConfirmPassword("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handlePasswordSubmit}
            loading={loading} // Thêm loading vào nút Submit
          >
            Submit
          </Button>,
        ]}
      >
        <p className="text-gray-600 mb-4">Enter your new password.</p>
        <Input.Password
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-3"
        />
        <Input.Password
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ForgotPassword;