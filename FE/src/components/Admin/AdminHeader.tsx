import React from "react";
import { Layout, Avatar, Dropdown, Menu, Badge } from "antd";
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import logo7 from "../../assets/logo7.png";

const { Header } = Layout;

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <UserOutlined />,
          label: "Thông tin cá nhân",
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Cài đặt",
        },
        {
          type: "divider",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          onClick: () => {
            localStorage.removeItem("user");
            navigate("/login");
          },
        },
      ]}
    />
  );

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
      }}>
      <div className='flex items-center'>
   
          <img
            src={logo7}
            alt='LuLuSpa Logo'
            className='w-16 h-16 rounded-full'
          />
        
        <div className='text-xl font-semibold ml-4 p'>Welcome</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Badge count={5} size='small'>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
        </Badge>
        <Dropdown overlay={userMenu} placement='bottomRight' arrow>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <Avatar icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminHeader;
