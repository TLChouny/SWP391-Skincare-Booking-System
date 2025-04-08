import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { Booking, User } from "../types/booking";

interface AuthContextType {
  token: string | null;
  user: User | null;
  booking: Booking[];
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setBooking: React.Dispatch<React.SetStateAction<Booking[]>>;
  isAuthenticated: boolean;
  fetchBooking: () => Promise<void>;
  loadingBooking: boolean;
  bookingError: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [booking, setBooking] = useState<Booking[]>([]);
  const [loadingBooking, setLoadingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  // Đồng bộ token với localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setBooking([]);
    }
  }, [token]);

  // Đồng bộ user với localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const fetchBooking = useCallback(async () => {
    if (!user || !token) {
      setBookingError("Please login to view bookings");
      setBooking([]);
      return;
    }

    setLoadingBooking(true);
    try {
      let endpoint: string;
      switch (user.role) {
        case "staff":
          endpoint = `${API_BASE_URL}/bookings`;
          break;
        case "skincare_staff":
          endpoint = `${API_BASE_URL}/bookings/therapist/${user.username}`;
          break;
        default:
          endpoint = `${API_BASE_URL}/bookings/user/${user.username}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error fetching bookings: ${response.status}`
        );
      }

      const data: Booking[] = await response.json();
      setBooking(data);
      setBookingError(null);
    } catch (error) {
      // console.error("Error fetching bookings:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setBookingError(errorMessage);
      setBooking([]);
      // toast.error(errorMessage);
    } finally {
      setLoadingBooking(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token && user) {
      fetchBooking();
    }
  }, [token, user, fetchBooking]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        booking,
        setToken,
        setUser,
        setBooking,
        isAuthenticated: !!token,
        fetchBooking,
        loadingBooking,
        bookingError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};