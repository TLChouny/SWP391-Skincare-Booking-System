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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layout/Layout";
import { User } from "../../types/booking";

// Define the shape of the form values
interface FormValues {
  username: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  description: string;
}

// Extend User interface to include role
interface ExtendedUser extends User {
  role?: string;
}

// const API_BASE_URL = "http://localhost:5000";
const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://luluspa-production.up.railway.app";

const SettingAdmin: React.FC = () => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [user, setUser] = useState<ExtendedUser>({
    username: "",
    email: "",
    avatar: "",
    phone: "",
    gender: "",
    address: "",
    description: "",
    role: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [newPassword, setNewPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

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

      const userData: ExtendedUser = {
        username: response.data.username || "",
        email: response.data.email || "",
        avatar: response.data.avatar
          ? `${API_BASE_URL}${response.data.avatar}?t=${new Date().getTime()}`
          : `${API_BASE_URL}/default-avatar.png`,
        phone: response.data.phone_number || "",
        gender: response.data.gender || "",
        address: response.data.address || "",
        description: response.data.Description || "",
        role: response.data.role || "", // Assuming role is returned from API
      };

      setUser(userData);
    } catch {
      toast.error("Failed to fetch user information!", { autoClose: 3000 });
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

      toast.success(
        "Avatar updated successfully!Please log in again to see the changes.",
        {
          autoClose: 3000,
          onClose: () => handleLogout(), // Trigger logout after toast closes
        }
      );
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
  const handleUpdateUser = async (values: FormValues) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    // Check if username exceeds 50 characters
    if (values.username.length > 50) {
      toast.error("Username must not exceed 50 characters!");
      return;
    }

    // Check if phone is provided and has exactly 10 digits
    if (values.phone && !/^\d{10}$/.test(values.phone)) {
      toast.error("Phone number must be exactly 10 digits!");
      return;
    }

    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email); // Email included but disabled in UI
    formData.append("phone_number", values.phone);
    formData.append("gender", values.gender);
    formData.append("address", values.address);
    if (user.role === "skincare_staff") {
      formData.append("description", values.description); // Only append description for skincare_staff
    }

    try {
      await axios.put(`${API_BASE_URL}/api/auth/update-profile`, formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success message and prompt to log in again
      toast.success(
        "Account information updated successfully! Please log in again to see the changes.",
        {
          autoClose: 3000,
          onClose: () => handleLogout(), // Trigger logout after toast closes
        }
      );
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

    // Check if new password is at least 8 characters long
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long!");
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

      // Show success message and prompt to log in again
      toast.success(
        "Password changed successfully! Please log in again with your new password.",
        {
          autoClose: 3000,
          onClose: () => handleLogout(), // Trigger logout after toast closes
        }
      );
      setOldPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to change password!", { autoClose: 3000 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    toast.success("Logout successfully!", { autoClose: 3000 });
    window.location.href = "/login";
  };

  if (loading)
    return (
      <Spin
        size="large"
        style={{
          display: "flex", // Fixed the typo here
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
          {/* Avatar Section */}
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

          {/* Profile Information Section */}
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
                    maxLength={50} // Optional: Limit input length in UI
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

          {/* Divider */}
          <Divider />

          {/* Change Password Section */}
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
              htmlType="submit"
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

          {/* Divider */}
          <Divider />

          {/* Logout Section */}
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