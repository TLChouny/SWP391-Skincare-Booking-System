"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "../../layout/Layout"
import CartComponent from "../../components/Cart/CartComponent"
import CheckoutModal from "../../components/Cart/CheckoutModal"
import { toast } from "react-toastify"
import { useAuth } from "../../context/AuthContext"
import type { Booking, Service, Therapist, Blog } from "../../types/booking"
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4"
import { JSX } from "react/jsx-runtime"

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

const serviceCardVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3, ease: "easeInOut" } },
  tap: { scale: 0.95, transition: { duration: 0.2, ease: "easeInOut" } },
}

const therapistCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 },
  },
}

const HomePage: React.FC = () => {
  const { cart, fetchCart, isAuthenticated, loadingCart, cartError, setCart, token } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [currentTherapistIndex, setCurrentTherapistIndex] = useState(0)
  const [loadingBlogs, setLoadingBlogs] = useState<boolean>(true)
  const [loadingTherapists, setLoadingTherapists] = useState<boolean>(false)
  const [therapistError, setTherapistError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false)
  const [paymentUrl, setPaymentUrl] = useState<string>("")
  const [qrCode, setQrCode] = useState<string>("")
  const [API_BASE_URL] = useState<string>("http://localhost:5000/api")
  const carouselRef = useRef<HTMLDivElement>(null)

  // Hàm format giá
  const formatPriceDisplay = (
    price?: number | { $numberDecimal: string },
    discountedPrice?: number | null | undefined,
  ): JSX.Element => {
    let priceValue = 0
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal)
    } else if (typeof price === "number") {
      priceValue = price
    }

    if (isNaN(priceValue)) priceValue = 0

    let discountPercentage = 0
    if (discountedPrice != null && priceValue > 0) {
      discountPercentage = Math.round(((priceValue - discountedPrice) / priceValue) * 100)
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className={`text-base font-semibold ${discountedPrice != null ? "text-gray-500 line-through" : "text-yellow-600"}`}
        >
          {priceValue.toLocaleString("vi-VN")} VNĐ
        </span>
        {discountPercentage > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </span>
        )}
        {discountedPrice != null && (
          <span className="text-base font-semibold text-green-600">{discountedPrice.toLocaleString("vi-VN")} VNĐ</span>
        )}
      </div>
    )
  }

  // Fetch dữ liệu
  useEffect(() => {
    fetch(`${API_BASE_URL}/products/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok")
        return response.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setServices(data)
        else {
          console.error("Invalid data returned:", data)
          setServices([])
          toast.error("Invalid service data received.")
        }
      })
      .catch((error) => {
        console.error("Error fetching services:", error)
        toast.error("Unable to load service list. Please try again later.")
      })
  }, [API_BASE_URL])

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoadingTherapists(true)
        setTherapistError(null)
        if (!token) {
          toast.warning("Please log in to view the list of specialists.")
          return
        }
        const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        })
        if (!response.ok) throw new Error(`Failed to fetch therapists: ${response.status}`)
        const data = await response.json()
        setTherapists(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username,
            image: staff.avatar || "/default-avatar.png",
            Description: staff.Description,
          })),
        )
      } catch (error: any) {
        console.error("Error fetching therapists:", error.message)
        setTherapistError("Unable to load specialist list. Please try again later.")
        toast.error("Unable to load specialist list. Please try again later.")
      } finally {
        setLoadingTherapists(false)
      }
    }

    if (isAuthenticated) fetchTherapists()
  }, [isAuthenticated, token, API_BASE_URL])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`)
        const data = await response.json()
        if (Array.isArray(data)) setBlogs(data)
        else {
          console.error("Invalid data returned:", data)
          setBlogs([])
          toast.error("Invalid blog data received.")
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
        toast.error("Unable to load blog list. Please try again later.")
      } finally {
        setLoadingBlogs(false)
      }
    }

    fetchBlogs()
  }, [API_BASE_URL])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  // Hàm xử lý
  const handleCheckout = async () => {
    console.log("Checking out with cart:", cart)
    if (!isAuthenticated) {
      toast.warning("Please log in to proceed with checkout.")
      navigate("/login")
      return
    }

    const completedItems = cart.filter((item) => item.status === "completed")
    if (completedItems.length === 0) {
      toast.error("No completed items in the cart to checkout. Please ensure items are marked as completed.")
      return
    }

    setShowCheckoutModal(true)

    const totalAmount = completedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    const orderName = completedItems[0]?.serviceName || "Multiple Services"
    let description = `Dịch vụ ${orderName.substring(0, 25)}`
    if (description.length > 25) description = description.substring(0, 25)

    const BASE_URL = window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://luluspa-production.up.railway.app"
    const returnUrl = `${BASE_URL}/success.html`
    const cancelUrl = `${BASE_URL}/cancel.html`

    try {
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          orderName,
          description,
          returnUrl,
          cancelUrl,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error !== 0 || !data.data) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`)
      }

      setPaymentUrl(data.data.checkoutUrl)
      setQrCode(data.data.qrCode)
    } catch (error: any) {
      console.error("❌ Error during checkout:", error)
      toast.error("Khởi tạo thanh toán thất bại. Vui lòng thử lại.")
      setShowCheckoutModal(false)
    }
  }

  const handlePayment = async () => {
    try {
      if (!token) throw new Error("Please log in to confirm payment.")

      await Promise.all(
        cart
          .filter((item) => item.status === "completed")
          .map((item) =>
            fetch(`${API_BASE_URL}/cart/${item.CartID}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
              },
              body: JSON.stringify({ status: "checked-out" }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed to update cart item ${item.CartID}`)
            }),
          ),
      )

      await fetchCart()
      setShowCheckoutModal(false)
      toast.success("Thanh toán và check-out thành công!")
    } catch (error) {
      console.error("Error updating cart status:", error)
      toast.error("Lỗi khi cập nhật trạng thái thanh toán.")
    }
  }

  const handleBookNow = (id: string) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để đặt dịch vụ.")
      navigate("/login")
      return
    }
    navigate(`/booking/${id}`)
  }

  const handleNextTherapists = () => {
    const maxIndex = Math.ceil(therapists.length / 3) - 1
    setCurrentTherapistIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0))
  }

  const handleViewAllBlogs = () => {
    navigate("/blog")
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.section
          key="hero"
          className="relative w-full h-screen overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <video
            src={video1}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={(e) => {
              console.error("Video failed to load:", e)
              toast.error("Video failed to load. Please try again later.")
              ;(e.target as HTMLVideoElement).style.display = "none"
            }}
          >
            <source src={video1} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white px-6">
            <motion.h1
              className="text-6xl font-extrabold mb-4 text-yellow-400"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Discover the Magic of LuLuSpa
            </motion.h1>
            <motion.p
              className="text-2xl font-light mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Your Skin, Our Passion
            </motion.p>
            <motion.button
              onClick={() => services.length > 0 && handleBookNow(services[0]._id)}
              className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-full text-lg font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={services.length === 0}
            >
              Book Your Luxurious Experience
            </motion.button>
          </div>
        </motion.section>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.section
          key="services"
          className="py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Luxurious Skincare Packages</h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Discover our premium skincare treatments designed to rejuvenate and transform your skin
              </p>
            </div>

            {/* Infinite Carousel for Services */}
            {services.length > 0 ? (
              <div className="relative overflow-hidden">
                <motion.div
                  ref={carouselRef}
                  className="flex"
                  animate={{
                    x: ["0%", "-100%"],
                    transition: {
                      x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: services.length * 2,
                        ease: "linear",
                      },
                    },
                  }}
                >
                  {[...services, ...services].map((service, index) => (
                    <motion.div
                      key={`${service._id}-${index}`}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2"
                      variants={serviceCardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div
                        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                          service.discountedPrice != null ? "" : "hover:translate-y-[-4px]"
                        }`}
                      >
                        <div className="relative">
                          {service.discountedPrice != null && (
                            <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
                              <div className="bg-red-500 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center transform rotate-12 shadow-lg">
                                <span className="text-lg">
                                  {Math.round(
                                    (((service.price as number) - service.discountedPrice!) /
                                      (service.price as number)) *
                                      100,
                                  )}
                                  %
                                </span>
                                <span className="text-xs block -mt-1">OFF</span>
                              </div>
                            </div>
                          )}
                          <img
                            src={service.image || "/default-service.jpg"}
                            alt={service.name}
                            className="w-full h-80 object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/default-service.jpg"
                            }}
                          />
                          {service.discountedPrice != null && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500/80 to-transparent text-white py-2 px-4">
                              <span className="font-semibold">Special Offer</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                            {service.name}
                          </h3>
                          <p className="text-gray-600 mb-3 flex-grow line-clamp-2 text-sm">{service.description}</p>
                          <div className="mt-auto space-y-3">
                            <div className="flex flex-col">
                              {service.discountedPrice != null ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 line-through text-sm">
                                      {(service.price as number).toLocaleString("vi-VN")} VNĐ
                                    </span>
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    {service.discountedPrice.toLocaleString("vi-VN")} VNĐ
                                  </div>
                                </>
                              ) : (
                                <div className="text-lg font-bold text-yellow-500">
                                  {(service.price as number).toLocaleString("vi-VN")} VNĐ
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-gray-500 text-xs flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {service.duration ? `${service.duration} min` : "TBD"}
                              </div>
                              <motion.button
                                onClick={() => handleBookNow(service._id)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition duration-300 ${
                                  service.discountedPrice != null
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                                }`}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                              >
                                Book Now
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                Our luxurious services are being prepared. Please check back soon.
              </p>
            )}
          </div>

          {/* Therapist Section */}
          <div className="container mx-auto px-4 mt-24">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Our Skincare Experts</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Meet our team of certified specialists with years of experience in skincare treatments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {loadingTherapists ? (
                <div className="flex justify-center items-center h-64 col-span-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              ) : therapistError ? (
                <p className="text-center text-red-600 col-span-3">{therapistError}</p>
              ) : isAuthenticated && therapists.length > 0 ? (
                therapists.slice(currentTherapistIndex * 3, (currentTherapistIndex + 1) * 3).map((therapist) => (
                  <motion.div
                    key={therapist.id}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    variants={therapistCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={therapist.image || "/placeholder.svg?height=300&width=400"}
                        alt={therapist.name}
                        className="w-full h-60 object-contain transition-transform duration-500 group-hover:scale-100"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/default-avatar.png"
                        }}
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                      <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-20">
                        Expert
                      </div>
                    </div>

                    <div className="p-6 text-left flex flex-col flex-grow relative z-10">
                      <h4 className="text-2xl font-bold text-gray-800 mb-1">{therapist.name}</h4>
                      <p className="text-base text-yellow-600 font-medium mb-4 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                          />
                        </svg>
                        Skincare Specialist
                      </p>

                      <div className="bg-gray-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Experience
                        </h5>
                        <p className="text-sm text-gray-600">
                          {therapist.Description?.includes("năm")
                            ? therapist.Description.match(/\d+\s+năm/)?.[0] || "Nhiều năm"
                            : "Nhiều năm"}{" "}
                          kinh nghiệm chuyên sâu
                        </p>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-3 flex-grow">
                        {therapist.Description ||
                          "Chuyên gia tận tâm với nhiều năm kinh nghiệm trong lĩnh vực chăm sóc da."}
                      </p>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                          <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 hover:bg-yellow-200 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                          <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          <span>5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Xem Lịch
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-3 py-12">
                  {isAuthenticated
                    ? "Our skincare experts are being prepared. Please check back soon."
                    : "Please log in to view the list of specialists."}
                </p>
              )}
            </div>

            {isAuthenticated && therapists.length > 3 && (
              <div className="text-center mt-12">
                <motion.button
                  onClick={handleNextTherapists}
                  className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out flex items-center mx-auto"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>Explore More Specialists</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Blogs Section */}
      <AnimatePresence mode="wait">
        <motion.section
          key="blogs"
          className="py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Latest Blog Posts</h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Stay updated with the latest skincare trends, tips, and insights from our experts
              </p>
            </div>

            {loadingBlogs ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : blogs.length > 0 ? (
              <>
                {blogs.length > 0 && (
                  <motion.div
                    className="mb-16 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    variants={serviceCardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative h-full">
                        <img
                          src={blogs[0].image || "/placeholder.svg?height=600&width=800"}
                          alt={blogs[0].title}
                          className="w-full h-full object-cover min-h-[300px]"
                        />
                        <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                          Featured Post
                        </div>
                      </div>
                      <div className="p-8 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{blogs[0].title}</h3>
                          <p className="text-gray-600 mb-6 line-clamp-4">{blogs[0].description}</p>
                        </div>
                        <div className="mt-auto">
                          <div className="flex items-center mb-4">
                            <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Admin</p>
                              <p className="text-xs text-gray-500">
                                {new Date(blogs[0].createdAt || Date.now()).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => navigate(`/blog/${blogs[0].id}`)}
                            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition duration-300 w-full md:w-auto"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Read Full Article
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">More Articles</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {blogs.slice(1, 4).map((blog) => (
                      <motion.div
                        key={blog.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                        variants={serviceCardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -5 }}
                      >
                        <div className="relative">
                          <img
                            src={blog.image || "/placeholder.svg?height=300&width=500"}
                            alt={blog.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white text-xs">
                              {new Date(blog.createdAt || Date.now()).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{blog.description}</p>
                          <motion.button
                            onClick={() => navigate(`/blog/${blog.id}`)}
                            className="mt-auto text-yellow-600 font-medium hover:text-yellow-700 flex items-center"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Read More
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    <motion.button
                      onClick={() => {
                        const newBlogs = [...blogs]
                        newBlogs.push(newBlogs.shift()!)
                        setBlogs(newBlogs)
                      }}
                      className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      aria-label="Previous blog"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const newBlogs = [...blogs]
                        newBlogs.unshift(newBlogs.pop()!)
                        setBlogs(newBlogs)
                      }}
                      className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      aria-label="Next blog"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                <div className="text-center mt-16">
                  <motion.button
                    onClick={handleViewAllBlogs}
                    className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition duration-300 ease-in-out flex items-center mx-auto"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>View All Articles</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </>
            ) : (
              <p className="text-gray-600 text-center py-12">No blog posts available at the moment.</p>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      <CheckoutModal
        showModal={showCheckoutModal}
        setShowModal={setShowCheckoutModal} // Sửa để đồng bộ với state trong HomePage
        cart={cart as Booking[]}
        fetchCart={fetchCart}
        loadingCart={loadingCart}
        cartError={cartError}
        paymentUrl={paymentUrl}
        setPaymentUrl={setPaymentUrl}
        qrCode={qrCode}
        setQrCode={setQrCode}
        API_BASE_URL={API_BASE_URL}
      />

      {isAuthenticated && <CartComponent handleCheckout={handleCheckout} isBookingPage={false} />}
    </Layout>
  )
}

export default HomePage