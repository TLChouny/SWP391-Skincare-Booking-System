import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Radio, message, Card, Steps } from "antd";
import Layout from "../../layout/Layout";

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const API_BASE_URL = window.location.hostname === "localhost"
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
    setCurrent(current + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id.toString() === questionId);
        return {
          questionId: questionId,
          selectedOptionIndex: question ? question.options.indexOf(answer) : -1,
        };
      });

      if (formattedAnswers.some((ans) => ans.selectedOptionIndex === -1)) {
        message.error("Có câu trả lời không hợp lệ. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      const API_BASE_URL = window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";
    
    const response = await axios.post(`${API_BASE_URL}/questions/submit`, { answers: formattedAnswers });
    
      setResult(response.data.message || "Kết quả đã được gửi thành công.");
      setBestMatch(response.data.bestMatch || "Không có kết quả phù hợp.");
    } catch (error) {
      message.error("Gửi bài kiểm tra thất bại, vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-r from-green-100 to-blue-200 rounded-lg shadow-xl max-w-4xl mx-auto transition-all duration-500">
        <h2 className="text-4xl font-semibold text-center text-gray-800 mb-8">Trắc nghiệm đánh giá da</h2>
        <Steps current={current} onChange={setCurrent} className="mb-6">
          {questions.map((_, index) => (
            <Step key={index} />
          ))}
        </Steps>

        {questions[current] && (
          <Card
            title={<span className="font-medium text-2xl">{questions[current].question}</span>}
            bordered={false}
            className="shadow-lg mb-6 p-6 bg-white rounded-lg transition-all"
          >
            <Radio.Group onChange={(e) => handleAnswerChange(questions[current].id, e.target.value)} className="w-full">
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
              >
                Quay lại
              </Button>
              {current === questions.length - 1 ? (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  Hoàn thành
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  Tiếp tục
                </Button>
              )}
            </div>
          </Card>
        )}

        {result && (
          <div className="mt-8">
            <Card title="Kết quả" bordered={false} className="shadow-lg mb-6 p-6 bg-white rounded-lg">
              <p className="text-2xl text-green-600 font-semibold">{result}</p>
              {bestMatch && (
                <div className="mt-4">
                  <h4 className="text-xl font-medium">Kết quả phù hợp nhất:</h4>
                  <p className="text-lg">{bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1)}</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SkinAssessmentQuiz;
