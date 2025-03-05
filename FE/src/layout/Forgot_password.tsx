import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Input, Button, message, Spin } from "antd";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import layerImage from "../assets/logo7.png";

const Forgot_password: React.FC = () => {
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
      toast.error("Vui lòng nhập email @gmail.com hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password/send-otp",
        { email }
      );

      toast.success("Mã OTP đã được gửi, vui lòng kiểm tra email!");
      setIsOtpModalOpen(true);
    } catch (error) {
      console.error("Lỗi API:", error);
      toast.warn("Không thể gửi OTP nhưng bạn vẫn có thể nhập mã!");
      setIsOtpModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      message.success("Xác thực OTP thành công!");
      setIsOtpModalOpen(false);
      setIsPasswordModalOpen(true);
    } else {
      message.error("Mã OTP phải có 6 chữ số!");
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 8) {
      message.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password/reset",
        {
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      message.success(response.data.msg);

      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi API:", error.response?.data || error.message);
      message.error(error.response?.data?.msg || "Lỗi khi đặt lại mật khẩu!");
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
            className="m-5 rounded-lg aspect-square"
          />
        </div>

        <div className="p-4 lg:w-1/2 xl:w-1/2 sm:p-12 md:w-1/3">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-extrabold text-blue-900 xl:text-4xl">
              Forgot password
            </h1>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 w-full max-w-xs gap-4 mx-auto mt-8"
            >
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-lg border border-gray-300"
              />

              <Button
                type="primary"
                htmlType="submit"
                block
                className="mt-4 bg-blue-900"
                loading={loading}
              >
                {loading ? <Spin /> : "Forgot password"}
              </Button>

              <p className="mt-6 text-xs text-center text-gray-600">
                Bạn có tài khoản?{" "}
                <Link to="/login" className="font-semibold text-blue-900">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Modal
        title="Nhập mã OTP"
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
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOtpSubmit}>
            Xác nhận
          </Button>,
        ]}
      >
        <p className="text-gray-600 mb-4">
          Vui lòng nhập mã OTP được gửi đến email của bạn.
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
        title="Đặt lại mật khẩu"
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
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handlePasswordSubmit}>
            Xác nhận
          </Button>,
        ]}
      >
        <p className="text-gray-600 mb-4">Nhập mật khẩu mới của bạn.</p>
        <Input.Password
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-3"
        />
        <Input.Password
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Forgot_password;
