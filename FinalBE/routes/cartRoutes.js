const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/", cartController.createCart);
router.get("/", cartController.getAllCarts);
router.get("/:cartID", cartController.getCartById);
router.put("/:cartID", cartController.updateCart);
router.delete("/:cartID", cartController.deleteCart);
router.put("/check-in/:cartID", cartController.checkInCart);
router.put("/check-out/:cartID", cartController.checkOutCart);

module.exports = router;