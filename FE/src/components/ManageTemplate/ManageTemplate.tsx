
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
  formItems?: React.ReactElement | ((editingId: string | null) => React.ReactElement);
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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) {
      message.error("Authentication required. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(apiEndpoint, {
        headers: { "x-auth-token": token },
      });
      const responseData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setData(responseData);
      if (setExternalDataSource) setExternalDataSource(responseData);
    } catch (error: any) {
      message.error(error.response?.data?.message || `Error fetching ${title}`);
      setData([]);
      if (setExternalDataSource) setExternalDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (externalDataSource !== undefined) {
      setData(externalDataSource);
      setLoading(false);
    } else {
      fetchData().then(() => {
        if (!isMounted) return;
      });
    }
    return () => {
      isMounted = false;
    };
  }, [apiEndpoint, token, externalDataSource]);

  const handleCreate = async (values: any) => {
    if (!token || mode === "view-only") {
      message.error("Authentication required. Please log in.");
      return;
    }
    setLoading(true); // Bật loading để thông báo đang xử lý
    try {
      const response = await api.post(apiEndpoint, values, {
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
      });
      console.log("Create Response:", response.data); // Debug dữ liệu trả về
      if (typeof window !== "undefined") { // Hiển thị toast trong trình duyệt
        toast.success(`${title} created successfully`);
      }
      form.resetFields();
      setShowModal(false);
      fetchData();
      toast.success('Create account successfully')
    } catch (error: any) {
      console.error("Create Error:", error.response?.data || error); // Debug lỗi
      message.error(error.response?.data?.message || `Error creating ${title}`);
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  const handleEdit = async (values: any) => {
    if (!token || mode !== "full") {
      message.error("Authentication required. Please log in.");
      return;
    }
    try {
      await api.put(`${apiEndpoint}/${editingId}`, values, {
        headers: { "x-auth-token": token },
      });
      if (typeof window !== "undefined") {
        toast.success(`${title} updated successfully`);
      }
      form.resetFields();
      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || `Error updating ${title}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || (mode !== "full" && mode !== "delete-only")) {
      message.error("Authentication required. Please log in.");
      return;
    }
    try {
      await api.delete(`${apiEndpoint}/${id}`, {
        headers: { "x-auth-token": token },
      });
      if (typeof window !== "undefined") {
        toast.success(`${title} deleted successfully`);
      }
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || `Error deleting ${title}`);
    }
  };

  const startEdit = (record: any) => {
    if (mode !== "full" || !record._id) return;
    setEditingId(record._id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const columnsWithActions =
    mode === "full" || mode === "delete-only"
      ? [
          ...columns,
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
              <Space>
                {mode === "full" && record._id && (
                  <Button type="link" icon={<EditOutlined />} onClick={() => startEdit(record)} />
                )}
                {record._id && (
                  <Popconfirm
                    title={`Are you sure you want to delete this ${title}?`}
                    onConfirm={() => handleDelete(record._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : [...columns];

  return (
    <div style={{ padding: "24px" }}>
      {typeof window !== "undefined" && <ToastContainer />}
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
      <Table columns={columnsWithActions} dataSource={data} loading={loading} rowKey="_id" />
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
          <Form form={form} labelCol={{ span: 24 }} onFinish={editingId ? handleEdit : handleCreate}>
            {typeof formItems === "function" ? formItems(editingId) : formItems}
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default ManageTemplate;