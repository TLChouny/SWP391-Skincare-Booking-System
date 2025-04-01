import { Form, Input, InputNumber, Select, Button, Modal, Tag } from "antd";
import { useEffect, useState, useCallback } from "react";
import api from "../../api/apiService";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import { useAuth } from "../../context/AuthContext";

function ManageService() {
  const { token } = useAuth();
  const title = "Service";
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [vouchers, setVouchers] = useState<
    { _id: string; code: string; discountPercentage: number }[]
  >([]);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  // Fetch products
  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/products", {
        headers: { "x-auth-token": token },
      });
      setProducts(res.data || []);
      setFilteredProducts(res.data || []); // Ban đầu hiển thị tất cả
    } catch (error: any) {
      console.error(
        "Error fetching products:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await api.get("/categories", {
          headers: { "x-auth-token": token },
        });
        setCategories(res.data || []);
      } catch (error: any) {
        console.error(
          "Error fetching categories:",
          error.response?.data || error.message
        );
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      if (!token) return;
      try {
        const res = await api.get("/vouchers", {
          headers: { "x-auth-token": token },
        });
        setVouchers(res.data || []);
      } catch (error: any) {
        console.error(
          "Error fetching vouchers:",
          error.response?.data || error.message
        );
      }
    };
    fetchVouchers();
  }, [token]);

  // Hàm lọc dữ liệu ở client
  const filterProducts = useCallback(() => {
    let result = [...products];

    // Lọc theo tên
    if (searchName) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Lọc theo category
    if (selectedCategory) {
      result = result.filter(
        (product) => product.category?._id === selectedCategory
      );
    }

    setFilteredProducts(result);
  }, [products, searchName, selectedCategory]);

  // Gọi filter khi searchName hoặc selectedCategory thay đổi
  useEffect(() => {
    filterProducts();
  }, [searchName, selectedCategory, filterProducts]);

  const columns = [
    { title: "Service Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number, record: any) => (
        <div>
          <span
            style={{
              textDecoration: record.discountedPrice ? "line-through" : "none",
            }}
          >
            {price.toLocaleString()} VND
          </span>
          {record.discountedPrice && (
            <div style={{ color: "green" }}>
              {record.discountedPrice.toLocaleString()} VND
            </div>
          )}
        </div>
      ),
    },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: any) => category?.name || "N/A",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? (
          <img src={image} alt="Service" width={50} height={50} />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Vouchers",
      dataIndex: "vouchers",
      key: "vouchers",
      render: (vouchers: any[], record: any) => (
        <div>
          {vouchers?.map((voucher: any) => (
            <Tag
              key={voucher._id}
              color="blue"
              closable
              onClose={() => handleRemoveVoucher(record._id, voucher._id)}
            >
              {voucher.code} ({voucher.discountPercentage}%)
            </Tag>
          ))}
          {record.vouchers.length === 0 && (
            <Button
              type="link"
              onClick={() => {
                setSelectedProductId(record._id);
                setIsVoucherModalVisible(true);
              }}
            >
              Add Voucher
            </Button>
          )}
        </div>
      ),
    },
  ];

  const formItems = (editingId: string | null) => {
    return (
      <>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input service name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: "Please input price" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Duration (minutes)"
          rules={[{ required: true, message: "Please input duration" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select category">
            {categories.map((cat) => (
              <Select.Option key={cat._id} value={cat._id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="image" label="Image URL">
          <Input placeholder="Enter image URL" />
        </Form.Item>
      </>
    );
  };

  const handleAddVoucher = async () => {
    if (!token || !selectedProductId || !selectedVoucher) return;

    const selectedProduct = products.find((p) => p._id === selectedProductId);
    const hasVoucher = selectedProduct?.vouchers?.length > 0;

    if (hasVoucher) {
      Modal.warning({
        title: "This service already has a voucher",
        content: "Please remove the current voucher before adding a new one.",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post(
        `/products/${selectedProductId}/vouchers`,
        { voucherId: selectedVoucher },
        { headers: { "x-auth-token": token } }
      );
      setIsVoucherModalVisible(false);
      setSelectedVoucher(null);
      fetchProducts();
    } catch (error: any) {
      console.error(
        "Error adding voucher:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = async (productId: string, voucherId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      await api.delete(`/products/${productId}/vouchers/${voucherId}`, {
        headers: { "x-auth-token": token },
      });
      fetchProducts();
    } catch (error: any) {
      console.error(
        "Error removing voucher:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by name"
        onChange={(e) => setSearchName(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select
        placeholder="Filter by category"
        onChange={(value) => setSelectedCategory(value)}
        value={selectedCategory}
        style={{ width: 200 }}
        allowClear
      >
        {categories.map((cat) => (
          <Select.Option key={cat._id} value={cat._id}>
            {cat.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const assignedVoucherIds =
    products
      .find((p) => p._id === selectedProductId)
      ?.vouchers?.map((v: { _id: string }) => v._id) || [];

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint="/products"
        dataSource={filteredProducts}
        onUpdateSuccess={fetchProducts}
        filterControls={filterControls}
      />
      <Modal
        title="Add Voucher to Service"
        open={isVoucherModalVisible}
        onOk={handleAddVoucher}
        onCancel={() => setIsVoucherModalVisible(false)}
        confirmLoading={loading}
      >
        {assignedVoucherIds.length === 0 ? (
          <Select
            style={{ width: "100%" }}
            placeholder="Select a voucher"
            onChange={(value) => setSelectedVoucher(value)}
            value={selectedVoucher}
          >
            {vouchers.map((voucher) => (
              <Select.Option key={voucher._id} value={voucher._id}>
                {voucher.code} ({voucher.discountPercentage}%)
              </Select.Option>
            ))}
          </Select>
        ) : (
          <p>
            This service already has a voucher. Please remove it before adding
            another.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default ManageService;
