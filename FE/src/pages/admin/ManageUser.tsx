import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageUser() {
  const title = "user";
  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "Name", dataIndex: "username", key: "username" },
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
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint='/users'
      />
    </div>
  );
}

export default ManageUser;
