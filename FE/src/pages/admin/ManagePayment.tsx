import { Form, Input } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManagePayment() {
  const title = "payment";
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Payment", dataIndex: "payment", key: "payment" },
  ];

  const formItems = (
    <>
      <Form.Item
        name='payment'
        label='Payment'
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

export default ManagePayment;
