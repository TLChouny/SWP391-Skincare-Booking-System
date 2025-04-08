const mongoose = require("mongoose");

const quizzSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      points: {
        type: Map,
        of: {
          type: Number,
          default: 0,
        },
      },
    },
  ],
});

// Middleware to ensure `points` is populated with all category names
quizzSchema.pre("save", async function (next) {
  const quizz = this;

  // Fetch all categories from the Category collection
  const Category = mongoose.model("Category");
  const categories = await Category.find({}, "name").lean();
  const categoryNames = categories.map((category) => category.name);

  // For each option in the quiz, ensure the `points` Map has all category names
  for (let option of quizz.options) {
    if (!option.points) {
      option.points = new Map();
    }

    // Set default points (0) for each category if not already set
    for (let categoryName of categoryNames) {
      if (!option.points.has(categoryName)) {
        option.points.set(categoryName, 0);
      }
    }

    // Optional: Remove any points keys that are not in the Category collection
    for (let key of option.points.keys()) {
      if (!categoryNames.includes(key)) {
        option.points.delete(key);
      }
    }
  }

  next();
});

module.exports = mongoose.model("Quizz", quizzSchema);