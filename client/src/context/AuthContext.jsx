
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// import api from "../services/api";
import api from "../services/crmApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");

      if (!response.data?.success || !response.data?.user) {
        setUser(null);
        return null;
      }

      setUser(response.data.user);
      return response.data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const response = await api.get("/auth/me");

        if (mounted && response.data?.success) {
          setUser(response.data.user || null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Login failed.");
    }

    // Verify the HTTP-only cookie by fetching the authenticated user.
    const meResponse = await api.get("/auth/me");

    if (!meResponse.data?.success || !meResponse.data?.user) {
      throw new Error("Unable to verify your login session.");
    }

    setUser(meResponse.data.user);

    return meResponse.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Clear local authentication state even if the network fails.
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isStaff: user?.role === "staff",
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
