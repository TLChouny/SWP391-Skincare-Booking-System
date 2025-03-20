import React, { useState, useEffect } from "react";
import { Button, Input, Avatar, Spin, Upload } from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layout/Layout";
const API_BASE_URL = "http://localhost:5000";

const SettingPage = () => {
  const { token } = useAuth();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { "x-auth-token": token },
      });

      setUser({
        username: response.data.username,
        email: response.data.email,
        avatar: response.data.avatar
          ? `${API_BASE_URL}${response.data.avatar}?t=${new Date().getTime()}`
          : `${API_BASE_URL}/default-avatar.png`,
      });
    } catch {
      toast.error("Failed to fetch user information!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB! Please select an image under 10MB.");
      return false;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Account information updated successfully!");

      setUser((prevUser) => ({
        ...prevUser,
        avatar: `${API_BASE_URL}${
          response.data.user.avatar
        }?t=${new Date().getTime()}`,
      }));
      fetchUserData();
    } catch {
      toast.error("Failed to update account information!");
    }

    return false;
  };

  const handleUpdateUser = async (file?: File) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("email", user.email);

    if (file) {
      formData.append("avatar", file);
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Account information updated successfully!");
      setUser((prevUser) => ({
        ...prevUser,
        avatar: `${API_BASE_URL}${
          response.data.user.avatar
        }?t=${new Date().getTime()}`,
      }));
      fetchUserData();
    } catch {
      toast.error("Failed to update account information!");
    }
  };

  const handleChangePassword = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!user.email || !oldPassword || !newPassword) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          email: user.email,
          old_password: oldPassword,
          new_password: newPassword,
        },
        { headers: { "x-auth-token": token } }
      );

      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to change password!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công!");
    window.location.href = "/login";
  };

  if (loading) return <Spin size="large" />;

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
        <ToastContainer />
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Account Settings
        </h2>

        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={100}
            src={user.avatar || `${API_BASE_URL}/default-avatar.png`}
            className="mb-4 transition-transform duration-300 hover:scale-105 border-2 border-gray-200"
          />
        </div>

        <Upload
          showUploadList={false}
          beforeUpload={handleFileChange}
          className="mb-4"
        >
          <Button
            icon={<UploadOutlined />}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {" "}
            Upload Avatar
          </Button>
        </Upload>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <Input
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Button
            type="primary"
            onClick={() => handleUpdateUser()}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 mt-4"
          >
            Update Information
          </Button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Old Password
        </label>
        <Input.Password
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <Input.Password
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Button
          type="default"
          onClick={handleChangePassword}
          className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 mt-4"
        >
          Change Password
        </Button>
        <div className="text-center mt-8">
          <Button
            type="primary"
            danger
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingPage;
