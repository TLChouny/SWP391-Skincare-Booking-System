import { Form, Input, InputNumber, Select, Tag } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManagePayment() {
  const title = "Payment";

  const statusColors: Record<string, string> = {
    pending: "gold",
    success: "green",
    failed: "red",
    cancelled: "gray",
  };

  const columns = [
    { title: "Order Code", dataIndex: "orderCode", key: "orderCode" },
    { title: "Order Name", dataIndex: "orderName", key: "orderName" },
    {
      title: "Amount (VND)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => amount.toLocaleString("vi-VN"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item
        name='orderCode'
        label='Order Code'
        rules={[{ required: true, message: "Please enter order code" }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name='orderName'
        label='Order Name'
        rules={[{ required: true, message: "Please enter order name" }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name='amount'
        label='Amount'
        rules={[{ required: true, message: "Please enter amount" }]}>
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name='description' label='Description'>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name='status' label='Status' initialValue='pending'>
        <Select>
          <Select.Option value='pending'>Pending</Select.Option>
          <Select.Option value='success'>Success</Select.Option>
          <Select.Option value='failed'>Failed</Select.Option>
          <Select.Option value='cancelled'>Cancelled</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name='returnUrl' label='Return URL'>
        <Input />
      </Form.Item>
      <Form.Item name='cancelUrl' label='Cancel URL'>
        <Input />
      </Form.Item>
    </>
  );

  return (
    <ManageTemplate
      title={title}
      columns={columns}
      formItems={formItems}
      apiEndpoint='/payments'
      mode='view-only'
    />
  );
}

export default ManagePayment;
