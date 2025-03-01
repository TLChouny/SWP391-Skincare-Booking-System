// Nhận câu trả lời từ người dùng
router.post("/submit", async (req, res) => {
    console.log("Request received:", req.body);
    try {
      const { answers } = req.body;
  
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: "Danh sách câu trả lời không hợp lệ!" });
      }
  
      let skinScores = { dry: 0, oily: 0, sensitive: 0, aging: 0, acne: 0 };
  
      for (let answer of answers) {
        const { questionId, selectedOptionIndex } = answer;
  
        if (!questionId || selectedOptionIndex === undefined) {
          return res.status(400).json({ message: "Dữ liệu câu trả lời không hợp lệ!" });
        }
  
        const question = await Question.findById(questionId).lean();
        if (!question) {
          return res.status(404).json({ message: `Câu hỏi với ID ${questionId} không tồn tại!` });
        }
  
        const selectedOption = question.options[selectedOptionIndex];
        if (!selectedOption || !selectedOption.points) {
          return res.status(400).json({ message: "Lựa chọn không hợp lệ!" });
        }
  
        for (let skinType in selectedOption.points) {
          if (skinScores.hasOwnProperty(skinType)) {
            skinScores[skinType] += selectedOption.points[skinType];
          }
        }
      }
  
      let bestSkinType = Object.keys(skinScores).reduce((a, b) => (skinScores[a] > skinScores[b] ? a : b));
      res.json({
        message: "Bài kiểm tra hoàn thành!",
        scores: skinScores,
        bestMatch: bestSkinType
      });
    } catch (err) {
      console.error("Lỗi khi xử lý bài kiểm tra:", err);
      res.status(500).json({ message: "Lỗi server!" });
    }
  });
  