import { Form, Input, InputNumber } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageVoucher() {
  const title = "rating";
  const columns = [
    { title: "Code Name", dataIndex: "code", key: "code" },

    {
      title: "Discount Amount",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (text: string) => `${text}%`,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const formItems = (
    <>
      <Form.Item
        name='code'
        label=' Code Name'
        rules={[{ required: true, message: "Please input code name" }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name='discountPercentage'
        label='Discount Amount'
        rules={[
          { required: true, message: "Please input discount amount" },
          {
            type: "number",
            min: 1,
            max: 100,
            message: "Discount must be between 1-100",
          },
        ]}>
        <InputNumber
          min={1}
          max={100}
          style={{ width: "100%" }}
          formatter={(value) => `${value}%`}
        />
      </Form.Item>
      <Form.Item
        name='expiryDate'
        label='Expiry Date'
        rules={[{ required: true, message: "Please input expiry date" }]}>
        <Input type='date' />
      </Form.Item>
    </>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint='/vouchers'
      />
    </div>
  );
}

export default ManageVoucher;
