import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Table } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  StarOutlined,
  FireOutlined,
} from "@ant-design/icons";
import {
  calculateTotalBookings,
  calculateTotalUsers,
  calculateTotalSuccessfulPayments,
  calculateOverallAverageRating,
  calculateTotalBookingsByStatus,
} from "../../utils/utils";
import {
  getCarts,
  getPayments,
  getUsers,
  getRatings,
  getProducts,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Booking, Service } from "../../types/booking";

interface TopService {
  serviceName: string;
  bookingCount: number;
}

const AdminOverview: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    avgRating: 0,
    totalBookingsCheckedOutAndReviewed: 0,
  });
  const [topServices, setTopServices] = useState<TopService[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No token available, cannot call API");
        return;
      }

      try {
        const [
          userResponse,
          cartsResponse,
          paymentsResponse,
          ratingsResponse,
          servicesResponse,
        ] = await Promise.all([
          getUsers(token),
          getCarts(token),
          getPayments(token),
          getRatings(token),
          getProducts(token),
        ]);

        const users = Array.isArray(userResponse.data) ? userResponse.data : [];
        const carts = Array.isArray(cartsResponse.data.carts)
          ? cartsResponse.data.carts
          : Array.isArray(cartsResponse.data)
          ? cartsResponse.data
          : [];
        const payments = Array.isArray(paymentsResponse.data.data)
          ? paymentsResponse.data.data
          : [];
        const ratings = Array.isArray(ratingsResponse.data)
          ? ratingsResponse.data
          : [];
        const services = Array.isArray(servicesResponse.data)
          ? servicesResponse.data
          : [];

        const totalUsers = calculateTotalUsers(users);
        const totalBookings = calculateTotalBookings(carts);
        const totalPayments = calculateTotalSuccessfulPayments(payments);
        const avgRating = calculateOverallAverageRating(ratings);
        const totalBookingsCheckedOutAndReviewed =
          calculateTotalBookingsByStatus(carts, ["checked-out", "reviewed"]);

        const filteredCarts = carts.filter((cart: Booking) =>
          ["checked-out", "reviewed"].includes(cart.status)
        );

        const serviceCountMap = new Map<string, number>();
        filteredCarts.forEach((cart: Booking) => {
          if (cart.serviceName) {
            const count = serviceCountMap.get(cart.serviceName) || 0;
            serviceCountMap.set(cart.serviceName, count + 1);
          }
        });

        const topServicesData: TopService[] = Array.from(
          serviceCountMap.entries()
        )
          .map(([serviceName, bookingCount]) => ({
            serviceName,
            bookingCount,
          }))
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);

        setStats({
          totalUsers,
          totalBookings,
          totalPayments,
          avgRating,
          totalBookingsCheckedOutAndReviewed,
        });
        setTopServices(topServicesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Average Rating", value: stats.avgRating },
  ];

  const serviceColumns = [
    {
      title: "No.",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Booking Count",
      dataIndex: "bookingCount",
      key: "bookingCount",
      sorter: (a: TopService, b: TopService) => b.bookingCount - a.bookingCount,
      render: (count: number) => (
        <span style={{ fontWeight: "bold" }}>{count}</span>
      ),
    },
  ];

  const cardStyle = {
    height: "100%",
    width: "31.5vh",
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    textAlign: "center" as const,
  };

  return (
    <div style={{ width: "100%" }}>
      {loading ? (
        <Spin size='large' className='flex justify-center mt-8' />
      ) : (
        <>
          {/* Thống kê trên một hàng ngang với kích thước bằng nhau */}
          <Row gutter={[16, 16]} style={{ flexWrap: "nowrap" }}>
            <Col span={4.8}>
              <Card style={cardStyle}>
                <Statistic
                  title='Total Users'
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={4.8}>
              <Card style={cardStyle}>
                <Statistic
                  title='Total Bookings'
                  value={stats.totalBookings}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={4.8}>
              <Card style={cardStyle}>
                <Statistic
                  title='Successful Payments'
                  value={stats.totalPayments}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
            <Col span={4.8}>
              <Card style={cardStyle}>
                <Statistic
                  title='Average Rating'
                  value={stats.avgRating}
                  prefix={<StarOutlined />}
                  suffix='/5'
                  precision={1}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col span={4.8}>
              <Card style={cardStyle}>
                <Statistic
                  title='Completed & Reviewed'
                  value={stats.totalBookingsCheckedOutAndReviewed}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ và bảng như bố cục ban đầu */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} lg={12}>
              <Card title='Overview Statistics' style={{ height: "100%" }}>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='value' fill='#8884d8' barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <>
                    <FireOutlined
                      style={{ color: "#ff4d4f", marginRight: 8 }}
                    />
                    Top Booked Services
                  </>
                }
                style={{ height: "100%" }}>
                <Table
                  columns={serviceColumns}
                  dataSource={topServices}
                  rowKey='serviceName'
                  pagination={false}
                  size='middle'
                  bordered
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
