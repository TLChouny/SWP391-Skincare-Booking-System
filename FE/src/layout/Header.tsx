"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../src/index.css"
import logo from "../assets/logo7.png"
import { Link, useNavigate } from "react-router-dom"
import { Divider, Dropdown, Menu } from "antd"
import { ChevronDown, User } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Header: React.FC = () => {
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setRole(parsedUser.role || null)
    }
  }, [])

  const handleBookNow = () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập trước khi đặt dịch vụ!")
      setTimeout(() => navigate("/login"), 3000)
    } else {
      navigate("/services")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setRole(null)
    navigate("/login")
    toast.success("Đã đăng xuất thành công!")
  }

  const getDashboardLink = () => {
    const storedUser = localStorage.getItem("user")
    const userRole = storedUser ? JSON.parse(storedUser).role : null

    switch (userRole) {
      case "admin":
        return "/admin"
      case "staff":
        return "/staff"
      case "skincare_staff":
        return "/therapist"
      case "user":
        return "/dashboard"
      default:
        return "/dashboard"
    }
  }

  const handleProfileClick = () => {
    console.log("User role from localStorage:", localStorage.getItem("user"))
    navigate(getDashboardLink())
  }

  const userMenu = (
    <Menu className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48">
      <Menu.Item key="dashboard" onClick={handleProfileClick} className="hover:bg-yellow-50">
        <div className="px-4 py-2 flex items-center gap-2 text-gray-700">
          <User size={16} />
          <span>My Profile</span>
        </div>
      </Menu.Item>
      <Menu.Item key="settings" className="hover:bg-yellow-50">
        <Link to="/settings" className="px-4 py-2 flex items-center gap-2 text-gray-700">
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
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Settings</span>
        </Link>
      </Menu.Item>
      <div className="border-t border-gray-100 my-1"></div>
      <Menu.Item key="logout" onClick={handleLogout} className="hover:bg-yellow-50">
        <div className="px-4 py-2 flex items-center gap-2 text-red-600">
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
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log Out</span>
        </div>
      </Menu.Item>
    </Menu>
  )

  return (
    <header className="bg-[#dad5c9] text-black py-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <img src={logo || "/placeholder.svg"} alt="LuLuSpa Logo" className="w-16 h-16 rounded-full" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            <span className="text-black-300">LuLu</span>
            <span className="text-yellow-300">Spa</span>
          </h1>
        </div>

        <nav>
          <ul className="hidden md:flex space-x-8 text-lg font-medium">
            <li>
              <Link to="/" className="hover:text-yellow-300 transition duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-yellow-300 transition duration-300">
                Services
              </Link>
            </li>
            <li>
              <Link to="/test" className="hover:text-yellow-300 transition duration-300">
                Test
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-yellow-300 transition duration-300">
                Blog
              </Link>
            </li>
            <li>
              <button onClick={() => setShowModal(true)} className="hover:text-yellow-300 transition duration-300">
                Contact
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            title="Book your appointment now"
            onClick={handleBookNow}
            className="hidden md:block bg-yellow-300 text-black py-2 px-6 rounded-lg shadow-md hover:bg-yellow-400 transition duration-100"
          >
            Book Now
          </button>

          <div className="flex items-center space-x-2">
            {user ? (
              <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
                <button className="flex items-center gap-2 bg-yellow-300/20 hover:bg-yellow-300/30 text-black px-3 py-2 rounded-lg transition-all duration-200">
                  <div className="bg-yellow-300 rounded-full p-1.5">
                    <User size={16} className="text-black" />
                  </div>
                  <span className="font-medium">{user.username}</span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 transition duration-300">
                  <span>Login</span>
                </Link>
                <Divider type="vertical" className="border-black mt-1 h-7" />
                <Link to="/register" className="hover:text-yellow-300 transition duration-300">
                  <span>Signup</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
      {/* Nút đóng modal */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-gray-900"
      >
        ×
      </button>

      {/* Tiêu đề */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Contact Information</h3>

      {/* Form */}
      <form className="space-y-4">
        <input type="text" placeholder="Name" className="p-2 border w-full rounded-md" />
        <input type="text" placeholder="Phone Number" className="p-2 border w-full rounded-md" />
        <button className="py-2 px-4 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600 transition">
          Submit
        </button>
      </form>

      {/* Thông tin LuLuSpa */}
      <div className="mt-6 text-left">
        <p className="text-gray-600 font-medium">🏡 Store Name: <span className="font-semibold">LuLuSpa</span></p>
        <p className="text-gray-600">📞 Phone: <span className="font-semibold">123-456-789</span></p>
        <p className="text-gray-600">📧 Email: <span className="font-semibold">info@luluspa.com</span></p>
        <p className="text-gray-600">⏰ Working Hours: <span className="font-semibold">Mon - Sat, 9:00 - 17:30</span></p>
        <a href="https://facebook.com/luluspa" className="text-blue-600 hover:underline mt-2 inline-block">
          🌐 Visit our Facebook
        </a>
      </div>
    </div>
  </div>
)}


      <ToastContainer autoClose={3000} />
    </header>
  )
}

export default Header

