import { Form, Input } from "antd";
import { useEffect, useState, useCallback } from "react";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import api from "../../api/apiService"; // Giả sử bạn đã có apiService
import { useAuth } from "../../context/AuthContext";

function ManageCategory() {
  const { token } = useAuth();
  const title = "Category"; // Viết hoa chữ cái đầu cho đẹp
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/categories", {
        headers: { "x-auth-token": token },
      });
      setCategories(res.data || []);
      setFilteredCategories(res.data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Hàm lọc dữ liệu
  const filterCategories = useCallback(() => {
    let result = [...categories];

    // Lọc theo name
    if (searchName) {
      result = result.filter((category) =>
        category.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredCategories(result);
  }, [categories, searchName]);

  // Gọi filter khi searchName thay đổi
  useEffect(() => {
    filterCategories();
  }, [searchName, filterCategories]);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
  ];

  // Sửa formItems thành hàm
  const formItems = (editingId: string | null) => (
    <>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please input category name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
    </>
  );

  // Filter controls (chỉ có search)
  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by name"
        onChange={(e) => setSearchName(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
    </div>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint="/categories"
        dataSource={filteredCategories}
        onUpdateSuccess={fetchCategories}
        filterControls={filterControls}
      />
    </div>
  );
}

export default ManageCategory;