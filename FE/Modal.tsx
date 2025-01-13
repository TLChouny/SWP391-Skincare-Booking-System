import React from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, handleCloseModal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: showModal ? 1 : 0, scale: showModal ? 1 : 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: showModal ? 1 : 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-lg w-1/2"
      >
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-2xl"
        >
          ×
        </button>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h3>
        <form>
          <input
            type="text"
            placeholder="Name"
            className="mb-4 p-2 border w-full"
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="mb-4 p-2 border w-full"
          />
          <button className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-4">Submit</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
