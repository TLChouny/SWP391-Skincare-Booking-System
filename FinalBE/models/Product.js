const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    service_id: { type: Number, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true }, 
    duration: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: String, default: "" },
    vouchers: [{ // Thêm field vouchers
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    }],
    discountedPrice: { type: Number, default: null },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ProductSchema.pre("save", async function (next) {
  if (this.isModified("vouchers")) {
    const vouchers = await mongoose.model("Voucher").find({ _id: { $in: this.vouchers } });
    console.log("Vouchers:", vouchers);
    const highestDiscount = vouchers.length > 0
      ? Math.max(...vouchers.map((v) => v.discountPercentage || 0))
      : 0;
    console.log("Highest Discount:", highestDiscount);
    this.discountedPrice = highestDiscount > 0
      ? this.price - (this.price * highestDiscount) / 100
      : null;
    console.log("Updated discountedPrice:", this.discountedPrice);
  }
  this.updateDate = new Date();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);