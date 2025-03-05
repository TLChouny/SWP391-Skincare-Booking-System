import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageCategory() {
  const title = "category";
  const columns = [
   
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
  ];

  const formItems = (
    <>
      <Form.Item
        name='name'
        label='Name'
        rules={[{ required: true, message: "Please input category name" }]}>
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
        apiEndpoint='/categories'
      />
    </div>
  );
}

export default ManageCategory;
