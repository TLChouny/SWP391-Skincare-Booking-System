import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ContactPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, navigating to homepage...");
    navigate("/");
  };

  return (
    <div className="container mx-auto py-16 text-center">
      <button
        onClick={handleOpenModal}
        className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Contact Us
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>

              {/* Tiêu đề */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Contact Information
              </h3>

              {/* Giờ làm việc */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-lg font-semibold flex items-center justify-center">
                  🕒 Giờ làm việc: <span className="ml-2">Thứ 2 - Thứ 7: <strong>9h00 - 17h30</strong></span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />

                {/* Buttons */}
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="py-3 px-6 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactPage;
