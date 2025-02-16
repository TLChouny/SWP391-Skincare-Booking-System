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
        className="py-2 px-4 bg-blue-500 text-white rounded-lg"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-lg w-1/2 relative"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  className="mb-4 p-2 border w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="mb-4 p-2 border w-full"
                  required
                />

                {/* Buttons (Submit + Cancel) */}
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-500 text-white rounded-lg"
                  > 
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="py-2 px-4 bg-gray-500 text-white rounded-lg"
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
