import React, { useState, useEffect } from "react";
import { Button, Input, Avatar, Spin, message, Upload } from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Lấy token từ AuthContext
import { toast } from "react-toastify";

const SettingPage = () => {
  const { token } = useAuth(); // ✅ Dùng token từ context thay vì localStorage
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

  // Lấy thông tin người dùng từ API
  const fetchUserData = async () => {
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { "x-auth-token": token }, // ✅ Đúng headers
      });

      setUser(response.data);
    } catch (error) {
      message.error("Không thể lấy thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật thông tin người dùng
  const handleUpdateUser = async () => {
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        { username: user.username, email: user.email, avatar: user.avatar },
        { headers: { "x-auth-token": token } } // ✅ Dùng đúng headers
      );

      message.success("Cập nhật thành công!");
    } catch (error) {
      message.error("Lỗi khi cập nhật thông tin!");
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!token) {
      message.error("Authentication required");
      return;
    }

    console.log("User data:", user); // 🔍 Kiểm tra dữ liệu user trước khi gọi API

    if (!user.email || !oldPassword || !newPassword) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: user.email, // ✅ Kiểm tra nếu user.email có giá trị hợp lệ
          old_password: oldPassword, // ✅ Đổi thành biến đúng
          new_password: newPassword, // ✅ Đổi thành biến đúng
        },
        { headers: { "x-auth-token": token } }
      );

      message.success("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          toast.error(`Fail to change password: ${errorMessage}`);
        }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("x-auth-token"); // ✅ Xóa đúng key token
    message.success("Đăng xuất thành công!");
    window.location.href = "/login"; // Điều hướng về trang đăng nhập
  };

  if (loading) return <Spin size='large' />;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>Cài đặt tài khoản</h2>

      {/* Ảnh đại diện */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Avatar size={100} src={user.avatar} />
      </div>

      {/* Upload Avatar */}
      <Upload
        beforeUpload={(file) => {
          const reader = new FileReader();
          reader.onload = () =>
            setUser({ ...user, avatar: reader.result as string });
          reader.readAsDataURL(file);
          return false;
        }}>
        <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
      </Upload>

      {/* Form thông tin người dùng */}
      <div style={{ marginTop: 20 }}>
        <label>Tên người dùng</label>
        <Input
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />

        <label>Email</label>
        <Input
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <Button
          type='primary'
          onClick={handleUpdateUser}
          style={{ marginTop: 10 }}>
          Cập nhật thông tin
        </Button>
      </div>

      {/* Đổi mật khẩu */}
      {/* Nhập mật khẩu cũ */}
      <label>Mật khẩu cũ</label>
      <Input.Password
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />

      {/* Nhập mật khẩu mới */}
      <label>Mật khẩu mới</label>
      <Input.Password
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Button
        type='default'
        onClick={handleChangePassword}
        style={{ marginTop: 10 }}>
        Đổi mật khẩu
      </Button>

      {/* Đăng xuất */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button
          type='primary'
          danger
          onClick={handleLogout}
          icon={<LogoutOutlined />}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default SettingPage;
