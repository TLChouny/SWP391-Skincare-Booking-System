import React, { useState } from "react";
import { PieChartOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

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
  getItem("AdminOverview", "/admin", <PieChartOutlined />),
  getItem("UserManagement", "/admin/user-management", <PieChartOutlined />),
  getItem(
    "CategoryManagement",
    "/admin/category-management",
    <PieChartOutlined />
  ),
  getItem("BlogManagement", "/admin/blog-management", <PieChartOutlined />),
  getItem(
    "PaymentManagement",
    "/admin/payment-management",
    <PieChartOutlined />
  ),
  getItem("RatingManagement", "/admin/rating-management", <PieChartOutlined />),
  getItem(
    "QuestionManagement",
    "/admin/question-management",
    <PieChartOutlined />
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
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
