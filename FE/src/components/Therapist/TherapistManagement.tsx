import React, { useState } from "react";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

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
  getItem(
    "TherapistSchedule",
    "/therapist/therapistSchedule",
    <ScheduleOutlined />
  ),

  getItem(
    "TherapistAppointments",
    "/therapist/therapistAppointments",
    <ClockCircleOutlined />
  ),
  getItem("ServiceHistory", "/therapist/serviceHistory", <HistoryOutlined />),
  getItem("ServiceExecution", "/therapist/serviceExecution", <CheckOutlined />),
  getItem(
    "CustomerRecords",
    "/therapist/customerRecords",
    <CustomerServiceOutlined />
  ),
  getItem("TherapistProfile", "/therapist/therapistProfile", <UserOutlined />),
];

const TherapistManagement: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme='light'
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}>
        <div className='demo-logo-vertical' />
        <Menu defaultSelectedKeys={["1"]} mode='inline' items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          LuLuSpa ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default TherapistManagement;
