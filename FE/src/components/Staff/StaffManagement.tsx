import React, { useState } from "react";
import {
  ClockCircleOutlined,
  HistoryOutlined,
  ProfileOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{label}</Link>,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("StaffBooking", "/staff/staffBooking", <ScheduleOutlined />),

  getItem("StaffPayment", "/staff/staffPayment", <ClockCircleOutlined />),
  getItem("StaffService", "/staff/staffService", <HistoryOutlined />),
  getItem("StaffProfile", "/staff/staffProfile", <ProfileOutlined />),
];

const StaffManagement: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminHeader />
      <Layout style={{ marginTop: "80px" }}>
        <Sider
          className='mt-5'
          theme='light'
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}>
          <div className='demo-logo-vertical' />
          <Menu defaultSelectedKeys={["1"]} mode='inline' items={items} />
        </Sider>
        <Layout>
          <Content style={{ margin: " 16px" }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            LuLuSpa ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffManagement;
