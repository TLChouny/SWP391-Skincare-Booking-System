import { Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState, useCallback } from "react";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import api from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

function ManageVoucher() {
  const { token } = useAuth();
  const title = "Voucher";
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState<string>("");
  const [discountFilter, setDiscountFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Fetch vouchers
  const fetchVouchers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/vouchers", {
        headers: { "x-auth-token": token },
      });
      setVouchers(res.data || []);
      setFilteredVouchers(res.data || []);
    } catch (error: any) {
      console.error("Error fetching vouchers:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [token]);

  // Hàm lọc dữ liệu
  const filterVouchers = useCallback(() => {
    let result = [...vouchers];

    // Lọc theo code
    if (searchCode) {
      result = result.filter((voucher) =>
        voucher.code.toLowerCase().includes(searchCode.toLowerCase())
      );
    }

    // Lọc theo discountPercentage
    if (discountFilter) {
      if (discountFilter === "0-25") {
        result = result.filter((voucher) => voucher.discountPercentage <= 25);
      } else if (discountFilter === "26-50") {
        result = result.filter(
          (voucher) => voucher.discountPercentage > 25 && voucher.discountPercentage <= 50
        );
      } else if (discountFilter === "51-75") {
        result = result.filter(
          (voucher) => voucher.discountPercentage > 50 && voucher.discountPercentage <= 75
        );
      } else if (discountFilter === "76-100") {
        result = result.filter((voucher) => voucher.discountPercentage > 75);
      }
    }

    setFilteredVouchers(result);
  }, [vouchers, searchCode, discountFilter]);

  // Gọi filter khi searchCode hoặc discountFilter thay đổi
  useEffect(() => {
    filterVouchers();
  }, [searchCode, discountFilter, filterVouchers]);

  const columns = [
    { title: "Code Name", dataIndex: "code", key: "code" },
    {
      title: "Discount Amount",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (text: number) => `${text}%`,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const formItems = (editingId: string | null) => (
    <>
      <Form.Item
        name="code"
        label="Code Name"
        rules={[{ required: true, message: "Please input code name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="discountPercentage"
        label="Discount Amount"
        rules={[
          { required: true, message: "Please input discount amount" },
          {
            type: "number",
            min: 1,
            max: 100,
            message: "Discount must be between 1-100",
          },
        ]}
      >
        <InputNumber
          min={1}
          max={100}
          style={{ width: "100%" }}
          formatter={(value) => `${value}%`}
          parser={(value) => {
            const parsed = value ? parseInt(value.replace("%", "")) : 1; // Mặc định là 1 nếu không có giá trị
            return Math.max(1, Math.min(100, parsed)) as 1 | 100; // Giới hạn trong khoảng 1-100
          }}
        />
      </Form.Item>
      <Form.Item
        name="expiryDate"
        label="Expiry Date"
        rules={[{ required: true, message: "Please input expiry date" }]}
      >
        <Input type="date" />
      </Form.Item>
    </>
  );

  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by code"
        onChange={(e) => setSearchCode(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select
        placeholder="Filter by discount"
        onChange={(value) => setDiscountFilter(value)}
        value={discountFilter}
        style={{ width: 200 }}
        allowClear
      >
        <Select.Option value="0-25">0% - 25%</Select.Option>
        <Select.Option value="26-50">26% - 50%</Select.Option>
        <Select.Option value="51-75">51% - 75%</Select.Option>
        <Select.Option value="76-100">76% - 100%</Select.Option>
      </Select>
    </div>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint="/vouchers"
        dataSource={filteredVouchers}
        onUpdateSuccess={fetchVouchers}
        filterControls={filterControls}
      />
    </div>
  );
}

export default ManageVoucher;