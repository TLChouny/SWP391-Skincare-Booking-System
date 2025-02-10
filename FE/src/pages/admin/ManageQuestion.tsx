import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageQuestion() {
  const title = "category";
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Question", dataIndex: "question", key: "question" },
  ];

  const formItems = (
    <>
      <Form.Item
        name='question'
        label='Question'
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

export default ManageQuestion;
