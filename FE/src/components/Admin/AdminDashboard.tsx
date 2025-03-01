import React, { useState } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  InboxOutlined,
  QrcodeOutlined,
  StarOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

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
  getItem("AdminOverview", "/admin", <DashboardOutlined />),
  getItem("UserManagement", "/admin/user-management", <UserOutlined />),
  getItem("CategoryManagement", "/admin/category-management", <ReadOutlined />),
  getItem("BlogManagement", "/admin/blog-management", <InboxOutlined />),
  getItem("PaymentManagement", "/admin/payment-management", <QrcodeOutlined />),
  getItem("RatingManagement", "/admin/rating-management", <StarOutlined />),
  getItem(
    "QuestionManagement",
    "/admin/question-management",
    <QuestionOutlined />
  ),
];

const AdminDashboard: React.FC = () => {
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
          <Content style={{ margin: "16px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
