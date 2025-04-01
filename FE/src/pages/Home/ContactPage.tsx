import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Clock, MapPin, Phone, Mail, X, ChevronUp, Calendar } from "lucide-react";
import Layout from "../../layout/Layout";

const ContactPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("infor");
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
    handleCloseModal();
    navigate("/");
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-50/30 to-white">
        <div className="container mx-auto py-24 px-6 space-y-16">
          {/* Header with parallax effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative h-64 md:h-80 mb-8 overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/70 to-yellow-600/70 z-10" />
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{
                y: [0, -10, 0],
                scale: 1.1,
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 20,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 1,
                },
              }}
              className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl font-extrabold text-center drop-shadow-lg mb-4"
              >
                Lulu Spa
              </motion.h1>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl font-light max-w-md text-center"
              >
                Your sanctuary for relaxation and rejuvenation
              </motion.p>
            </div>
          </motion.div>

          {/* Floating navigation (bỏ nút "Team") */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center z-50"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 flex gap-2">
              <button
                onClick={() => setActiveSection("infor")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 text-center ${
                  activeSection === "infor"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-md"
                    : "hover:bg-gray-100"
                }`}
              >
                Infor
              </button>
              <button
                onClick={() => setActiveSection("hours")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 text-center ${
                  activeSection === "hours"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-md"
                    : "hover:bg-gray-100"
                }`}
              >
                Hours
              </button>
            </div>
          </motion.div>

          {/* Sections with AnimatePresence for transitions (bỏ section "Team") */}
          <AnimatePresence mode="wait">
            {activeSection === "infor" && (
              <motion.div
                key="infor"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-yellow-100 max-w-4xl mx-auto"
              >
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <motion.div
                    variants={fadeInUp}
                    custom={0}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-2xl">
                      <MapPin className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Our Location</h3>
                      <p className="text-gray-600">123 Beauty Street, Wellness City</p>
                      <a
                        href="https://maps.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors mt-1 inline-block"
                      >
                        View on map →
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    custom={1}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-2xl">
                      <Phone className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Phone Number</h3>
                      <p className="text-gray-600">+84 123 456 789</p>
                      <button
                        className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors mt-1"
                        onClick={handleOpenModal}
                      >
                        Contact us →
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    custom={2}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-2xl">
                      <Mail className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Email Address</h3>
                      <p className="text-gray-600">contact@luluspa.com</p>
                      <a
                        href="mailto:contact@luluspa.com"
                        className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors mt-1 inline-block"
                      >
                        Send email →
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    custom={3}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-2xl">
                      <Calendar className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Book Appointment</h3>
                      <p className="text-gray-600">Schedule your spa session today</p>
                      <button
                        className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors mt-1"
                        onClick={handleOpenModal}
                      >
                        Book now →
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {activeSection === "hours" && (
              <motion.div
                key="hours"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-yellow-100 max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mb-4">
                    Working Hours
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Visit us during our business hours to experience our premium spa services
                  </p>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    { day: "Monday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Tuesday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Wednesday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Thursday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Friday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Saturday", hours: "9:00 AM - 19:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.day}
                      variants={fadeInUp}
                      custom={index}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className={`bg-gradient-to-br ${
                        item.day === "Sunday"
                          ? "from-red-50 to-pink-50 border-red-100"
                          : "from-yellow-50 to-yellow-100 border-yellow-200"
                      } p-6 rounded-2xl border shadow-sm transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock
                            className={`w-5 h-5 ${
                              item.day === "Sunday" ? "text-red-500" : "text-yellow-600"
                            }`}
                          />
                          <h3 className="font-medium text-gray-800">{item.day}</h3>
                        </div>
                        <p
                          className={`font-semibold ${
                            item.day === "Sunday" ? "text-red-500" : "text-yellow-600"
                          }`}
                        >
                          {item.hours}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl"
                >
                  <p className="text-amber-800 text-center font-medium">
                    ⚠️ We may close early on holidays. Please call to confirm our hours on special occasions.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-yellow-100 transition-colors z-50"
          >
            <ChevronUp className="w-6 h-6 text-yellow-600" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border border-yellow-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  <X className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                    Contact Us
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Fill out the form below and we'll get back to you soon
                  </p>
                </motion.div>

                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-3 px-8 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white font-semibold rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-500 transition duration-300"
                    >
                      Submit
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCloseModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-3 px-8 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ContactPage;