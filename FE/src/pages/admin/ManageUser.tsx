import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
function ManageUser() {
  const { token, user, setUser } = useAuth();
  const title = "user";
  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "Name", dataIndex: "username", key: "username" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  const fetchUsers = async () => {
    if (!token) {
      message.error("Authentication required");
      return;
    }
    try {
      console.log("Fetching users with token:", token);
      const response = await axios.get("http://localhost:5000/api/users/", {
        headers: { "x-auth-token": token },
      });
      console.log("Fetched users:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Fetch Users Error:", error.response?.data || error);
      message.error(error.response?.data?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);


  const handleCreateUser = async (values) => {
    if (!token) {
      message.error("Authentication required");
      return;
    }
    try {
      console.log(
        "Creating user with values:",
        JSON.stringify(values, null, 2)
      );
      const response = await axios.post(
        "http://localhost:5000/api/users/",
        values,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Create User Response:", response.data);
      message.success("User created successfully!");
      setShowModal(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Create User Error:", error.response?.data || error);
      if (error.response?.status === 400) {
        message.error("Invalid input data. Please check your form.");
      } else if (error.response?.status === 500) {
        console.error("Server error details:", error.response?.data);
        message.error(
          "Server error: " +
            (error.response?.data?.message || "Please check backend logs.")
        );
      } else {
        message.error(error.response?.data?.message || "Failed to create user");
      }
    }
  };


  const formItems = (
    <>
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: "Please input username" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please input password" }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Please input email" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone_number"
        label="Phone Number"
        rules={[{ required: true, message: "Please input phone number" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="gender"
        label="Gender"
        rules={[{ required: true, message: "Please select gender" }]}
      >
        <Select>
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: "Please input address" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: "Please select role" }]}
      >
        <Select>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="user">User</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint="/users"
      />
    </div>
  );
}

export default ManageUser;
