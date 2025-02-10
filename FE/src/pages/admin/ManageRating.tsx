import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageRating() {
  const title = "rating";
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Rating", dataIndex: "rating", key: "rating" },
  ];

  const formItems = (
    <>
      <Form.Item
        name='rating'
        label='Rating'
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
      <ManageTemplate title={title} columns={columns} formItems={formItems} />
    </div>
  );
}

export default ManageRating;
