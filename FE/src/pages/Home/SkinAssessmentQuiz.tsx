import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Radio, message, Card, Steps } from "antd";
import Layout from "../../layout/Layout";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng

const { Step } = Steps;

interface Question {
  id: number;
  question: string;
  options: string[];
}

const SkinAssessmentQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [bestMatch, setBestMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    const fetchQuestions = async () => {
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      try {
        const response = await axios.get(`${API_BASE_URL}/questions`);
        const formattedQuestions = response.data.map((q: any) => ({
          id: q._id,
          question: q.text,
          options: q.options.map((opt: any) => opt.text),
        }));
        setQuestions(formattedQuestions);
      } catch (error) {
        message.error("Không thể tải câu hỏi, vui lòng thử lại sau.");
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (answers[questions[current].id]) {
      setCurrent(current + 1);
    } else {
      message.warning("Vui lòng chọn một đáp án trước khi tiếp tục!");
    }
  };

  const handleSubmit = async () => {
    const allAnswered = questions.every((question) => answers[question.id]);
    if (!allAnswered) {
      message.warning("Vui lòng trả lời tất cả các câu hỏi trước khi hoàn thành!");
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => {
          const question = questions.find((q) => q.id.toString() === questionId);
          return {
            questionId: questionId,
            selectedOptionIndex: question
              ? question.options.indexOf(answer)
              : -1,
          };
        }
      );

      if (formattedAnswers.some((ans) => ans.selectedOptionIndex === -1)) {
        message.error("Có câu trả lời không hợp lệ. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "https://luluspa-production.up.railway.app/api";

      const response = await axios.post(`${API_BASE_URL}/questions/submit`, {
        answers: formattedAnswers,
      });

      setResult(response.data.message || "Kết quả đã được gửi thành công.");
      setBestMatch(response.data.bestMatch || "Không có kết quả phù hợp.");
    } catch (error) {
      message.error("Gửi bài kiểm tra thất bại, vui lòng thử lại.");
    }
    setLoading(false);
  };

  // Hàm xử lý khi nhấn vào Best Match
  const handleBestMatchClick = () => {
    if (bestMatch && bestMatch !== "Không có kết quả phù hợp.") {
      navigate(`/services?category=${bestMatch.toLowerCase()}`);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const isCurrentAnswered = !!answers[questions[current]?.id];

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gradient-to-r from-yellow-100 to-blue-200 flex flex-col">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide pt-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skin Assessment Test
        </motion.h1>

        <div className="px-4 sm:px-8 md:px-16 lg:px-24 flex-1 flex flex-col">
          <Steps
            current={current}
            onChange={(newCurrent) => {
              if (newCurrent <= current || answers[questions[current]?.id]) {
                setCurrent(newCurrent);
              } else {
                message.warning("Vui lòng trả lời câu hỏi hiện tại trước!");
              }
            }}
            className="mb-6 max-w-3xl mx-auto"
          >
            {questions.map((_, index) => (
              <Step key={index} />
            ))}
          </Steps>

          {questions[current] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card
                title={
                  <span className="font-medium text-2xl">
                    {questions[current].question}
                  </span>
                }
                bordered={false}
                className="shadow-lg mb-6 p-6 bg-white rounded-lg transition-all max-w-3xl mx-auto"
              >
                <Radio.Group
                  onChange={(e) =>
                    handleAnswerChange(questions[current].id, e.target.value)
                  }
                  value={answers[questions[current].id]}
                  className="w-full"
                >
                  {questions[current].options.map((option, index) => (
                    <Radio
                      key={index}
                      value={option}
                      className="block text-xl my-4 p-4 hover:bg-blue-100 rounded-lg transition-all ease-in-out duration-300"
                    >
                      {option}
                    </Radio>
                  ))}
                </Radio.Group>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="default"
                    onClick={() => setCurrent(Math.max(0, current - 1))}
                    className="px-8 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all duration-200"
                    disabled={current === 0}
                  >
                    Back
                  </Button>
                  {current === questions.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={!isCurrentAnswered}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400"
                    >
                      Finish
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={!isCurrentAnswered}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card
                title="Result"
                bordered={false}
                className="shadow-lg mb-6 p-6 bg-white rounded-lg max-w-3xl mx-auto"
              >
                <p className="text-2xl text-green-600 font-semibold">{result}</p>
                {bestMatch && (
                  <div className="mt-4">
                    <h4 className="text-xl font-medium">Best Match:</h4>
                    <p
                      className={`text-lg ${
                        bestMatch !== "Không có kết quả phù hợp."
                          ? "text-blue-600 cursor-pointer hover:underline"
                          : "text-gray-600"
                      }`}
                      onClick={handleBestMatchClick}
                    >
                      {bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1)}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SkinAssessmentQuiz;