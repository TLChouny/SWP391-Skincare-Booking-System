import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import api from "../../api/apiService";
import { Button, Form, Modal, Table } from "antd";
import { toast } from "react-toastify";
function ManageTemplate({ columns, title, formItems }) {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const fetchUser = async () => {
        try {
            const res = await api.get("https://666c0b8749dbc5d7145c5890.mockapi.io/api");
            setUsers(res.data);
        }
        catch (error) {
            toast.error(`Erorr fetching ${title}`);
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);
    return (_jsxs("div", { children: [_jsxs(Button, { onClick: () => {
                    setShowModal(true);
                }, children: ["Create new ", title] }), _jsx(Table, { columns: columns, dataSource: users }), _jsx(Modal, { open: showModal, footer: [
                    _jsx(Button, { onClick: () => setShowModal(false), children: "Cancel" }, 'back'),
                ], children: _jsxs(Form, { labelCol: { span: 24 }, children: [_jsx(Form.Item, { name: 'id', label: 'id', hidden: true }), formItems] }) })] }));
}
export default ManageTemplate;
