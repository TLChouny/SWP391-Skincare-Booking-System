import { useEffect, useState } from "react"
import { Form, Input, Select, message, Space } from "antd" // Xóa Button vì không cần nút Reset
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api"

interface User {
  _id: string
  username: string
  email: string
  phone_number: string
  gender: string
  Description: string
  address: string
  role: string
}

function ManageUser() {
  const { token } = useAuth()
  const title = "User"
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const columns = [
    { title: "Name", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Description", dataIndex: "Description", key: "Description" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Role", dataIndex: "role", key: "role" },
  ]

  const fetchUsers = async () => {
    if (!token) {
      message.error("Authentication required")
      return
    }
    try {
      console.log("Fetching users with token:", token)
      const response = await axios.get(`${API_URL}/users/`, {
        headers: { "x-auth-token": token },
      })
      console.log("Fetched users:", response.data)
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error: any) {
      console.error("Fetch Users Error:", error.response?.data || error)
      message.error(error.response?.data?.message || "Failed to fetch users")
    }
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  useEffect(() => {
    let result = [...users]
    if (selectedRole) {
      result = result.filter((user) => user.role === selectedRole)
    }
    if (searchTerm) {
      result = result.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    setFilteredUsers(result)
  }, [users, selectedRole, searchTerm])

  const handleCreateUser = async (values: any) => {
    if (!token) {
      message.error("Authentication required")
      return
    }
    try {
      console.log("Creating user with values:", JSON.stringify(values, null, 2))
      const response = await axios.post(`${API_URL}/users/`, values, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      })
      console.log("Create User Response:", response.data)
      message.success("User created successfully!")
      form.resetFields()
      fetchUsers()
    } catch (error: any) {
      console.error("Create User Error:", error.response?.data || error)
      message.error(error.response?.data?.message || "Failed to create user")
    }
  }

  const formItems = (editingId: string | null) => {
    const editingUser = editingId ? users.find((user: any) => user._id === editingId) : null

    return (
      <>
        <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please input username" }]}>
          <Input />
        </Form.Item>
        {!editingId && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input email" },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
              message: "Email must be in the format of @gmail.com",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone_number"
          label="Phone Number"
          rules={[
            { required: true, message: "Please input phone number" },
            {
              pattern: /^\d{10}$/,
              message: "Phone number must be exactly 10 digits",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Please select gender" }]}>
          <Select>
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="Description"
          label="Description"
          rules={[{ required: true, message: "Please input description" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please input address" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select role" }]}>
          <Select disabled={editingUser?.role === "admin"}>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="skincare_staff">Skincare Staff</Select.Option>
            <Select.Option value="staff">Staff</Select.Option>
          </Select>
        </Form.Item>
      </>
    )
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleRoleFilter = (value: string) => {
    setSelectedRole(value === "all" ? null : value)
  }

  const filterControls = (
    <Space>
      <Input.Search
        placeholder="Search by username"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select 
        style={{ width: 150 }} 
        placeholder="Filter by role"
        onChange={handleRoleFilter} 
        value={selectedRole}
        allowClear
      >
        <Select.Option value="admin">Admin</Select.Option>
        <Select.Option value="skincare_staff">Skincare Staff</Select.Option>
        <Select.Option value="staff">Staff</Select.Option>
        <Select.Option value="user">User</Select.Option>
      </Select>
    </Space>
  );
  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        dataSource={filteredUsers}
        formItems={formItems}
        apiEndpoint="/users"
        mode="full"
        filterControls={filterControls}
        onUpdateSuccess={fetchUsers} // Add this line to reload data after update
      />
    </div>
  )
}

export default ManageUser

