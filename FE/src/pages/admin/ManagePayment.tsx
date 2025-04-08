import { Form, Input, InputNumber, Select, Tag } from "antd";
import { useEffect, useState, useCallback } from "react";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import api from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

function ManagePayment() {
  const { token } = useAuth();
  const title = "Payment";
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchOrderName, setSearchOrderName] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "gold",
    success: "green",
    failed: "red",
    cancelled: "gray",
  };

  // Fetch dữ liệu từ API /payments
  const fetchPayments = async () => {
    if (!token) {
      console.log("No token available, skipping fetch.");
      setPayments([]);
      setFilteredPayments([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/payments/all", {
        headers: { "x-auth-token": token },
      });
      console.log("API response from /payments:", res.data.data); // Debug dữ liệu API
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      // Thêm key cho mỗi item
      const dataWithKey = data.map((payment: any) => ({
        ...payment,
        key: payment._id, // Sử dụng _id làm key
      }));
      setPayments(dataWithKey);
      setFilteredPayments(dataWithKey);
      if (data.length === 0) {
        console.log("No payments returned from API.");
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error.response?.data.data || error);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching payments with token:", token);
    fetchPayments();
  }, [token]);

  // Hàm lọc dữ liệu
  const filterPayments = useCallback(() => {
    let result = [...payments];

    // Lọc theo orderName
    if (searchOrderName) {
      result = result.filter((payment) =>
        payment.orderName?.toLowerCase().includes(searchOrderName.toLowerCase())
      );
    }

    // Lọc theo status
    if (filterStatus) {
      result = result.filter((payment) => payment.status === filterStatus);
    }

    console.log("Filtered payments:", result); // Debug dữ liệu sau khi lọc
    setFilteredPayments(result);
  }, [payments, searchOrderName, filterStatus]);

  useEffect(() => {
    filterPayments();
  }, [searchOrderName, filterStatus, filterPayments]);

  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Order Name",
      dataIndex: "orderName",
      key: "orderName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Amount (VND)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (amount ? amount.toLocaleString("vi-VN") : "N/A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status ? status.toUpperCase() : "N/A"}
        </Tag>
      ),
    },
  ];

  const formItems = (editingId: string | null) => (
    <>
      <Form.Item
        name="orderCode"
        label="Order Code"
        rules={[{ required: true, message: "Please enter order code" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="orderName"
        label="Order Name"
        rules={[{ required: true, message: "Please enter order name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="amount"
        label="Amount"
        rules={[{ required: true, message: "Please enter amount" }]}
      >
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="status" label="Status" initialValue="pending">    <Select>
        <Select.Option value="pending">Pending</Select.Option>
        <Select.Option value="success">Success</Select.Option>
        <Select.Option value="failed">Failed</Select.Option>
        <Select.Option value="cancelled">Cancelled</Select.Option>
      </Select>
      </Form.Item>
      <Form.Item name="returnUrl" label="Return URL">
        <Input />
      </Form.Item>
      <Form.Item name="cancelUrl" label="Cancel URL">
        <Input />
      </Form.Item>
    </>
  );

  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by order name"
        onChange={(e) => setSearchOrderName(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select
        placeholder="Filter by status"
        onChange={(value) => setFilterStatus(value)}
        value={filterStatus}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="pending">Pending</Select.Option>
        <Select.Option value="success">Success</Select.Option>
        <Select.Option value="failed">Failed</Select.Option>
        <Select.Option value="cancelled">Cancelled</Select.Option>
      </Select>
    </div>
  );

  // Log dữ liệu trước khi render
  console.log("Payments dataSource before render:", filteredPayments);

  function onUpdateSuccess(): void {
    fetchPayments();
  }

  return (
    <ManageTemplate
      title={title}
      columns={columns}
      formItems={formItems}
      apiEndpoint="/payments"
      dataSource={filteredPayments}
      mode="readonly"
      onUpdateSuccess={onUpdateSuccess}
      filterControls={filterControls}
    />
  );
}

export default ManagePayment;