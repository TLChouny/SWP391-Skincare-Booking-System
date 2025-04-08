import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Avatar,
  Spin,
  Upload,
  Divider,
  Form,
  Card,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import {
  UploadOutlined,
  LogoutOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  HomeOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify"; // Thêm ToastContainer vào import
import "react-toastify/dist/ReactToastify.css"; // Đảm bảo import CSS của react-toastify
import { useNavigate } from "react-router-dom";
import { User } from "../../types/booking";

interface FormValues {
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  description?: string;
}

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://luluspa-production.up.railway.app";

const SettingAdmin: React.FC = () => {
  const [form] = Form.useForm();
  const { token, setToken } = useAuth();
  const [user, setUser] = useState<User>({
    username: "",
    email: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [newPassword, setNewPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      toast.error("Authentication required", { autoClose: 3000 });
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
      description: user.description,
    });
  }, [user, form]);

  const fetchUserData = async () => {
    if (!token) {
      toast.error("Authentication required", { autoClose: 3000 });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { "x-auth-token": token },
      });

      const userData: User = {
        _id: response.data._id || undefined,
        username: response.data.username || "",
        email: response.data.email || "",
        avatar: response.data.avatar
          ? `${API_BASE_URL}${response.data.avatar}?t=${new Date().getTime()}`
          : undefined,
        phone: response.data.phone_number || "",
        gender: response.data.gender || undefined,
        address: response.data.address || undefined,
        description: response.data.description || undefined,
        role: response.data.role || "",
      };

      setUser(userData);

      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        address: userData.address,
        description: userData.description,
        role: userData.role,
        avatar: userData.avatar,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user information!";
      toast.error(errorMessage, { autoClose: 3000 });
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

      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        avatar: `${API_BASE_URL}${response.data.user.avatar}?t=${new Date().getTime()}`,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("user-updated"));

      toast.success("Avatar updated successfully!", { autoClose: 3000 }); // Toast này sẽ hiển thị

      setUser((prevUser) => ({
        ...prevUser,
        avatar: `${API_BASE_URL}${
          response.data.user.avatar
        }?t=${new Date().getTime()}`,
      }));
      fetchUserData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update account information!";
      toast.error(errorMessage);
    }

    return false;
  };

  const handleUpdateUser = async (values: FormValues) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (values.username.length > 50) {
      toast.error("Username must not exceed 50 characters!");
      return;
    }

    if (values.phone && !/^\d{10}$/.test(values.phone)) {
      toast.error("Phone number must be exactly 10 digits!");
      return;
    }

    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email);
    if (values.phone) {
      formData.append("phone_number", values.phone);
    }
    if (values.gender) {
      formData.append("gender", values.gender);
    }
    if (values.address) {
      formData.append("address", values.address);
    }
    if (user.role === "skincare_staff" && values.description) {
      formData.append("description", values.description);
    }

    try {
      await axios.put(`${API_BASE_URL}/api/auth/update-profile`, formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        username: values.username,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        address: values.address,
        description: user.role === "skincare_staff" ? values.description : undefined,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("user-updated"));

      toast.success("Account information updated successfully!", {
        autoClose: 3000,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update account information!";
      toast.error(errorMessage);
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

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long!");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          email: user.email,
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
        { headers: { "x-auth-token": token } }
      );

      toast.success("Password changed successfully! Logging you out...", {
        autoClose: 3000,
        onClose: () => handleLogout(),
      });
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to change password!";
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleLogout = () => {
    setUser({
      username: "",
      email: "",
      phone: "",
      role: "",
    });
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    if (setToken) setToken(null);
    toast.success("Logged out successfully!", { autoClose: 3000 });
    navigate("/login");
  };

  if (loading)
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      />
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        background: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Thêm ToastContainer để hiển thị toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Card
        title={
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#1a3c34",
            }}
          >
            Account Settings
          </h2>
        }
        style={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Avatar
            size={100}
            src={user.avatar || `${API_BASE_URL}/default-avatar.png`}
            style={{ border: "2px solid #e8e8e8", marginBottom: 16 }}
          />
          <Upload showUploadList={false} beforeUpload={handleFileChange}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                borderRadius: 8,
              }}
            >
              Upload Avatar
            </Button>
          </Upload>
        </div>

        <Form form={form} onFinish={handleUpdateUser} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Username
                  </span>
                }
                name="username"
                rules={[
                  { required: true, message: "Please enter your username" },
                ]}
              >
                <Input
                  placeholder="Enter your username"
                  style={{ borderRadius: 8 }}
                  maxLength={50}
                  disabled
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <MailOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Email
                  </span>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  placeholder="Enter your email"
                  style={{ borderRadius: 8 }}
                  disabled
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <PhoneOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Phone
                  </span>
                }
                name="phone"
              >
                <Input
                  placeholder="Enter your phone number"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <ManOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Gender
                  </span>
                }
                name="gender"
              >
                <Select
                  placeholder="Select your gender"
                  style={{ borderRadius: 8 }}
                  disabled
                >
                  <Select.Option value="male">Male</Select.Option>
                  <Select.Option value="female">Female</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <HomeOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Address
                  </span>
                }
                name="address"
              >
                <Input
                  placeholder="Enter your address"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            {user.role === "skincare_staff" && (
              <Col span={24}>
                <Form.Item
                  label={
                    <span>
                      <FileTextOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                      Description
                    </span>
                  }
                  name="description"
                >
                  <Input.TextArea
                    placeholder="Tell us about yourself"
                    rows={4}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    borderRadius: 8,
                    height: 40,
                  }}
                >
                  Update Information
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              <LockOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              Old Password
            </label>
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your old password"
              style={{ borderRadius: 8 }}
            />
          </div>

          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              <LockOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              New Password
            </label>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              style={{ borderRadius: 8 }}
            />
          </div>

          <Button
            onClick={handleChangePassword}
            type="primary"
            block
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              borderRadius: 8,
              height: 40,
            }}
          >
            Change Password
          </Button>
        </Space>

        <Divider />

        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            danger
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            style={{ borderRadius: 8, height: 40 }}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingAdmin;