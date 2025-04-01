import React, { useState } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  InboxOutlined,
  QrcodeOutlined,
  StarOutlined,
  QuestionOutlined,
  ProductOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
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
  getItem("User", "/admin/user-management", <UserOutlined />),
  getItem("Sevices", "/admin/service-management", <ProductOutlined />),
  getItem("Voucher", "/admin/voucher-management", <MoneyCollectOutlined />),

  getItem("Category", "/admin/category-management", <ReadOutlined />),

  getItem("Blog", "/admin/blog-management", <InboxOutlined />),
  getItem("Payment", "/admin/payment-management", <QrcodeOutlined />),
  getItem("Rating", "/admin/rating-management", <StarOutlined />),
  getItem("Question", "/admin/question-management", <QuestionOutlined />),
  getItem("Setting", "/admin/settings", <SettingOutlined />),
];

const AdminDashboard: React.FC = () => {
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
          <Content style={{ margin: "16px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
