import { Form, Input, Select } from "antd";
import { useEffect, useState, useCallback } from "react";
import api from "../../api/apiService";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import { useAuth } from "../../context/AuthContext";

function ManageBlog() {
  const { token } = useAuth(); // Thêm useAuth để lấy token
  const title = "Blog";
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await api.get("/categories", {
          headers: { "x-auth-token": token },
        });
        setCategories(res.data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error.response?.data || error);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch danh sách blogs từ API
  const fetchBlogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/blogs", {
        headers: { "x-auth-token": token },
      });
      setBlogs(res.data || []);
      setFilteredBlogs(res.data || []);
    } catch (error: any) {
      console.error("Error fetching blogs:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  // Hàm lọc dữ liệu
  const filterBlogs = useCallback(() => {
    let result = [...blogs];

    // Lọc theo title
    if (searchTitle) {
      result = result.filter((blog) =>
        blog.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Lọc theo createName (author)
    if (filterAuthor) {
      result = result.filter((blog) => blog.createName === filterAuthor);
    }

    setFilteredBlogs(result);
  }, [blogs, searchTitle, filterAuthor]);

  // Gọi filter khi searchTitle hoặc filterAuthor thay đổi
  useEffect(() => {
    filterBlogs();
  }, [searchTitle, filterAuthor, filterBlogs]);

  // Lấy danh sách tác giả duy nhất để filter
  const uniqueAuthors = Array.from(new Set(blogs.map((blog) => blog.createName)));

  // Cấu hình cột hiển thị trong bảng
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Author", dataIndex: "createName", key: "createName" },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryName",
      render: (categoryId: string) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : "N/A";
      },
    },
    { title: "Content", dataIndex: "content", key: "content" },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? <img src={image} alt="blog" style={{ width: 100 }} /> : "No Image",
    },
  ];

  // Form nhập Blog
  const formItems = (editingId: string | null) => (
    <>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please input blog title" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: "Please input blog content" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="createName"
        label="Author Name"
        rules={[{ required: true, message: "Please input author name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="categoryId"
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
        <Input />
      </Form.Item>
    </>
  );

  // Filter controls
  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by title"
        onChange={(e) => setSearchTitle(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select
        placeholder="Filter by author"
        onChange={(value) => setFilterAuthor(value)}
        value={filterAuthor}
        style={{ width: 200 }}
        allowClear
      >
        {uniqueAuthors.map((author) => (
          <Select.Option key={author} value={author}>
            {author}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  return (
    <ManageTemplate
      title={title}
      columns={columns}
      formItems={formItems}
      apiEndpoint="/blogs"
      dataSource={filteredBlogs}
      onUpdateSuccess={fetchBlogs}
      filterControls={filterControls}
    />
  );
}

export default ManageBlog;