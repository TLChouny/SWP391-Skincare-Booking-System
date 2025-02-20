import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
function ManageQuestion() {
    const title = "category";
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Question", dataIndex: "question", key: "question" },
    ];
    const formItems = (_jsxs(_Fragment, { children: [_jsx(Form.Item, { name: 'question', label: 'Question', rules: [{ required: true, message: "Please input category name" }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: 'description', label: 'Description', children: _jsx(Input.TextArea, {}) })] }));
    return (_jsx("div", { children: _jsx(ManageTemplate, { title: title, columns: columns, formItems: formItems }) }));
}
export default ManageQuestion;
