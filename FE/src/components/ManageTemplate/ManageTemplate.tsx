import type React from "react";
import { useState } from "react";
import { Table, Button, Modal, Form, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của react-toastify

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://luluspa-production.up.railway.app/api";

interface ManageTemplateProps {
  title: string;
  columns: any[];
  dataSource: any[];
  formItems: (editingId: string | null) => React.ReactNode;
  apiEndpoint: string;
  mode?: "full" | "readonly";
  filterControls?: React.ReactNode;
  onUpdateSuccess?: () => void;
  setDataSource?: React.Dispatch<React.SetStateAction<any[]>>;
}

function ManageTemplate({
  title,
  columns,
  dataSource,
  formItems,
  apiEndpoint,
  mode = "full",
  filterControls,
  onUpdateSuccess,
  setDataSource,
}: ManageTemplateProps) {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = (record?: any) => {
    setIsModalVisible(true);
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      if (editingId) {
        await axios.put(`${API_URL}${apiEndpoint}/${editingId}`, values, {
          headers: { "x-auth-token": token },
        });
        toast.success(`${title} updated successfully!`, {
          position: "top-right",
          autoClose: 3000, // Tự động đóng sau 3 giây
        });
      } else {
        await axios.post(`${API_URL}${apiEndpoint}`, values, {
          headers: { "x-auth-token": token },
        });
        toast.success(`${title} created successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error: any) {
      console.error("Form submission error:", error.response?.data || error);
      toast.error(error.response?.data?.message || `Failed to save ${title}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const toastId = toast.loading("Deleting..."); // Hiển thị toast loading
      await axios.delete(`${API_URL}${apiEndpoint}/${id}`, {
        headers: { "x-auth-token": token },
      });
      toast.update(toastId, {
        render: `${title} deleted successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error: any) {
      console.error("Delete error:", error.response?.data || error);
      toast.error(error.response?.data?.message || `Failed to delete ${title}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const actionColumn = {
    title: "Actions",
    key: "actions",
    render: (text: string, record: any) => (
      <Space>
        <Popconfirm
          title={`Are you sure you want to edit this ${title}?`}
          onConfirm={() => showModal(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button icon={<EditOutlined />} type="link" ghost />
        </Popconfirm>
        <Popconfirm
          title={`Are you sure you want to delete this ${title}?`}
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Button icon={<DeleteOutlined />} type="link" danger />
        </Popconfirm>
      </Space>
    ),
  };

  const tableColumns = mode === "full" ? [...columns, actionColumn] : columns;

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer /> {/* Thêm ToastContainer để hiển thị toast */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {mode === "full" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add {title}
            </Button>
          )}
          {filterControls}
        </div>
      </div>

      <Table
        columns={tableColumns}
        dataSource={dataSource.map((item) => ({ ...item, key: item._id }))}
        rowKey="_id"
        bordered
      />

      <Modal
        title={editingId ? `Edit ${title}` : `Add ${title}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          {formItems(editingId)}
        </Form>
      </Modal>
    </div>
  );
}

export default ManageTemplate;