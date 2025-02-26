import React from 'react';
import { Card, Row, Col, Statistic, Table, Progress } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';

const AdminOverview: React.FC = () => {
  
  const stats = {
    totalUsers: 1234,
    totalBookings: 456,
    totalRevenue: 78900,
    avgRating: 4.8
  };

 
  const recentBookings = [
    {
      key: '1',
      customer: 'Nguyễn Văn A',
      service: 'Massage body',
      date: '2024-03-20',
      status: 'Confirmed',
      amount: 500000
    },
    {
      key: '2',
      customer: 'Trần Thị B',
      service: 'Facial Treatment',
      date: '2024-03-20',
      status: 'Completed',
      amount: 800000
    },
    // Thêm dữ liệu mẫu khác...
  ];

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString()}đ`
    },
  ];

  // Mock data cho top dịch vụ
  const topServices = [
    { name: 'Massage body', bookings: 145, progress: 85 },
    { name: 'Facial Treatment', bookings: 120, progress: 75 },
    { name: 'Skin Care', bookings: 98, progress: 60 },
    { name: 'Nail Care', bookings: 75, progress: 45 },
  ];

  return (
    <div >
     
      
      
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lịch hẹn"
              value={stats.totalBookings}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={stats.avgRating}
              prefix={<StarOutlined />}
              precision={1}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
      
        <Col span={16}>
          <Card title="Lịch hẹn gần đây" className="mb-6">
            <Table 
              columns={columns} 
              dataSource={recentBookings}
              pagination={false}
            />
          </Card>
        </Col>

        {/* Top dịch vụ */}
        <Col span={8}>
          <Card title="Top dịch vụ được đặt">
            {topServices.map(service => (
              <div key={service.name} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>{service.name}</span>
                  <span>{service.bookings} bookings</span>
                </div>
                <Progress percent={service.progress} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOverview; 