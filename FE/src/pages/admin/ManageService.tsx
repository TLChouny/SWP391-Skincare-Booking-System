import { Form, Input, InputNumber, Select, Button, Modal, Tag } from "antd";
import { useEffect, useState } from "react";
import api from "../../api/apiService";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageService() {
  const title = "Service";
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [vouchers, setVouchers] = useState<{ _id: string; code: string; discountPercentage: number }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await api.get("/vouchers");
        setVouchers(res.data || []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchVouchers();
  }, []);

  const columns = [
    { title: "Service Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number, record: any) => (
        <div>
          <span style={{ textDecoration: record.discountedPrice ? "line-through" : "none" }}>
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
        image ? <img src={image} alt="Service" width={50} height={50} /> : "No Image",
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
          <Button
            type="link"
            onClick={() => {
              setSelectedProductId(record._id);
              setIsModalVisible(true);
            }}
          >
            Add Voucher
          </Button>
        </div>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input service name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please input price" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true, message: "Please input duration" }]}>
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      {/* <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select a category" }]}> */}
        {/* <Select placeholder="Select category">
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select> */}
      {/* </Form.Item> */}
      <Form.Item name="image" label="Image URL">
        <Input placeholder="Enter image URL" />
      </Form.Item>
    </>
  );

  const handleAddVoucher = async () => {
    if (!selectedProductId || !selectedVoucher) return;
    try {
      setLoading(true);
      await api.post(`/products/${selectedProductId}/vouchers`, { voucherId: selectedVoucher });
      setIsModalVisible(false);
      setSelectedVoucher(null);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error adding voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = async (productId: string, voucherId: string) => {
    try {
      setLoading(true);
      await api.delete(`/products/${productId}/vouchers/${voucherId}`);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error removing voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint="/products"
        dataSource={products}
        setDataSource={setProducts}
      />
      <Modal
        title="Add Voucher to Service"
        visible={isModalVisible}
        onOk={handleAddVoucher}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
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
      </Modal>
    </div>
  );
}

export default ManageService;