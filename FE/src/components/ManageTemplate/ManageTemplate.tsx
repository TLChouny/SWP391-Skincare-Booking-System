import React, { useEffect, useState } from "react";
import api from "../../api/apiService";
import { Button, Form, Modal, Table, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";

interface Columns {
  title: string;
  dataIndex: string;
  key: string;
}

interface ManageTemplateProps {
  title: string;
  columns: Columns[];
  formItems: React.ReactElement;
  apiEndpoint: string;
}

function ManageTemplate({
  columns,
  title,
  formItems,
  apiEndpoint,
}: ManageTemplateProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(apiEndpoint);
      setData(res.data);
    } catch (error) {
      toast.error(`Error fetching ${title}`);
    } finally {   
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);

  const handleCreate = async (values: any) => {
    try {
      await api.post(apiEndpoint, values);
      toast.success(`${title} created successfully`);
      form.resetFields();
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(`Error creating ${title}`);
    }
  };

  const handleEdit = async (values: any) => {
    try {
      await api.put(`${apiEndpoint}/${editingId}`, values);
      toast.success(`${title} updated successfully`);
      form.resetFields();
      setShowModal(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(`Error updating ${title}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`${apiEndpoint}/${id}`);
      toast.success(`${title} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Error deleting ${title}`);
    }
  };

  const startEdit = (record: any) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  // Add action column to the columns
  const columnsWithActions = [
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: any) => (
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
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        type="primary" 
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setShowModal(true);
        }}
        style={{ marginBottom: '16px' }}
      >
        Create new {title}
      </Button>

      <Table 
        columns={columnsWithActions} 
        dataSource={data}
        loading={loading}
        rowKey="_id"
      />

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
          {formItems}
        </Form>
      </Modal>
    </div>
  );
}

export default ManageTemplate;
