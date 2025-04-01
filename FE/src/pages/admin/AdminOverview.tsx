import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Table, Tag } from "antd";
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
  ClockCircleOutlined,
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
import { Booking } from "../../types/booking";

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
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No token available, cannot call API");
        return;
      }

      try {
        const [userResponse, cartsResponse, paymentsResponse, ratingsResponse] =
          await Promise.all([
            getUsers(token),
            getCarts(token),
            getPayments(token),
            getRatings(token),
            getProducts(token),
          ]);

        const carts = Array.isArray(cartsResponse.data.carts)
          ? cartsResponse.data.carts
          : Array.isArray(cartsResponse.data)
          ? cartsResponse.data
          : [];

        // Chuẩn hóa dữ liệu
        const normalizedCarts = carts.map((cart: any) => ({
          ...cart,
          CartID: cart.CartID || cart.BookingID || cart._id,
          startTime: cart.startTime || cart.start_time || null,
          endTime: cart.endTime || cart.end_time || null,
          bookingDate: cart.bookingDate || cart.createdAt || null,
          totalPrice: cart.totalPrice || cart.originalPrice || 0,
          Skincare_staff:
            cart.Skincare_staff || cart.selectedTherapist?.name || null,
        }));

        const sortedCarts = [...normalizedCarts].sort((a, b) => {
          const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
          const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
          return dateB - dateA;
        });

        setRecentBookings(sortedCarts);

        const filteredCarts = normalizedCarts.filter((cart: Booking) =>
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
          totalUsers: calculateTotalUsers(userResponse.data),
          totalBookings: calculateTotalBookings(normalizedCarts),
          totalPayments: calculateTotalSuccessfulPayments(
            paymentsResponse.data.data || []
          ),
          avgRating: calculateOverallAverageRating(ratingsResponse.data),
          totalBookingsCheckedOutAndReviewed: calculateTotalBookingsByStatus(
            normalizedCarts,
            ["checked-out", "reviewed"]
          ),
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

  const formatPriceDisplay = (
    originalPrice: number,
    discountedPrice?: number | null
  ) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            textDecoration: discountedPrice != null ? "line-through" : "none",
            color: discountedPrice != null ? "#6b7280" : "#1f2937",
            fontWeight: 500,
          }}>
          {originalPrice.toLocaleString("vi-VN")} VND
        </span>
        {discountedPrice != null && (
          <span style={{ color: "#16a34a", fontWeight: 600 }}>
            {discountedPrice.toLocaleString("vi-VN")} VND
          </span>
        )}
      </div>
    );
  };

  const formatDateTime = (dateInput: string | number | undefined) => {
    if (!dateInput) return "N/A";
    const date =
      typeof dateInput === "number" ? new Date(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      if (typeof dateInput === "string") {
        // Xử lý định dạng ngày đầy đủ
        const dateOnlyParts = dateInput.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnlyParts) {
          const [_, year, month, day] = dateOnlyParts;
          return `${day}/${month}/${year}`; // Chỉ hiển thị ngày, không kèm giờ
        }
      }
      return "N/A";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Chỉ hiển thị ngày, không kèm giờ
  };

  const formatTimeOnly = (
    timeInput: string | undefined,
    dateInput?: string | number
  ) => {
    if (!timeInput) return "N/A";

    // Kiểm tra định dạng giờ (HH:mm)
    const timeParts = timeInput.match(/(\d{2}):(\d{2})/);
    if (timeParts) {
      const [_, hours, minutes] = timeParts;
      // Nếu có ngày đi kèm, kết hợp ngày và giờ
      if (dateInput) {
        const date =
          typeof dateInput === "number"
            ? new Date(dateInput)
            : new Date(dateInput);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
      }
      // Nếu không có ngày, chỉ hiển thị giờ
      return `${hours}:${minutes}`;
    }

    return "N/A";
  };

  const recentBookingColumns = [
    {
      title: "Booking ID",
      dataIndex: "BookingID",
      key: "BookingID",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text || "N/A"}</span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Therapist Name",
      dataIndex: "Skincare_staff",
      key: "Skincare_staff",
      render: (text: string) => text || "Not assigned",
    },
    {
      title: "Price",
      key: "price",
      render: (record: Booking) =>
        formatPriceDisplay(record.totalPrice || 0, record.discountedPrice),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "pending") color = "orange";
        if (status === "checked-in") color = "blue";
        if (status === "completed") color = "green";
        if (status === "checked-out") color = "purple";
        if (status === "cancel") color = "red";
        if (status === "reviewed") color = "volcano";
        return <Tag color={color}>{status ? status.toUpperCase() : "N/A"}</Tag>;
      },
    },
    {
      title: "Booking Time",
      key: "bookingTime",
      render: (record: Booking) => (
        <div>
          <div>
            <strong>Date:</strong> {formatDateTime(record.bookingDate)}
          </div>
          <div>
            <strong>StartTime:</strong> {formatTimeOnly(record.startTime)}
          </div>
          <div>
            <strong>EndTime:</strong> {formatTimeOnly(record.endTime)}
          </div>
        </div>
      ),
      sorter: (a: Booking, b: Booking) => {
        const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
        const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
        return dateA - dateB;
      },
    },
  ];

  const cardStyle = {
    height: "100%",
    width: "30vh",
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

          {/* Bảng booking gần đây */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col span={24}>
              <Card
                title={
                  <>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    Recent Bookings
                  </>
                }>
                <Table
                  columns={recentBookingColumns}
                  dataSource={recentBookings}
                  rowKey={(record) =>
                    record.BookingID || Math.random().toString()
                  }
                  pagination={{ pageSize: 5 }}
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
