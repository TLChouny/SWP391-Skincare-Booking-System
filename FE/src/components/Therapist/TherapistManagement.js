import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CheckOutlined, ClockCircleOutlined, CustomerServiceOutlined, HistoryOutlined, ScheduleOutlined, UserOutlined, } from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { Link, Outlet } from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label: _jsx(Link, { to: key, children: label }),
    };
}
const items = [
    getItem("TherapistSchedule", "/therapist/therapistSchedule", _jsx(ScheduleOutlined, {})),
    getItem("TherapistAppointments", "/therapist/therapistAppointments", _jsx(ClockCircleOutlined, {})),
    getItem("ServiceHistory", "/therapist/serviceHistory", _jsx(HistoryOutlined, {})),
    getItem("ServiceExecution", "/therapist/serviceExecution", _jsx(CheckOutlined, {})),
    getItem("CustomerRecords", "/therapist/customerRecords", _jsx(CustomerServiceOutlined, {})),
    getItem("TherapistProfile", "/therapist/therapistProfile", _jsx(UserOutlined, {})),
];
const TherapistManagement = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG }, } = theme.useToken();
    return (_jsxs(Layout, { style: { minHeight: "100vh" }, children: [_jsxs(Sider, { theme: 'light', collapsible: true, collapsed: collapsed, onCollapse: (value) => setCollapsed(value), children: [_jsx("div", { className: 'demo-logo-vertical' }), _jsx(Menu, { defaultSelectedKeys: ["1"], mode: 'inline', items: items })] }), _jsxs(Layout, { children: [_jsx(Header, { style: { padding: 0, background: colorBgContainer } }), _jsx(Content, { style: { margin: "0 16px" }, children: _jsx("div", { style: {
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }, children: _jsx(Outlet, {}) }) }), _jsxs(Footer, { style: { textAlign: "center" }, children: ["LuLuSpa \u00A9", new Date().getFullYear(), " Created by Ant UED"] })] })] }));
};
export default TherapistManagement;
