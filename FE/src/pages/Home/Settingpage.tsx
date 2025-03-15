import React, { useState, useEffect } from "react";
import { Button, Input, Avatar, Spin, Upload } from "antd";
import { UploadOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://luluspa-production.up.railway.app/api";

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
      toast.error("Không thể lấy thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn ảnh dưới 10MB.");
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

      toast.success("Cập nhật ảnh đại diện thành công!");

      // Cập nhật state user với avatar từ server
      setUser((prevUser) => ({
        ...prevUser,
        avatar: `${API_BASE_URL}${
          response.data.user.avatar
        }?t=${new Date().getTime()}`,
      }));
    } catch {
      toast.error("Lỗi khi cập nhật ảnh!");
    }

    return false;
  };

  const handleUpdateUser = async (file?: File) => {
    // <-- file là tùy chọn
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("email", user.email);

    if (file) {
      // Chỉ thêm avatar vào FormData nếu file tồn tại
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

      toast.success("Cập nhật thành công!");
      setUser((prevUser) => ({
        ...prevUser,
        avatar: `${API_BASE_URL}${
          response.data.user.avatar
        }?t=${new Date().getTime()}`,
      }));
    } catch {
      toast.error("Lỗi khi cập nhật thông tin!");
    }
  };

  const handleChangePassword = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!user.email || !oldPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
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

      toast.success("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } catch {
      toast.error("Lỗi khi đổi mật khẩu!");
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
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <ToastContainer />
      <h2>Cài đặt tài khoản</h2>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Avatar
          size={100}
          src={user.avatar || `${API_BASE_URL}/default-avatar.png`}
        />
      </div>

      <Upload showUploadList={false} beforeUpload={handleFileChange}>
        <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
      </Upload>

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
          type="primary"
          onClick={() => handleUpdateUser()}
          style={{ marginTop: 10 }}
        >
          Cập nhật thông tin
        </Button>
      </div>

      <label>Mật khẩu cũ</label>
      <Input.Password
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />

      <label>Mật khẩu mới</label>
      <Input.Password
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Button
        type="default"
        onClick={handleChangePassword}
        style={{ marginTop: 10 }}
      >
        Đổi mật khẩu
      </Button>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Button
          type="primary"
          danger
          onClick={handleLogout}
          icon={<LogoutOutlined />}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default SettingPage;
