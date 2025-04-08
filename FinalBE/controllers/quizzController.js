const Quizz = require("../models/Quizz"); // Đổi từ Question thành Quiz
const Category = require("../models/Category");

// Lấy tất cả quiz
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quizz.find().lean();
    res.json(quizzes);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách quizz:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách quizz!", error: err.message });
  }
};

// Thêm một hoặc nhiều quizz
const createQuizz = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ hoặc rỗng!" });
    }

    const categories = await Category.find({}, "name").lean();
    const categoryNames = categories.map((category) => category.name);

    if (categoryNames.length === 0) {
      return res.status(400).json({ message: "Không có danh mục nào trong hệ thống. Vui lòng thêm danh mục trước!" });
    }

    let quizzesToInsert = [];

    const validatePoints = (points) => {
      if (!(points instanceof Map)) {
        points = new Map(Object.entries(points));
      }
      for (let key of points.keys()) {
        const found = categoryNames.some((categoryName) => categoryName.toLowerCase() === key.toLowerCase());
        if (!found) {
          throw new Error(`Danh mục không hợp lệ: ${key}`);
        }
        const matchingCategory = categoryNames.find((categoryName) => categoryName.toLowerCase() === key.toLowerCase());
        if (matchingCategory && matchingCategory !== key) {
          const value = points.get(key);
          points.delete(key);
          points.set(matchingCategory, value);
        }
      }
      return points;
    };

    if (Array.isArray(data)) {
      quizzesToInsert = data.map((q) => {
        if (!q.text || !Array.isArray(q.options)) {
          throw new Error("Một hoặc nhiều quizz không hợp lệ!");
        }
        q.options = q.options.map((option) => {
          if (option.points) {
            option.points = validatePoints(option.points);
          }
          return option;
        });
        return new Quizz(q);
      });
    } else {
      if (!data.text || !Array.isArray(data.options)) {
        return res.status(400).json({ message: "Dữ liệu quizz không hợp lệ!" });
      }
      data.options = data.options.map((option) => {
        if (option.points) {
          option.points = validatePoints(option.points);
        }
        return option;
      });
      quizzesToInsert.push(new Quizz(data));
    }

    const savedQuizzes = await Quizz.insertMany(quizzesToInsert);
    res.status(201).json(savedQuizzes);
  } catch (err) {
    console.error("Lỗi khi thêm quizz:", err);
    res.status(400).json({ message: err.message || "Lỗi khi lưu quiz!", error: err.message });
  }
};

// Cập nhật một quizz
const updateQuizz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || !updateData.text || !Array.isArray(updateData.options)) {
      return res.status(400).json({ message: "Dữ liệu cập nhật không hợp lệ!" });
    }

    const categories = await Category.find({}, "name").lean();
    const categoryNames = categories.map((category) => category.name);

    if (categoryNames.length === 0) {
      return res.status(400).json({ message: "Không có danh mục nào trong hệ thống. Vui lòng thêm danh mục trước!" });
    }

    const validatePoints = (points) => {
      if (!(points instanceof Map)) {
        points = new Map(Object.entries(points));
      }
      for (let key of points.keys()) {
        const found = categoryNames.some((categoryName) => categoryName.toLowerCase() === key.toLowerCase());
        if (!found) {
          throw new Error(`Danh mục không hợp lệ: ${key}`);
        }
        const matchingCategory = categoryNames.find((categoryName) => categoryName.toLowerCase() === key.toLowerCase());
        if (matchingCategory && matchingCategory !== key) {
          const value = points.get(key);
          points.delete(key);
          points.set(matchingCategory, value);
        }
      }
      return points;
    };

    updateData.options = updateData.options.map((option) => {
      if (option.points) {
        option.points = validatePoints(option.points);
      }
      return option;
    });

    const updatedQuizz = await Quizz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuizz) {
      return res.status(404).json({ message: "Quizz không tồn tại!" });
    }

    res.json(updatedQuizz);
  } catch (err) {
    console.error("Lỗi khi cập nhật quizz:", err);
    res.status(400).json({ message: err.message || "Lỗi server!", error: err.message });
  }
};

// Xóa một quizz
const deleteQuizz = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuizz = await Quizz.findByIdAndDelete(id);

    if (!deletedQuizz) {
      return res.status(404).json({ message: "Quizz không tồn tại!" });
    }

    res.json({ message: "Quizz đã được xóa thành công!" });
  } catch (err) {
    console.error("Lỗi khi xóa quizz:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Nhận câu trả lời từ người dùng
const submitQuizzAnswers = async (req, res) => {
  console.log("Request received:", req.body);
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Danh sách câu trả lời không hợp lệ!" });
    }

    const categories = await Category.find({}, "name").lean();
    const categoryNames = categories.map((category) => category.name);

    if (categoryNames.length === 0) {
      return res.status(400).json({ message: "Không có danh mục nào trong hệ thống. Vui lòng thêm danh mục trước!" });
    }

    let scores = {};
    categoryNames.forEach((category) => {
      scores[category] = 0;
    });

    for (let answer of answers) {
      const { quizzId, selectedOptionIndex } = answer;

      if (!quizzId || selectedOptionIndex === undefined) {
        return res.status(400).json({ message: "Dữ liệu câu trả lời không hợp lệ!" });
      }

      const quizz = await Quizz.findById(quizzId).lean();
      if (!quizz) {
        return res.status(404).json({ message: `Quizz với ID ${quizzId} không tồn tại!` });
      }

      const selectedOption = quizz.options[selectedOptionIndex];
      if (!selectedOption || !selectedOption.points) {
        return res.status(400).json({ message: "Lựa chọn không hợp lệ!" });
      }

      for (let [category, points] of Object.entries(selectedOption.points)) {
        if (scores.hasOwnProperty(category)) {
          scores[category] += points;
        }
      }
    }

    let bestMatch = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    res.json({
      message: "Quizz completed!",
      scores,
      bestMatch,
    });
  } catch (err) {
    console.error("Lỗi khi xử lý bài kiểm tra quizz:", err);
    res.status(500).json({ message: "Lỗi server khi xử lý bài kiểm tra quizz!", error: err.message });
  }
};

module.exports = {
  getAllQuizzes,
  createQuizz,
  updateQuizz,
  deleteQuizz,
  submitQuizzAnswers,
};