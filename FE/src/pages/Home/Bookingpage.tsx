"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { getServices, getTherapists } from "../../api/apiService"
import Layout from "../../layout/Layout"
// import QRCode from "qrcode.react"

interface Service {
  id: string
  name: string
  description: string
  image?: string
  duration?: number
  price?: number
}

interface Therapist {
  id: string
  name: string
  image?: string
}

interface Booking {
  service: Service
  customerName: string
  customerPhone: string
  selectedDate: string
  selectedSlot: string
  selectedTherapist: Therapist | null
  timestamp: number
  status: "pending" | "confirmed" | "completed"
}

const EnhancedBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [customerName, setCustomerName] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [showCart, setShowCart] = useState<boolean>(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false)
  const [cart, setCart] = useState<Booking[]>([])
  const [paymentUrl, setPaymentUrl] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceResponse, therapistsResponse] = await Promise.all([getServices(), getTherapists()])
        const foundService = serviceResponse.data.find((s: Service) => s.id === id)
        setService(foundService || null)
        setTherapists(therapistsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const storedCart: Booking[] = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(storedCart)
  }, [id])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
      }
    }
    return slots
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!customerName || !customerPhone || !selectedDate || !selectedSlot || !service) {
      alert("Please fill in all required fields before booking.")
      return
    }

    const bookingData: Booking = {
      service,
      customerName,
      customerPhone,
      selectedDate,
      selectedSlot,
      selectedTherapist,
      timestamp: Date.now(),
      status: "pending",
    }

    const updatedCart = [...cart, bookingData]
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCart(updatedCart)
    setShowCart(true)
  }

  const toggleCart = () => setShowCart(!showCart)

  const handleCheckout = () => {
    setShowCart(false)
    setShowCheckoutModal(true)
    // Generate payment URL (replace with actual PayOS integration)
    const totalAmount = calculateTotal()
    setPaymentUrl(`https://payos.example.com/pay?amount=${totalAmount}`)
  }

  const handlePayment = () => {
    const updatedCart = cart.map((item) => ({ ...item, status: "completed" }) as Booking)

    const bookingHistory: Booking[] = JSON.parse(localStorage.getItem("bookingHistory") || "[]")
    localStorage.setItem("bookingHistory", JSON.stringify([...bookingHistory, ...updatedCart]))

    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCart(updatedCart)
    setShowCheckoutModal(false)
    setShowCart(true)
  }

  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const day = today.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const calculateTotal = () => {
    return cart
      .filter((item) => item.status === "confirmed")
      .reduce((sum, item) => sum + Number(item.service.price || 0), 0);
  };
  

  const isAllServicesConfirmed = () => {
    return cart.every((item) => item.status === "confirmed" || item.status === "completed")
  }

  const isAllServicesCompleted = () => {
    return cart.every((item) => item.status === "completed")
  }

  // Simulating staff confirmation (replace with actual API call)
  const simulateStaffConfirmation = (bookingIndex: number) => {
    const updatedCart = [...cart]
    updatedCart[bookingIndex].status = "confirmed"
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto py-16 relative"
      >
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">Book Your Service</h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCart}
          className="fixed top-28 right-4 p-3 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 transition-colors duration-300"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-36 right-4 bg-white p-6 rounded-lg shadow-xl max-w-sm z-10"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Cart</h3>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 border-b pb-4"
                  >
                    <p className="font-semibold text-gray-800">{item.service.name}</p>
                    <p className="text-gray-600">
                      {item.selectedDate} - {item.selectedSlot}
                    </p>
                    {item.selectedTherapist && (
                      <p className="text-gray-600">Therapist: {item.selectedTherapist.name}</p>
                    )}
                    <p
                      className={`${
                        item.status === "completed"
                          ? "text-green-500"
                          : item.status === "confirmed"
                            ? "text-blue-500"
                            : "text-yellow-500"
                      }`}
                    >
                      Status: {item.status}
                    </p>
                    {item.status === "pending" && (
                      <button
                        onClick={() => simulateStaffConfirmation(index)}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                      >
                        Simulate Staff Confirmation
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600">Your cart is empty.</p>
              )}
              {cart.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckout}
                  disabled={!isAllServicesConfirmed() || isAllServicesCompleted()}
                  className={`w-full p-3 rounded-lg transition-colors duration-300 mt-4 ${
                    isAllServicesConfirmed() && !isAllServicesCompleted()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Proceed to Checkout
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 mt-2"
              >
                Close
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Confirm Payment</h3>
                <ul className="space-y-4">
                  {cart
                    .filter((item) => item.status === "confirmed")
                    .map((item, index) => (
                      <li key={index} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-semibold text-gray-800">{item.service.name}</p>
                          <p className="text-gray-600">
                            {item.selectedDate} - {item.selectedSlot}
                          </p>
                          {item.selectedTherapist && (
                            <p className="text-gray-600">Therapist: {item.selectedTherapist.name}</p>
                          )}
                        </div>
                        <span className="font-bold text-gray-800">${item.service.price}</span>
                      </li>
                    ))}
                </ul>
                <div className="text-right text-xl font-bold mt-6 text-gray-800">Total: ${calculateTotal()}</div>
                <div className="mt-6">
                  <p className="text-lg font-semibold mb-2">Scan QR Code to Pay:</p>
                  {/* <QRCode value={paymentUrl} size={200} className="mx-auto" /> */}
                </div>
                <p className="mt-4 text-blue-600 text-center">
                  <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                    Click here to pay if QR code doesn't work
                  </a>
                </p>
                <div className="flex justify-end mt-8 space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCheckoutModal(false)}
                    className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePayment}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Confirm Payment
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap -mx-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0"
          >
            {loading ? (
              <p className="text-lg text-gray-600">Loading service details...</p>
            ) : service ? (
              <>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">{service.name}</h3>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={service.image}
                  alt={service.name}
                  className="w-full h-auto rounded-lg shadow-xl mb-6 object-cover"
                />
                <p className="text-lg text-gray-600 mb-4">{service.description}</p>
                <p className="text-xl font-bold text-gray-800">Price: ${service.price}</p>
                <p className="text-lg text-gray-600">Duration: {service.duration} minutes</p>
              </>
            ) : (
              <p className="text-lg text-red-600">Service not found. Please try again.</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-2/3 px-4">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Booking Form</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {generateTimeSlots().map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 border rounded-lg transition-colors duration-300 ${
                        selectedSlot === slot ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg text-gray-700 mb-2">Choose Therapist (Optional)</label>
                <select
                  value={selectedTherapist ? selectedTherapist.id : ""}
                  onChange={(e) => {
                    const therapist = therapists.find((t) => t.id === e.target.value)
                    setSelectedTherapist(therapist || null)
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                >
                  <option value="">Select a therapist (optional)</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
              >
                Book Now
              </motion.button>
            </form>
            <p className="mt-6 text-gray-600 italic">
              Note: If you don't select a therapist, one will be assigned to you upon check-in at our facility.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  )
}

export default EnhancedBookingPage

