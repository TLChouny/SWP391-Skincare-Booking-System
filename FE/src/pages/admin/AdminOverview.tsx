import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  calculateTotalBookings,
  calculateTotalUsers,
  calculateTotalSuccessfulPayments,
  calculateOverallAverageRating
} from "../../utils/utils";
import { getCarts, getPayments, getUsers, getRatings } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
export interface Cart {
  _id: string;
  status: string;
}
const AdminOverview: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    avgRating: 0,
  });


  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("Không có token, không thể gọi API");
        return;
      }

      try {
        const [userResponse, cartsResponse, paymentsResponse, ratingsResponse] = await Promise.all([
          getUsers(token),
          getCarts(token),
          getPayments(token),
          getRatings(token),
        ]);

        const users = Array.isArray(userResponse.data) ? userResponse.data : [];
        const carts = Array.isArray(cartsResponse.data.carts) ? cartsResponse.data.carts : [];
        const payments = Array.isArray(paymentsResponse.data.data)
          ? paymentsResponse.data.data
          : [];
          const ratings = Array.isArray(ratingsResponse.data)
          ? ratingsResponse.data
          : [];

          console.log("CARTS DATA:", carts);


        console.log("Dữ liệu payments:", paymentsResponse.data);
        console.log("Dữ liệu ratings:", ratingsResponse.data);
        console.log("Dữ liệu cart:", cartsResponse.data);


        const totalUsers = calculateTotalUsers(users);
        const totalBookings = calculateTotalBookings(carts);
        const totalPayments = calculateTotalSuccessfulPayments(payments);
        const avgRating = calculateOverallAverageRating(ratings);

        setStats({
          totalUsers: totalUsers,
          totalBookings: cartsResponse.status,
          // totalBookings: totalBookings,
          totalPayments: totalPayments,
          avgRating: avgRating,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div>
      {loading ? (
        <Spin size='large' className='flex justify-center mt-8' />
      ) : (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title='Tổng số người dùng'
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title='Tổng đơn hàng'
                value={stats.totalBookings}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title='Tổng thanh toán thành công'
                value={stats.totalPayments}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
         <Col span={6}>
  <Card>
    <Statistic
      title="Số sao trung bình"
      value={stats.avgRating}
      prefix={<StarOutlined />}
      suffix="/5"
      precision={1}
      valueStyle={{ color: "#faad14" }}
    />
  </Card>
</Col>

        </Row>
      )}
    </div>
  );
};

export default AdminOverview;
