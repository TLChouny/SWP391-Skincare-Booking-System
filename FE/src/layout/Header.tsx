import React from "react";
import '../../src/index.css';
import logo from '../assets/logo7.png';
import { Link } from "react-router-dom";
import { Divider } from 'antd';
const Header: React.FC = () => {
  return (
    <header
      style={{ background: "#dad5c9" }}
      className="bg-#dad5c9 to-indigo-500 text-black py-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <img
              src={logo}
              alt="LuLuSpa Logo"
              className="w-16 h-16 rounded-full"
            />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            <span className="text-black-300">LuLu</span>
            <span className="text-yellow-300">Spa</span>
          </h1>
        </div>

        <nav>
          <ul className="hidden md:flex space-x-8 text-lg font-medium">
            <li>
              <a
                href="/"
                className="hover:text-yellow-300 transition duration-300 ease-in-out"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/services"
                className="hover:text-yellow-300 transition duration-300 ease-in-out"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="/booking"
                className="hover:text-yellow-300 transition duration-300 ease-in-out"
              >
                Booking
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-yellow-300 transition duration-300 ease-in-out"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* <div className="md:hidden">
          <button
            title="Open menu"
            aria-label="Open menu"
            className="text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div> */}
        <div className="flex items-center space-x-4">
          <button
            title="Book your appointment now"
            className="hidden md:block bg-yellow-300 text-black py-2 px-6 rounded-lg shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out"
          >
            Book Now
          </button>
          <div className="flex items-center space-x-2">
            <Link to="/login" className="flex items-center space-x-2">
              <span>Login</span>
            </Link>
            <Divider type="vertical" className="border-black mt-1 h-7"/>
            <div>
              <Link to="/register" className="flex items-center space-x-2">
                <span>Signup</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
