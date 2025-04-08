import React, { useState, useEffect } from "react";
import { Form, Input, Button, InputNumber, message } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom"; // Use RouterLink for navigation

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api";

function ManageQuestion() {
  const title = "Question";
  const columns = [{ title: "Question", dataIndex: "text", key: "text" }];

  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/quizzs`);
      setQuestions(res.data);
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      message.error(err.response?.data?.message || "Không thể tải danh sách câu hỏi!");
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axios.get(`${API_URL}/categories`);
      const categoryNames = res.data.map((category: any) => category.name);
      setCategories(categoryNames);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      message.error(err.response?.data?.message || "Không thể tải danh sách danh mục!");
    } finally {
      setLoadingCategories(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const formItems = (editingId: string | null) => {
    if (loadingCategories) {
      return <div>Đang tải danh mục, vui lòng chờ...</div>;
    }
    if (categories.length === 0) {
      return (
        <div>
          Không có danh mục nào trong hệ thống. Vui lòng{" "}
          <RouterLink to="/manage-categories">thêm danh mục</RouterLink> trước!
        </div>
      );
    }

    return (
      <>
        <Form.Item
          name="text"
          label="Question"
          rules={[{ required: true, message: "Please input question" }]}
        >
          <Input />
        </Form.Item>

        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "text"]}
                    label={`Option ${key + 1}`}
                    rules={[
                      { required: true, message: "Please input option text" },
                    ]}
                  >
                    <Input placeholder="Option text" />
                  </Form.Item>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
                      gap: "3px",
                    }}
                  >
                    {categories.map((category) => (
                      <Form.Item
                        key={category}
                        name={[name, "points", category]}
                        label={category}
                      >
                        <InputNumber min={0} defaultValue={0} />
                      </Form.Item>
                    ))}
                  </div>

                  <Button danger onClick={() => remove(name)}>
                    Remove Option
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                style={{ marginTop: "8px" }}
              >
                Add Option
              </Button>
            </>
          )}
        </Form.List>
      </>
    );
  };

  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by question"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
    </div>
  );

  const handleUpdateSuccess = () => {
    fetchQuestions();
  };

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        dataSource={filteredQuestions}
        formItems={formItems}
        apiEndpoint="/questions"
        filterControls={filterControls}
        onUpdateSuccess={handleUpdateSuccess}
        setDataSource={setQuestions}
      />
    </div>
  );
}

export default ManageQuestion;