const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");

// API tạo đánh giá
router.post("/", ratingController.createRating);

// API lấy danh sách đánh giá
router.get("/", ratingController.getRatings);

// API lấy đánh giá theo ID
router.get("/:id", ratingController.getRatingById);

router.get("/service/:serviceName", ratingController.getRatingsByServiceName);

// API cập nhật đánh giá
router.put("/:id", ratingController.updateRating);

// API xóa đánh giá
router.delete("/:id", ratingController.deleteRating);

// 🔥 API kiểm tra xem người dùng đã đánh giá dịch vụ chưa
router.get("/check-review", ratingController.checkUserReview);
module.exports = router;
