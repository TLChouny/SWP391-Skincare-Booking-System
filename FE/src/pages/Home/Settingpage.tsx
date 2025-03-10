import React, { useState, useEffect } from "react";
import { Button, Input, Avatar, Spin, message, Upload } from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Lấy token từ AuthContext

const SettingPage = () => {
  const { token } = useAuth(); // ✅ Dùng token từ context thay vì localStorage
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");

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
      const response = await axios.get("http://localhost:5002/api/auth/me", {
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
        "http://localhost:5002/api/auth/update-profile",
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

    try {
      await axios.put(
        "http://localhost:5002/api/auth/change-password",
        { newPassword },
        { headers: { "x-auth-token": token } } // ✅ Đúng headers
      );

      message.success("Đổi mật khẩu thành công!");
      setNewPassword("");
    } catch (error) {
      message.error("Lỗi khi đổi mật khẩu!");
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
      <div style={{ marginTop: 20 }}>
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
      </div>

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
