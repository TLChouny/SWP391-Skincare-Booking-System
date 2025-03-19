import React, { useState } from "react";
import {
  // HistoryOutlined,
  // ScheduleOutlined,
  CheckOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";

const { Content, Sider } = Layout;

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
  getItem("Check In", "/staff/check-in", <CheckOutlined />),

  // getItem(
  //   "Assign Specialists",
  //   "/staff/assign-specialists",
  //   <ScheduleOutlined />
  // ),
  getItem("Check Out", "/staff/check-out", <LogoutOutlined />),
  // getItem(
  //   "Appointment Schedules",
  //   "/staff/appointment-schedules",
  //   <HistoryOutlined />
  // ),
];

const StaffManagement: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminHeader />
      <Layout style={{ marginTop: "10px" }}>
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
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffManagement;
