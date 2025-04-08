import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import CheckoutModal from "../../components/Cart/CheckoutModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import type { Booking, Service, Therapist, Blog } from "../../types/booking";
import BookingComponent from "../../components/Cart/BookingComponent";
import HeroSection from "../../components/Home/HeroSection";
import ServicesSection from "../../components/Home/ServicesSection";
import TherapistsSection from "../../components/Home/TherapistsSection";
import BlogsSection from "../../components/Home/BlogsSection";

const HomePage: React.FC = () => {
  const { booking, fetchBooking, isAuthenticated, loadingBooking, bookingError, setBooking, token } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentTherapistIndex, setCurrentTherapistIndex] = useState(0);
  const [loadingBlogs, setLoadingBlogs] = useState<boolean>(true);
  const [loadingTherapists, setLoadingTherapists] = useState<boolean>(false);
  const [therapistError, setTherapistError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
   const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false); // Thêm state để kiểm tra checked-out
  const [API_BASE_URL] = useState<string>(
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api"
  );

  useEffect(() => {
    console.log("Services:", services);
    console.log("Therapists:", therapists);
    console.log("Blogs:", blogs);
    console.log("isAuthenticated:", isAuthenticated);
  }, [services, therapists, blogs, isAuthenticated]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        console.log("Fetched services:", data);
        if (Array.isArray(data)) setServices(data);
        else {
          console.error("Invalid data returned:", data);
          setServices([]);
          toast.error("Invalid service data received.");
        }
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        toast.error("Unable to load service list. Please try again later.");
      });
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoadingTherapists(true);
        setTherapistError(null);
        if (!token) {
          toast.warning("Please log in to view the list of specialists.");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/users/skincare-staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch therapists: ${response.status}`);
        const data = await response.json();
        console.log("Fetched therapists:", data);
        const baseUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://luluspa-production.up.railway.app";
        setTherapists(
          data.map((staff: any) => ({
            id: staff._id,
            name: staff.username,
            image: staff.avatar ? `${baseUrl}${staff.avatar}` : `${baseUrl}/default-avatar.png`,
            Description: staff.Description || "Skincare expert",
          }))
        );
      } catch (error: any) {
        console.error("Error fetching therapists:", error.message);
        setTherapistError("Unable to load specialist list. Please try again later.");
      } finally {
        setLoadingTherapists(false);
      }
    };

    if (isAuthenticated) fetchTherapists();
  }, [isAuthenticated, token, API_BASE_URL]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        console.log("Fetched blogs:", data);
        if (Array.isArray(data)) setBlogs(data);
        else {
          console.error("Invalid data returned:", data);
          setBlogs([]);
          toast.error("Invalid blog data received.");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Unable to load blog list. Please try again later.");
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooking();
    }
  }, [isAuthenticated, fetchBooking]);

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

  const handleBookNow = (id: string) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để đặt dịch vụ.");
      navigate("/login");
      return;
    }
    navigate(`/booking/${id}`);
  };

  const handleNextTherapists = () => {
    const maxIndex = Math.ceil(therapists.length / 3) - 1;
    setCurrentTherapistIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0));
  };

  return (
    <Layout>
      <HeroSection servicesLength={services.length} />
      <ServicesSection
        services={services}
        handleBookNow={handleBookNow}
        servicesInView={true}
      />
      <TherapistsSection
        therapists={therapists}
        loadingTherapists={loadingTherapists}
        therapistError={therapistError}
        isAuthenticated={isAuthenticated}
        currentTherapistIndex={currentTherapistIndex}
        handleNextTherapists={handleNextTherapists}
        therapistsInView={true}
      />
      <BlogsSection
        blogs={blogs}
        loadingBlogs={loadingBlogs}
        setBlogs={setBlogs}
        blogsInView={true}
      />
      <CheckoutModal
        showModal={showCheckoutModal}
        setShowModal={setShowCheckoutModal}
        booking={booking as Booking[]}
        fetchBooking={fetchBooking}
        loadingBooking={loadingBooking}
        bookingError={bookingError}
        paymentUrl={paymentUrl}
        setPaymentUrl={setPaymentUrl}
        qrCode={qrCode}
        setQrCode={setQrCode}
        API_BASE_URL={API_BASE_URL}
      />
      {isAuthenticated && <BookingComponent handleCheckout={handleCheckout} isBookingPage={false} />}
    </Layout>
  );
};

export default HomePage;