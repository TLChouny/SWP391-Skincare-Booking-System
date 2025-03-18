import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { Booking } from "../types/booking";

interface User {
  username: string;
  role: string;
  email?: string;
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
  login: (email: string, password: string) => Promise<void>;
  loadingCart: boolean;
  cartError: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState<Booking[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://luluspa-production.up.railway.app/api";

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      setCart([]);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Đăng nhập thất bại!");

      const data = await response.json();
      setToken(data.token);
      setUser({
        username: data.username,
        role: data.role || "user",
        email: data.email,
      });
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  // const fetchCart = useCallback(async () => {
  //   if (!user || !token) {
  //     setCartError("Vui lòng đăng nhập để xem giỏ hàng");
  //     setCart([]);
  //     return;
  //   }

  //   setLoadingCart(true);
  //   try {
  //     let endpoint: string;
  //     if (user.role === "staff") {
  //       endpoint = `${API_BASE_URL}/cart`;
  //       console.log(`Staff role detected - Fetching all carts from: ${endpoint}`);
  //     } else if (user.role === "therapist") {
  //       endpoint = `${API_BASE_URL}/cart/therapist/${user.username}`;
  //       console.log(`Therapist role detected - Fetching assigned carts from: ${endpoint}`);
  //     } else {
  //       endpoint = `${API_BASE_URL}/cart/user/${user.username}`;
  //       console.log(`Customer role detected - Fetching user carts from: ${endpoint}`);
  //     }

  //     const response = await fetch(endpoint, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-auth-token": token,
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(`Không thể tải giỏ hàng: ${response.status} - ${errorData.message || "Lỗi server không xác định"}`);
  //     }

  //     const data = await response.json();
  //     console.log("Fetched cart data:", data); // Debug: Log the raw API response
  //     setCart(data);
  //     setCartError(null);
  //   } catch (error) {
  //     console.error("Lỗi khi tải giỏ hàng:", error);
  //     const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
  //     setCartError(errorMessage);
  //     setCart([]);
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoadingCart(false);
  //   }
  // }, [user, token]);

  const fetchCart = useCallback(async () => {
    if (!user || !token) {
      setCartError("Vui lòng đăng nhập để xem giỏ hàng");
      setCart([]);
      return;
    }

    setLoadingCart(true);
    try {
      let endpoint: string;
      if (user.role === "staff") {
        endpoint = `${API_BASE_URL}/cart`;
        console.log(
          `Staff role detected - Fetching all carts from: ${endpoint}`
        );
      } else if (
        user.role === "skincare_staff" ||
        user.username.startsWith("therapist")
      ) {
        // Thêm kiểm tra username bắt đầu bằng "therapist" để ưu tiên
        endpoint = `${API_BASE_URL}/cart/therapist/${user.username}`;
        console.log(
          `Therapist role detected - Fetching assigned carts from: ${endpoint}`
        );
      } else {
        endpoint = `${API_BASE_URL}/cart/user/${user.username}`;
        console.log(
          `Customer role detected - Fetching user carts from: ${endpoint}`
        );
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
       return ;
      }

      const data = await response.json();
      console.log("Fetched cart data:", data);
      setCart(data);
      setCartError(null);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      setCartError(errorMessage);
      setCart([]);
      toast.error(errorMessage);
    } finally {
      setLoadingCart(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token && user) {
      fetchCart();
    }
  }, [token, user, fetchCart]);

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
        login,
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
