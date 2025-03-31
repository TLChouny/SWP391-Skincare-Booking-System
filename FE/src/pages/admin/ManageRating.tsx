import { Form, Input, Rate } from "antd";
import ManageTemplate from "../../components/ManageTemplate/ManageTemplate";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api";

function ManageRating() {
  const title = "Rating";
  const [ratings, setRatings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState(0);

  // Fetch ratings from the API
  const fetchRatings = async () => {
    try {
      const response = await axios.get(`${API_URL}/ratings`);
      setRatings(response.data);
    } catch (error) {
      console.error("Error fetching ratings", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  // Filter ratings based on the search term and rating filter
  const filteredRatings = ratings.filter((item) => {
    const matchesName = item.serviceName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 0 || item.serviceRating === filterRating;
    return matchesName && matchesRating;
  });

  // Define the table columns
  const columns = [
    { title: "Service Name", dataIndex: "serviceName", key: "serviceName" },
    {
      title: "Rating",
      dataIndex: "serviceRating",
      key: "serviceRating",
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    { title: "Comment", dataIndex: "serviceContent", key: "serviceContent" },
    { title: "User", dataIndex: "createName", key: "createName" },
  ];

  const formItems = (editingId: string | null) => (
    <>
      <Form.Item
        name="serviceRating"
        label="Rating"
        rules={[{ required: true, message: "Please input rating" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="serviceContent" label="Comment">
        <Input.TextArea />
      </Form.Item>
    </>
  );

  // Filter controls: an input for searching by service name and a rating filter
  const filterControls = (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Input.Search
        placeholder="Search by Service name"
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 4 }}>Rating:</span>
        <Rate
          value={filterRating}
          onChange={(value) => setFilterRating(value)}
          allowClear
        />
      </div>
    </div>
  );

  return (
    <div>
      <ManageTemplate
        title={title}
        columns={columns}
        dataSource={filteredRatings}
        formItems={formItems}
        apiEndpoint="/ratings"
        mode="readonly"
        filterControls={filterControls}
      />
    </div>
  );
}

export default ManageRating;