"use client";

import React, { useState, useEffect } from "react";
import "../../src/index.css";
import logo from "../assets/logo7.png";
import { Link, useNavigate } from "react-router-dom";
import { Divider, Dropdown, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header: React.FC = () => {
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Hàm mở modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Lấy thông tin user và role từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.role || null); // Lấy role từ user, nếu không có thì để null
    }
  }, []);

  const handleBookNow = () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập tài khoản trước khi book service!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      navigate("/services");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa user
    localStorage.removeItem("authToken"); // Xóa authToken để đồng bộ với các trang
    setUser(null);
    setRole(null); // Reset role khi logout
    navigate("/login");
    toast.success("Đã đăng xuất thành công!");
  };

  const getDashboardLink = () => {
    switch (role) {
      case "admin":
        return "/admin-dashboard";
      case "staff":
        return "/staff/ch";
      case "therapist":
        return "/therapist";
      default:
        return "/dashboard"; // Mặc định cho user thường
    }
  };

  // Menu dropdown cho user
  const userMenu = (
    <Menu>
      <Menu.Item key="dashboard">
        <Link to={getDashboardLink()}>My Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings">
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header
      style={{ background: "#dad5c9" }}
      className="bg-#dad5c9 to-indigo-500 text-black py-4 shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <img src={logo} alt="LuLuSpa Logo" className="w-16 h-16 rounded-full" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            <span className="text-black-300">LuLu</span>
            <span className="text-yellow-300">Spa</span>
          </h1>
        </div>

        <nav>
          <ul className="hidden md:flex space-x-8 text-lg font-medium">
            <li>
              <Link to="/" className="hover:text-yellow-300 transition duration-300 ease-in-out">
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-yellow-300 transition duration-300 ease-in-out">
                Services
              </Link>
            </li>
            <li>
              <Link to="/test" className="hover:text-yellow-300 transition duration-300 ease-in-out">
                Test
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-yellow-300 transition duration-300 ease-in-out">
                Blog
              </Link>
            </li>
            <li>
              <button
                onClick={handleOpenModal}
                className="hover:text-yellow-300 transition duration-300 ease-in-out"
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            title="Book your appointment now"
            onClick={handleBookNow}
            className="hidden md:block bg-yellow-300 text-black py-2 px-6 rounded-lg shadow-md hover:bg-yellow-400 transition duration-100 ease-in-out"
          >
            Book Now
          </button>

          <div className="flex items-center space-x-2">
            {user ? (
              <Dropdown overlay={userMenu} trigger={["click"]}>
                <div className="flex items-center cursor-pointer space-x-2">
                  <UserOutlined className="text-xl text-gray-700" />
                  <span className="font-medium text-gray-800">{user.username}</span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link to="/login">
                  <span>Login</span>
                </Link>
                <Divider type="vertical" className="border-black mt-1 h-7" />
                <Link to="/register">
                  <span>Signup</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
            <button onClick={handleCloseModal} className="text-2xl float-right">
              ×
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h3>
            <form>
              <input type="text" placeholder="Name" className="mb-4 p-2 border w-full" />
              <input type="text" placeholder="Phone Number" className="mb-4 p-2 border w-full" />
              <button className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-4">Submit</button>
            </form>
            <div className="mt-6">
              <p className="text-gray-600">Store Name: LuLuSpa</p>
              <p className="text-gray-600">Phone: 123-456-789</p>
              <p className="text-gray-600">Email: info@luluspa.com</p>
              <a href="https://facebook.com/luluspa" className="text-blue-600">
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}

      <ToastContainer autoClose={3000} />
    </header>
  );
};

export default Header;