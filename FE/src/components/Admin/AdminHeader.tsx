"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Layout, Avatar, Dropdown, MenuProps, Divider } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo7.png";
import { ChevronDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Header } = Layout;

interface User {
  username: string;
  avatar?: string;
}

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        username: parsedUser.username,
        avatar: parsedUser.avatar || undefined,
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    // {
    //   key: "settings",
    //   icon: <SettingOutlined className="text-lg" />,
    //   label: <span className="text-gray-700">Settings</span>,
    //   className: "hover:bg-yellow-50 py-2 px-4",
    //   onClick: () => navigate("/settings"),
    // },
    // {
    //   type: "divider",
    //   className: "my-1",
    // },
    {
      key: "logout",
      icon: <LogoutOutlined className="text-lg text-red-600" />,
      label: <span className="text-red-600">Log Out</span>,
      className: "hover:bg-yellow-50 py-2 px-4",
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="bg-[#dad5c9] text-black py-2 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-2">
        <div className="flex items-center space-x-3">
        {/* <Link to="/"> */}
          <img
            src={logo || "/placeholder.svg"}
            alt="LuLuSpa Logo"
            className="w-12 h-12 rounded-full"
          />
        {/* </Link> */}
        <span className="text-xl font-semibold text-gray-800">Welcome</span>
      </div>

      <div className="flex items-center space-x-8 mr-19">
        <div className="flex items-center space-x-3">
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
              <button className="flex items-center gap-2 bg-yellow-300/20 hover:bg-yellow-300/30 text-black px-2 py-1 rounded-lg transition-all duration-200">
                <div className="bg-yellow-300 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black font-semibold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-base font-medium">{user.username}</span>
                <ChevronDown size={24} className="text-gray-600" />
              </button>
            </Dropdown>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-base font-semibold hover:text-yellow-300 transition duration-300"
              >
                <span>Login</span>
              </Link>
              <Divider type="vertical" className="border-black mt-1 h-6" />
              <Link
                to="/register"
                className="text-base font-semibold hover:text-yellow-300 transition duration-300"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
      <ToastContainer autoClose={3000}/>

    </Header>
  );
};

export default AdminHeader;