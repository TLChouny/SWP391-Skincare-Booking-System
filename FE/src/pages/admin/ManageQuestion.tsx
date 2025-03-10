import { Form, Input, Button, InputNumber } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";

function ManageQuestion() {
  const title = "Question";
  const columns = [{ title: "Question", dataIndex: "text", key: "text" }];

  const formItems = (
    <>
      <Form.Item
        name='text'
        label='Question'
        rules={[{ required: true, message: "Please input question" }]}>
        <Input />
      </Form.Item>

      <Form.List name='options'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  marginBottom: "8px",
                }}>
                <Form.Item
                  {...restField}
                  name={[name, "text"]}
                  label={`Option ${key + 1}`}
                  rules={[
                    { required: true, message: "Please input option text" },
                  ]}>
                  <Input placeholder='Option text' />
                </Form.Item>

                {/* Input cho điểm của từng loại da */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "8px",
                  }}>
                  {["dry", "oily", "sensitive", "aging", "acne"].map(
                    (skinType) => (
                      <Form.Item
                        key={skinType}
                        name={[name, "points", skinType]}
                        label={skinType}>
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
            <Button
              type='dashed'
              onClick={() => add()}
              style={{ marginTop: "8px" }}>
              Add Option
            </Button>
          </>
        )}
      </Form.List>
    </>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        formItems={formItems}
        apiEndpoint='/questions'
      />
    </div>
  );
}

export default ManageQuestion;
