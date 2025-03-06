import { Form, Input, InputNumber, Select } from "antd";
import { useEffect, useState } from "react";
import api from "../../api/apiService";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageService() {
  const title = "Service";
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  // Fetch danh sách categories
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

  const columns = [
    { title: "Service Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Price ", dataIndex: "price", key: "price" },
    { title: "Duration ", dataIndex: "duration", key: "duration" },
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
          <img src={image} alt='Service' width={50} height={50} />
        ) : (
          "No Image"
        ),
    },
  ];

  const formItems = (
    <>
      <Form.Item
        name='name'
        label='Name'
        rules={[{ required: true, message: "Please input service name" }]}>
        <Input />
      </Form.Item>

      <Form.Item name='description' label='Description'>
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name='price'
        label='Price'
        rules={[{ required: true, message: "Please input price" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name='duration'
        label='Duration (minutes)'
        rules={[{ required: true, message: "Please input duration" }]}>
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name='category'
        label='Category'
        rules={[{ required: true, message: "Please select a category" }]}>
        <Select placeholder='Select category'>
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name='image' label='Image URL'>
        <Input placeholder='Enter image URL' />
      </Form.Item>
    </>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint='/products'
      />
    </div>
  );
}

export default ManageService;
