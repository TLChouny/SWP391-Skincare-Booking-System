import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { PieChartOutlined } from "@ant-design/icons";
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
    getItem("UserManagement", "/admin/user-management", _jsx(PieChartOutlined, {})),
    getItem("CategoryManagement", "/admin/category-management", _jsx(PieChartOutlined, {})),
    getItem("BlogManagement", "/admin/blog-management", _jsx(PieChartOutlined, {})),
    getItem("PaymentManagement", "/admin/payment-management", _jsx(PieChartOutlined, {})),
    getItem("RatingManagement", "/admin/rating-management", _jsx(PieChartOutlined, {})),
    getItem("QuestionManagement", "/admin/question-management", _jsx(PieChartOutlined, {})),
];
const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG }, } = theme.useToken();
    return (_jsxs(Layout, { style: { minHeight: "100vh" }, children: [_jsxs(Sider, { theme: 'light', collapsible: true, collapsed: collapsed, onCollapse: (value) => setCollapsed(value), children: [_jsx("div", { className: 'demo-logo-vertical' }), _jsx(Menu, { defaultSelectedKeys: ["1"], mode: 'inline', items: items })] }), _jsxs(Layout, { children: [_jsx(Header, { style: { padding: 0, background: colorBgContainer } }), _jsx(Content, { style: { margin: "0 16px" }, children: _jsx("div", { style: {
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }, children: _jsx(Outlet, {}) }) }), _jsxs(Footer, { style: { textAlign: "center" }, children: ["Ant Design \u00A9", new Date().getFullYear(), " Created by Ant UED"] })] })] }));
};
export default Dashboard;
