"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Layout, Avatar, Dropdown, Menu, Badge } from "antd"
import { UserOutlined, BellOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../assets/logo7.png"

const { Header } = Layout

const AdminHeader: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    navigate("/login")
  }

  // Custom styles for the dropdown menu
  const dropdownMenuStyle = {
    menu: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      border: "1px solid #f0f0f0",
      padding: "4px 0",
      width: "200px",
    },
    item: {
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
    },
    icon: {
      fontSize: "16px",
    },
    divider: {
      margin: "4px 0",
    },
    logoutText: {
      color: "#f5222d",
    },
  }

  // Custom menu component to apply our styles
  const userMenu = (
    <Menu
      style={dropdownMenuStyle.menu}
      items={[
        {
          key: "profile",
          icon: <UserOutlined style={dropdownMenuStyle.icon} />,
          label: "My Profile",
          style: dropdownMenuStyle.item,
          className: "hover:bg-yellow-50",
        },
        {
          key: "settings",
          icon: <SettingOutlined style={dropdownMenuStyle.icon} />,
          label: "Settings",
          style: dropdownMenuStyle.item,
          className: "hover:bg-yellow-50",
        },
        {
          type: "divider",
          style: dropdownMenuStyle.divider,
        },
        {
          key: "logout",
          icon: <LogoutOutlined style={{ ...dropdownMenuStyle.icon, color: "#f5222d" }} />,
          label: <span style={dropdownMenuStyle.logoutText}>Log Out</span>,
          onClick: handleLogout,
          style: dropdownMenuStyle.item,
          className: "hover:bg-yellow-50",
        },
      ]}
    />
  )

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        position: "fixed",
        zIndex: 1,
        width: "100%",
        height: "78px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center">
        <Link to="/">
          <img src={logo || "/placeholder.svg"} alt="LuLuSpa Logo" className="w-16 h-16 rounded-full" />
        </Link>
        <div className="text-xl font-semibold ml-4 p">Welcome</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Badge count={5} size="small">
          <BellOutlined
            style={{
              fontSize: "20px",
              cursor: "pointer",
              padding: "8px",
              backgroundColor: "rgba(250, 204, 21, 0.2)",
              borderRadius: "50%",
            }}
          />
        </Badge>

        <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(250, 204, 21, 0.2)",
              padding: "6px 12px",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            className="hover:bg-yellow-300/30"
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#facc15",
                color: "#000",
              }}
            />
            {user && <span style={{ fontWeight: 500 }}>{user.username}</span>}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#666" }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default AdminHeader

