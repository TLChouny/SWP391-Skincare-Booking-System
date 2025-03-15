import React, { useEffect, useState } from "react";
import api from "../../api/apiService";
import { Button, Form, Modal, Table, Space, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";

interface Columns {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface ManageTemplateProps {
  title: string;
  columns: Columns[];
  formItems?:
    | React.ReactElement
    | ((editingId: string | null) => React.ReactElement);
  apiEndpoint: string;
  mode?: "full" | "view-only" | "create-only" | "delete-only";
  dataSource?: any[];
  setDataSource?: React.Dispatch<React.SetStateAction<any[]>>;
}

function ManageTemplate({
  columns,
  title,
  formItems,
  apiEndpoint,
  mode = "full",
  dataSource: externalDataSource,
  setDataSource: setExternalDataSource,
}: ManageTemplateProps) {
  const { token } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Bắt đầu với false để tránh vòng xoay ban đầu
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) {
      message.error("Authentication required. Please log in.");
      setLoading(false); // Dừng loading nếu không có token
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching data from:", apiEndpoint);
      console.log("Using token:", token);
      const res = await api.get(apiEndpoint, {
        headers: { "x-auth-token": token },
      });
      console.log("API Response:", res.data);

      const responseData = Array.isArray(res.data)
        ? res.data
        : res.data.data
        ? res.data.data
        : [];
      console.log("Processed Data:", responseData);

      setData(responseData);
      if (setExternalDataSource) {
        setExternalDataSource(responseData);
      }
    } catch (error: any) {
      console.error("Fetch error:", error.response?.data || error.message);
      message.error(
        error.response?.data?.message || `Error fetching ${title}. Check console for details.`
      );
      setData([]);
      if (setExternalDataSource) {
        setExternalDataSource([]);
      }
    } finally {
      setLoading(false); // Đảm bảo loading dừng lại dù thành công hay thất bại
    }
  };

  useEffect(() => {
    if (externalDataSource !== undefined) {
      console.log("Using external data source:", externalDataSource);
      setData(externalDataSource);
      setLoading(false); // Dừng loading nếu dùng dữ liệu ngoài
    } else {
      fetchData();
    }
  }, [apiEndpoint, token, externalDataSource]); // Dependency rõ ràng

  const handleCreate = async (values: any) => {
    if (!token || mode === "view-only") return;
    try {
      console.log("Creating with data:", values);
      const response = await api.post(apiEndpoint, values, {
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
      });
      console.log("Create Response:", response.data);
      toast.success(`${title} created successfully`);
      form.resetFields();
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      console.error("Create error:", error.response?.data || error.message);
      message.error(error.response?.data?.message || `Error creating ${title}`);
    }
  };

  const handleEdit = async (values: any) => {
    if (!token || mode !== "full") return;
    try {
      console.log("Editing with data:", values);
      await api.put(`${apiEndpoint}/${editingId}`, values, {
        headers: { "x-auth-token": token },
      });
      toast.success(`${title} updated successfully`);
      form.resetFields();
      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      console.error("Edit error:", error.response?.data || error.message);
      message.error(error.response?.data?.message || `Error updating ${title}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || (mode !== "full" && mode !== "delete-only")) return;
    try {
      console.log("Deleting ID:", id);
      await api.delete(`${apiEndpoint}/${id}`, {
        headers: { "x-auth-token": token },
      });
      toast.success(`${title} deleted successfully`);
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error.response?.data || error.message);
      message.error(error.response?.data?.message || `Error deleting ${title}`);
    }
  };

  const startEdit = (record: any) => {
    if (mode !== "full") return;
    setEditingId(record._id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const columnsWithActions =
    mode === "full"
      ? [
          ...columns,
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => startEdit(record)}
                />
                <Popconfirm
                  title={`Are you sure you want to delete this ${title}?`}
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : mode === "delete-only"
      ? [
          ...columns,
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
              <Popconfirm
                title={`Are you sure you want to delete this ${title}?`}
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]
      : [...columns];

  return (
    <div style={{ padding: "24px" }}>
      <ToastContainer />
      {(mode === "full" || mode === "create-only") && (
        <Button
          type="primary"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setShowModal(true);
          }}
          style={{ marginBottom: "16px" }}
        >
          Create new {title}
        </Button>
      )}

      <Table
        columns={columnsWithActions}
        dataSource={data}
        loading={loading}
        rowKey="_id"
      />

      {mode !== "view-only" && formItems && (
        <Modal
          title={editingId ? `Edit ${title}` : `Create new ${title}`}
          open={showModal}
          onCancel={() => {
            setShowModal(false);
            setEditingId(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
        >
          <Form
            form={form}
            labelCol={{ span: 24 }}
            onFinish={editingId ? handleEdit : handleCreate}
          >
            {typeof formItems === "function" ? formItems(editingId) : formItems}
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default ManageTemplate;