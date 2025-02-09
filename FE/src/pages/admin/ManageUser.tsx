import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageUser() {
  const title = "user";
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
  ];

  const formItems = (
    <>
      <Form.Item
        name='name'
        label='Name'
        rules={[{ required: true, message: "Please input user name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name='description' label='Description'>
        <Input.TextArea />
      </Form.Item>
    </>
  );

  return (
    <div>
      <ManageTemplate title={title} columns={columns} formItems={formItems} />
    </div>
  );
}

export default ManageUser;
