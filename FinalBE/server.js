require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/auth");
const voucherRoutes = require("./routes/voucherRoutes");
const userRoutes = require("./routes/userRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const quizzRoutes = require("./routes/quizzRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const blogRoutes = require("./routes/blogRoutes");
const payOS = require("./utils/payos");

const app = express();

// ✅ Cấu hình CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://swp-391-skincare-booking-system.vercel.app",
  "https://pay.payos.vn",
  "https://famous-kodiak-delicate.ngrok-free.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public"))); // Đơn giản hóa, bỏ "/"

// ✅ Định tuyến API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/bookings", bookingRoutes); // Đổi "booking" thành "bookings" cho nhất quán
app.use("/api/quizzs", quizzRoutes); // Sửa "quizzs" thành "quizzes"
app.use("/api/blogs", blogRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/", webhookRoutes);

// ✅ Middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  if (err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS policy violation" });
  }
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

app.post("/create-payment-link", async (req, res) => {
  const YOUR_DOMAIN = process.env.CLIENT_URL || "http://localhost:3000/"; // 🔥 Sửa lỗi hardcode

  const body = {
    orderCode: Number(String(Date.now()).slice(-6)),
    amount: 5000,
    description: "Thanh toan don hang",
    returnUrl: `${YOUR_DOMAIN}/success.html`,
    cancelUrl: `${YOUR_DOMAIN}/cancel.html`,
  };

  try {
    const paymentLinkResponse = await payOS.createPaymentLink(body);
    res.redirect(paymentLinkResponse.checkoutUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// ✅ Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Route gốc
app.get("/", (req, res) => {
  res.send("Server is running!");
});