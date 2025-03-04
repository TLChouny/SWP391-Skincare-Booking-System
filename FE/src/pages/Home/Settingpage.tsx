"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingPage = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(""); // Thêm state cho avatar
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(true);

  // Lấy thông tin người dùng từ API khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn cần đăng nhập để truy cập trang này!");
          return;
        }

        const response = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin người dùng!");
        }

        const data = await response.json();
        setUsername(data.username || ""); // Nếu không có username, để trống
        setEmail(data.email || ""); // Nếu không có email, để trống
        setAvatar(data.avatar || "https://randomuser.me/api/portraits/men/75.jpg"); // Dùng avatar từ API hoặc mặc định
        setNotifications(data.notifications !== undefined ? data.notifications : true); // Mặc định true nếu không có
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Không thể tải thông tin người dùng. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Áp dụng theme
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleSave = async () => {
    if (activeTab === "password" && newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để thực hiện thay đổi!");
        return;
      }

      const updatedData: any = {};
      if (activeTab === "info") {
        updatedData.username = username;
        updatedData.email = email;
        updatedData.notifications = notifications;
      } else if (activeTab === "password") {
        updatedData.currentPassword = currentPassword;
        updatedData.newPassword = newPassword;
      }

      const response = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật thông tin!");
      }

      toast.success("Cài đặt đã được lưu thành công!");
      // Reset các field mật khẩu sau khi lưu thành công
      if (activeTab === "password") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error((error as Error).message || "Lưu cài đặt thất bại. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <ToastContainer autoClose={3000} />

      {/* Left Side: Avatar */}
      <div className={`w-1/3 ${theme === "dark" ? "bg-gray-800" : "bg-white"} flex flex-col items-center justify-center shadow-lg p-6`}>
        <img
          src={avatar} // Sử dụng avatar từ API
          alt="User Avatar"
          className="w-40 h-40 rounded-full mb-4 border-4 border-gray-300 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/men/75.jpg"; // Fallback nếu avatar lỗi
          }}
        />
        <h2 className="text-xl font-semibold">{username || "Người dùng"}</h2>
      </div>

      {/* Right Side: Settings */}
      <div className={`w-2/3 p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg flex flex-col`}>
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === "info" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("info")}
          >
            Change Info
          </button>
          <button
            className={`ml-4 px-4 py-2 ${activeTab === "password" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
        </div>

        {/* Change Info */}
        {activeTab === "info" && (
          <div>
            <div className="mb-4">
              <label className="block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2 border rounded mt-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
              />
            </div>
            <div className="mb-4">
              <label className="block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2 border rounded mt-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="mr-2"
              />
              <label>Enable Notifications</label>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
                className="mr-2"
              />
              <label>Dark Mode</label>
            </div>
          </div>
        )}

        {/* Change Password */}
        {activeTab === "password" && (
          <div>
            <div className="mb-4">
              <label className="block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full p-2 border rounded mt-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
              />
            </div>
            <div className="mb-4">
              <label className="block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full p-2 border rounded mt-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
              />
            </div>
            <div className="mb-4">
              <label className="block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-2 border rounded mt-1 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingPage;