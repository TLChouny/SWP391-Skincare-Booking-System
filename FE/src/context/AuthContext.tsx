import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
  useCallback 
} from "react";

interface User {
  username: string;
  role: string;
}

interface Therapist {
  id: string;
  name: string;
  image?: string;
}

interface Booking {
  CartID?: string;
  service_id: number;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  selectedTherapist?: Therapist | null;
  Skincare_staff?: string;
  totalPrice?: number;
  status: "pending" | "checked-in" | "completed" | "cancelled";
  action?: "checkin" | "checkout" | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  cart: Booking[];
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setCart: React.Dispatch<React.SetStateAction<Booking[]>>;
  isAuthenticated: boolean;
  fetchCart: () => Promise<void>;
  loadingCart: boolean;
  cartError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState<Booking[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
      setCart([]); // Clear cart on logout
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      setCart([]); // Clear cart if user logs out
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (!token || !user) {
      setCart([]);
      setCartError("No authentication token or user found.");
      return;
    }

    setLoadingCart(true);
    setCartError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const data: Booking[] = await response.json();
      console.log("Cart data:", data); 
      console.log("User email:", user.username);

      setCart(data); 
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
      setCartError(`Failed to fetch cart: ${error.message}`);
      setCart([]);
    } finally {
      setLoadingCart(false);
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        cart,
        setToken,
        setUser,
        setCart,
        isAuthenticated: !!token,
        fetchCart,
        loadingCart,
        cartError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
