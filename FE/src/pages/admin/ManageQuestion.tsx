import React, { useState, useEffect } from "react";
import { Form, Input, Button, InputNumber } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import axios from "axios";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api";

function ManageQuestion() {
  const title = "Question";
  const columns = [{ title: "Question", dataIndex: "text", key: "text" }];

  // Lưu danh sách câu hỏi
  const [questions, setQuestions] = useState<any[]>([]);
  // State cho tìm kiếm
  const [searchText, setSearchText] = useState("");

  // Load danh sách câu hỏi khi component khởi tạo
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // Lọc câu hỏi theo từ khóa search
  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchText.toLowerCase())
  );

  // Định nghĩa formItems dưới dạng function (nhận editingId)
  const formItems = (editingId: string | null) => (
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

                {/* Các điểm cho từng loại da */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "3px",
                  }}
                >
                  {["dry", "oily", "sensitive", "aging", "acne"].map(
                    (skinType) => (
                      <Form.Item
                        key={skinType}
                        name={[name, "points", skinType]}
                        label={skinType}
                      >
                        <InputNumber min={0} defaultValue={0} />
                      </Form.Item>
                    )
                  )}
                </div>

                <Button danger onClick={() => remove(name)}>
                  Remove Option
                </Button>
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} style={{ marginTop: "8px" }}>
              Add Option
            </Button>
          </>
        )}
      </Form.List>
    </>
  );

  // Các control cho bộ lọc tìm kiếm
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

  // Callback refresh lại danh sách sau khi thêm/sửa/xoá
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
