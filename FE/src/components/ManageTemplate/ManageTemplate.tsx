import React, { useEffect, useState } from "react";
import api from "../../api/apiService";
import { Button, Form, Modal, Table } from "antd";
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
}

function ManageTemplate({ columns, title, formItems }: ManageTemplateProps) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await api.get(
        "https://6628fc3354afcabd0737b74a.mockapi.io/User"
      );
      setUsers(res.data);
    } catch (error) {
      toast.error(`Erorr fetching ${title}`);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <Button
        onClick={() => {
          setShowModal(true);
        }}>
        Create new {title}
      </Button>
      <Table columns={columns} dataSource={users}></Table>

      <Modal
        open={showModal}
        footer={[
          <Button key='back' onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
        ]}>
        <Form labelCol={{ span: 24 }}>
          <Form.Item name='id' label='id' hidden></Form.Item>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
}

export default ManageTemplate;
