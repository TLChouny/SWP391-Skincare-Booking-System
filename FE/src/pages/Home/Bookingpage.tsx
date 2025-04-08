import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layout/Layout";
import CartComponent from "../../components/Cart/BookingComponent";
import CheckoutModal from "../../components/Cart/CheckoutModal";
import { useAuth } from "../../context/AuthContext";
import { Service, Therapist, Booking, Rating } from "../../types/booking";
import { JSX } from "react/jsx-runtime";

const EnhancedBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { booking, fetchBooking, user, token, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTherapists, setLoadingTherapists] = useState<boolean>(false);
  const [therapistError, setTherapistError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState<boolean>(true);
  const [bookedSlots, setBookedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [filterRating, setFilterRating] = useState<string>("All");
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false); // Thêm state để kiểm tra checked-out
  const reviewsPerPage = 3;

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);
  }, []);

  useEffect(() => {
    setCustomerEmail("");
  }, [user]);

  // Fetch booked slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !selectedTherapist) {
        setBookedSlots([]);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/bookings/booked-slots?date=${encodeURIComponent(
            selectedDate
          )}&staff=${encodeURIComponent(selectedTherapist.name)}`
        );
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        console.log("Booked Slots Data:", data);
        const validSlots = (data || []).filter(
          (slot: any) =>
            slot.startTime &&
            slot.endTime &&
            slot.startTime.match(/^\d{2}:\d{2}$/) &&
            slot.endTime.match(/^\d{2}:\d{2}$/)
        );
        if (validSlots.length !== data.length) {
          console.warn(
            "Some booked slots have invalid format:",
            data.filter(
              (slot: any) =>
                !slot.startTime ||
                !slot.endTime ||
                !slot.startTime.match(/^\d{2}:\d{2}$/) ||
                !slot.endTime.match(/^\d{2}:\d{2}$/)
            )
          );
          toast.warn("Some booked slots could not be loaded due to invalid format.");
        }
        setBookedSlots(validSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, selectedTherapist]);

  // Fetch service và booking, kiểm tra trạng thái checked-out
useEffect(() => {
  const fetchServiceAndBooking = async () => {
    try {
      if (!id) throw new Error("Service ID is missing.");
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch service: ${response.status}`);
      const serviceData = await response.json();
      setService(serviceData || null);

      if (isAuthenticated) {
        await fetchBooking();
        const hasCompleted = booking.some(
          (item) => item.status === "completed"
        );
        setIsCheckedOut(!hasCompleted); // CHỈ KHÓA nếu không có booking nào completed
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load service or booking.");
    } finally {
      setLoading(false);
    }
  };
  fetchServiceAndBooking();
}, [id, isAuthenticated, fetchBooking]);

  // Polling để cập nhật trạng thái booking sau thanh toán
  useEffect(() => {
    if (!isAuthenticated || !showCheckoutModal) return;
    const interval = setInterval(async () => {
      await fetchBooking();
      const allCheckedOut = booking.every((item) => item.status === "checked-out");
      if (allCheckedOut) {
        setIsCheckedOut(true);
        setShowCheckoutModal(false);
        toast.success("Payment completed. Booking is now checked out.");
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, showCheckoutModal, fetchBooking]);

  // Fetch therapists
  useEffect(() => {
    const fetchTherapists = async () => {
      if (!token) {
        setTherapistError("You are not logged in.");
        toast.error("You are not logged in.");
        return;
      }
      setLoadingTherapists(true);
      setTherapistError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch therapists: ${response.status} - ${errorData.message || "Unknown error"}`
          );
        }
        const data = await response.json();
        setTherapists(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username || staff.name || "Unknown",
            image: staff.avatar || "/default-avatar.png",
          }))
        );
      } catch (error: any) {
        console.error("Error fetching therapists:", error.message);
        setTherapistError(`Failed to load therapists: ${error.message}`);
        toast.error(`Failed to load therapists: ${error.message}`);
      } finally {
        setLoadingTherapists(false);
      }
    };
    if (isAuthenticated) fetchTherapists();
  }, [isAuthenticated, token]);

  // Fetch ratings
  useEffect(() => {
    if (service?.name) {
      const fetchRatings = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/ratings/service/${encodeURIComponent(service.name)}`
          );
          if (!response.ok) throw new Error("Failed to load reviews.");
          const data = await response.json();
          setRatings(data);
        } catch (error) {
          // console.error("Error fetching reviews:", error);
          // toast.error("Failed to load reviews.");
        } finally {
          setLoadingRatings(false);
        }
      };
      fetchRatings();
    }
  }, [service]);

  const addToBooking = async (newBooking: Booking) => {
    try {
      if (!token) {
        toast.warning("You need to log in to book.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          ...newBooking,
          service_id: Number(newBooking.service_id),
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (typeof responseData === "string") {
          toast.error(responseData);
        } else if (responseData.message?.includes("Staff")) {
          toast.warning(responseData.message);
        } else {
          toast.error(responseData.message || "Unable to add to Booking.");
        }
        return;
      }
      await fetchBooking();
      toast.success("Service added to Booking successfully.");
    } catch (error: any) {
      const staffName = newBooking.Skincare_staff || "Unknown";
      const startTime = newBooking.startTime || "not specified";
      toast.error(
        `${staffName} is already booked from ${startTime} to unknown. Please choose another time.`
      );
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!customerName.trim()) errors.push("Customer name is required.");
    if (!customerPhone.trim() || !/^\d{10}$/.test(customerPhone))
      errors.push("Phone number must be a valid 10-digit number.");
    if (!customerEmail.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customerEmail))
      errors.push("Email must be in a valid format.");
    if (!selectedDate) errors.push("Please select a booking date.");
    if (!selectedSlot) errors.push("Please select a time slot.");
    if (errors.length > 0) {
      toast.error(errors.join(" "));
      return false;
    }
    return true;
  };

  const calculateDiscountPercentage = (
    price?: number | { $numberDecimal: string },
    discountedPrice?: number | null | undefined
  ): number => {
    let priceValue = 0;
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    }
    if (isNaN(priceValue) || priceValue === 0 || discountedPrice == null) return 0;
    return Math.round(((priceValue - discountedPrice) / priceValue) * 100);
  };

  const formatPriceDisplay = (
    price?: number | { $numberDecimal: string },
    discountedPrice?: number | null | undefined
  ): JSX.Element => {
    let priceValue = 0;
    if (typeof price === "object" && price?.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal);
    } else if (typeof price === "number") {
      priceValue = price;
    }
    if (isNaN(priceValue)) priceValue = 0;
    return (
      <>
        <span style={{ textDecoration: discountedPrice != null ? "line-through" : "none" }}>
          {priceValue.toLocaleString("en-US")} VNĐ
        </span>
        {discountedPrice != null && (
          <span style={{ color: "green", marginLeft: "8px" }}>
            {discountedPrice.toLocaleString("en-US")} VNĐ
          </span>
        )}
      </>
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  };

  const toMinutes = (time: string | undefined): number => {
    if (!time || !time.match(/^\d{2}:\d{2}$/)) {
      console.warn(`Invalid time format: ${time}, defaulting to 0 minutes`);
      return 0;
    }
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const isTimeOverlap = (
    slot: string,
    start: string | undefined,
    end: string | undefined
  ): boolean => {
    if (!start || !end || !start.match(/^\d{2}:\d{2}$/) || !end.match(/^\d{2}:\d{2}$/)) {
      console.warn(`Invalid startTime (${start}) or endTime (${end})`);
      return false;
    }
    const slotTime = toMinutes(slot);
    const startTime = toMinutes(start);
    const endTime = toMinutes(end);
    return slotTime >= startTime && slotTime < endTime;
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();
    const today = getTodayDate();
    const isToday = selectedDate === today;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        if (isToday && (hour < currentHour || (hour === currentHour && minute < currentMinute))) {
          continue;
        }
        const isOverlapping = bookedSlots.some((b) => isTimeOverlap(slot, b.startTime, b.endTime));
        if (!isOverlapping) slots.push(slot);
      }
    }
    return slots;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.warning("Please log in to proceed with checkout.");
      return;
    }

    if (isCheckedOut) {
      toast.info("This booking has already been checked out.");
      return;
    }

    const completedItems = booking.filter((item) => item.status === "completed");
    if (completedItems.length === 0) {
      toast.error("No completed items in the cart to checkout.");
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !service || !user?.username) {
      toast.error("Please fill in all required information!");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      toast.error("Invalid booking date!");
      return;
    }
    const totalPrice =
      service.discountedPrice ??
      (typeof service.price === "number"
        ? service.price
        : service.price
        ? parseFloat(service.price)
        : 0);
    const newBooking: Booking = {
      BookingID: "",
      BookingCode: "",
      username: user.username,
      service_id: service.service_id.toString(),
      serviceName: service.name,
      bookingDate: selectedDate,
      startTime: selectedSlot!,
      endTime: "",
      customerName,
      customerEmail,
      customerPhone,
      notes: notes || undefined,
      Skincare_staff: selectedTherapist ? selectedTherapist.name : undefined,
      totalPrice,
      status: "pending",
      description: "",
    };
    await addToBooking(newBooking);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setSelectedDate("");
    setSelectedSlot(null);
    setSelectedTherapist(null);
  };

  const filteredRatings =
    filterRating === "All"
      ? ratings
      : ratings.filter((rating) => rating.serviceRating === Number(filterRating));

  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredRatings.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(filteredRatings.length / reviewsPerPage);

  const handleReviewPageChange = (page: number) => {
    setCurrentReviewPage(page);
  };

  return (
    <Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <motion.div className="container mx-auto py-16 px-6 bg-gray-50 min-h-screen">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-yellow-600 to-white-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Book Your Service
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-yellow-600 to-white-500 rounded mx-auto"></div>
        </motion.h2>

        {isAuthenticated && (
          <CartComponent
            handleCheckout={handleCheckout}
            isBookingPage={true}
            isCheckedOut={isCheckedOut} // Truyền isCheckedOut vào CartComponent
          />
        )}

        <CheckoutModal
          showModal={showCheckoutModal}
          setShowModal={setShowCheckoutModal}
          booking={booking}
          fetchBooking={fetchBooking}
          loadingBooking={false}
          bookingError={null}
          paymentUrl={paymentUrl}
          setPaymentUrl={setPaymentUrl}
          qrCode={qrCode}
          setQrCode={setQrCode}
          API_BASE_URL={API_BASE_URL}
        />

        <div className="flex flex-wrap -mx-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl shadow-lg">
                <p className="text-lg text-gray-600">Loading service details...</p>
              </div>
            ) : service ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={service.image || "/default-service.jpg"}
                  alt={service.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-service.jpg";
                  }}
                />
                {service.discountedPrice != null && (
                  <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                    <div className="bg-red-500 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center transform rotate-12 shadow-lg">
                      <span className="text-lg">
                        {calculateDiscountPercentage(service.price, service.discountedPrice)}%
                      </span>
                      <span className="text-xs block -mt-1">OFF</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.name}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xl font-semibold text-yellow-500">
                        Price: {formatPriceDisplay(service.price, service.discountedPrice)}
                      </p>
                      <p className="text-lg text-gray-600">
                        Duration: {service.duration || "N/A"} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-red-100 rounded-xl shadow-lg">
                <p className="text-lg text-red-600">Service not found. Please try again.</p>
              </div>
            )}

            <motion.div
              className="mt-8 bg-white p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Customer Reviews</h3>
              <div className="mb-4">
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(e.target.value);
                    setCurrentReviewPage(1);
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars ⭐</option>
                  <option value="4">4 Stars ⭐</option>
                  <option value="3">3 Stars ⭐</option>
                  <option value="2">2 Stars ⭐</option>
                  <option value="1">1 Star ⭐</option>
                </select>
              </div>
              {loadingRatings ? (
                <p className="text-gray-600 text-center">Loading reviews...</p>
              ) : filteredRatings.length === 0 ? (
                <p className="text-gray-600 text-center">No reviews match this rating.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentReviews.map((rating) => (
                      <motion.div
                        key={rating._id}
                        className="p-4 border rounded-lg shadow-md bg-gray-50 hover:bg-gray-100 transition duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="font-bold text-lg text-blue-600">{rating.createName}</p>
                        <p className="text-yellow-500 text-lg">Rating: {rating.serviceRating} ⭐</p>
                        <p className="text-gray-600 mt-2">{rating.serviceContent}</p>
                      </motion.div>
                    ))}
                  </div>
                  {filteredRatings.length > reviewsPerPage && (
                    <div className="flex justify-center mt-6">
                      <motion.button
                        onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                        disabled={currentReviewPage === 1}
                        className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ←
                      </motion.button>
                      {Array.from({ length: totalReviewPages }, (_, i) => (
                        <motion.button
                          key={i + 1}
                          onClick={() => handleReviewPageChange(i + 1)}
                          className={`mx-2 w-10 h-10 rounded-full ${
                            currentReviewPage === i + 1
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                        disabled={currentReviewPage === totalReviewPages}
                        className="mx-2 w-10 h-10 rounded-full border-none bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        →
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3 px-4"
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-800">Booking Form</h3>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-8 rounded-xl shadow-lg"
            >
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-4 gap-3">
                  {generateTimeSlots().map((slot) => (
                    <motion.button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 border rounded-lg text-lg font-medium transition ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {slot}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Choose Therapist (Optional)
                </label>
                {loadingTherapists ? (
                  <p className="text-gray-600">Loading therapists...</p>
                ) : therapistError ? (
                  <p className="text-red-600">{therapistError}</p>
                ) : (
                  <select
                    value={selectedTherapist ? selectedTherapist.id : ""}
                    onChange={(e) => {
                      const therapist = therapists.find((t) => t.id === e.target.value);
                      setSelectedTherapist(therapist || null);
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={therapists.length === 0}
                  >
                    <option value="">
                      {therapists.length > 0 ? "Select a therapist" : "No therapists available"}
                    </option>
                    {therapists.map((therapist) => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows={3}
                />
              </div>
              <motion.button
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-yellow-600 to-white-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition duration-300"
                disabled={!isAuthenticated}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default EnhancedBookingPage;