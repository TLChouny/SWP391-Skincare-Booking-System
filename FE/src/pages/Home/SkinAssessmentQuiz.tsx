import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Radio, message, Card, Steps } from "antd";
import Layout from "../../layout/Layout";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Quizz, QuizzResult } from "../../types/booking";

const { Step } = Steps;

const SkinAssessmentQuizz: React.FC = () => {
  const [quizzs, setQuizzs] = useState<Quizz[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [current, setCurrent] = useState<number>(0);
  const [result, setResult] = useState<QuizzResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { token, isAuthenticated, setToken, setUser } = useAuth(); // Thêm setToken, setUser để xử lý đăng xuất
  const navigate = useNavigate();

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    console.log("Token in Quizz:", token);
    console.log("Is Authenticated:", isAuthenticated);
    if (isAuthenticated && token) {
     

 fetchQuizzs();
    } else {
      message.error("Vui lòng đăng nhập để thực hiện bài kiểm tra da!");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [isAuthenticated, token, navigate]);

  const fetchQuizzs = async () => {
    if (!token) {
      message.error("Token không hợp lệ, vui lòng đăng nhập lại!");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/quizzs`, {
        headers: {
          "x-auth-token": token, // Sử dụng header x-auth-token
        },
      });
      const formattedQuizzs: Quizz[] = response.data.map((q: any) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((opt: any) => ({
          text: opt.text,
          points: opt.points,
        })),
        createdAt: q.createdAt,
      }));
      setQuizzs(formattedQuizzs);
    } catch (error: any) {
      console.error("Error fetching quizzs:", error.response?.status, error.response?.data);
      message.error(
        error.response?.data?.msg || "Không thể tải câu hỏi, vui lòng thử lại sau."
      );
      if (error.response?.status === 401) {
        // Xử lý trường hợp token không hợp lệ hoặc đã đăng xuất
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login");
      }
    }
  };

  const handleAnswerChange = (quizzId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [quizzId]: answer }));
  };

  const handleNext = () => {
    if (answers[quizzs[current]._id]) {
      setCurrent(current + 1);
    } else {
      message.warning("Vui lòng chọn một đáp án trước khi tiếp tục!");
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !token) {
      message.error("Vui lòng đăng nhập để gửi bài kiểm tra!");
      navigate("/login");
      return;
    }

    const allAnswered = quizzs.every((quizz) => answers[quizz._id]);
    if (!allAnswered) {
      message.warning("Vui lòng trả lời tất cả các câu hỏi trước khi hoàn thành!");
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([quizzId, answer]) => {
        const quizz = quizzs.find((q) => q._id === quizzId);
        return {
          quizzId,
          selectedOptionIndex: quizz
            ? quizz.options.findIndex((opt) => opt.text === answer)
            : -1,
        };
      });

      if (formattedAnswers.some((ans) => ans.selectedOptionIndex === -1)) {
        message.error("Có câu trả lời không hợp lệ. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      console.log("Token before submit:", token);
      console.log("Submitting answers:", formattedAnswers);

      const response = await axios.post(
        `${API_BASE_URL}/quizzs/submit`,
        { answers: formattedAnswers },
        {
          headers: {
            "x-auth-token": token, // Sử dụng header x-auth-token
          },
        }
      );

      console.log("Response from server:", response.data);

      setResult({
        message: response.data.message || "Kết quả đã được gửi thành công.",
        scores: response.data.scores,
        bestMatch: response.data.bestMatch || "Không có kết quả phù hợp.",
      });
    } catch (error: any) {
      console.error("Error submitting quizz:", error.response?.status, error.response?.data);
      message.error(
        error.response?.data?.msg || "Gửi bài kiểm tra thất bại, vui lòng thử lại."
      );
      if (error.response?.status === 401) {
        // Xử lý trường hợp token không hợp lệ hoặc đã đăng xuất
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBestMatchClick = () => {
    if (result?.bestMatch && result.bestMatch !== "Không có kết quả phù hợp.") {
      navigate(`/services?category=${result.bestMatch.toLowerCase()}`);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const isCurrentAnswered = !!answers[quizzs[current]?._id];

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-gradient-to-r from-yellow-100 to-blue-200 flex flex-col justify-center items-center">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Vui lòng đăng nhập
          </motion.h1>
          <p className="text-lg text-gray-700">
            Bạn cần đăng nhập để thực hiện bài kiểm tra da.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gradient-to-r from-yellow-100 to-blue-200 flex flex-col">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide pt-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skin Assessment Quizz
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-white-400 rounded mx-auto"></div>
        </motion.h1>

        <div className="px-4 sm:px-8 md:px-16 lg:px-24 flex-1 flex flex-col">
          <Steps
            current={current}
            onChange={(newCurrent) => {
              if (newCurrent <= current || answers[quizzs[current]?._id]) {
                setCurrent(newCurrent);
              } else {
                message.warning("Vui lòng trả lời câu hỏi hiện tại trước!");
              }
            }}
            className="mb-6 max-w-3xl mx-auto"
          >
            {quizzs.map((_, index) => (
              <Step key={index} />
            ))}
          </Steps>

          {quizzs[current] && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card
                title={
                  <span className="font-medium text-2xl">
                    {quizzs[current].text}
                  </span>
                }
                bordered={false}
                className="shadow-lg mb-6 p-6 bg-white rounded-lg transition-all max-w-3xl mx-auto"
              >
                <Radio.Group
                  onChange={(e) =>
                    handleAnswerChange(quizzs[current]._id, e.target.value)
                  }
                  value={answers[quizzs[current]._id]}
                  className="w-full"
                >
                  {quizzs[current].options.map((option, index) => (
                    <Radio
                      key={index}
                      value={option.text}
                      className="block text-xl my-4 p-4 hover:bg-blue-100 rounded-lg transition-all ease-in-out duration-300"
                    >
                      {option.text}
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
                  {current === quizzs.length - 1 ? (
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
                title="Kết quả"
                bordered={false}
                className="shadow-lg mb-6 p-6 bg-white rounded-lg max-w-3xl mx-auto"
              >
                <p className="text-2xl text-green-600 font-semibold">
                  {result.message}
                </p>
                <div className="mt-4">
                  <h4 className="text-xl font-medium">Điểm số của bạn:</h4>
                  <ul className="list-disc pl-5 mt-2">
                    {Object.entries(result.scores).map(([category, score]) => (
                      <li key={category} className="text-lg text-gray-700">
                        {category}: {score}
                      </li>
                    ))}
                  </ul>
                </div>
                {result.bestMatch && (
                  <div className="mt-4">
                    <h4 className="text-xl font-medium">Phù hợp nhất:</h4>
                    <p
                      className={`text-lg ${
                        result.bestMatch !== "Không có kết quả phù hợp."
                          ? "text-blue-600 cursor-pointer hover:underline"
                          : "text-gray-600"
                      }`}
                      onClick={handleBestMatchClick}
                    >
                      {result.bestMatch}
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

export default SkinAssessmentQuizz;