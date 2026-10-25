
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "sr_customer_token";
const CUSTOMER_KEY = "sr_customer";

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const sessionVersion = useRef(0);

  const logout = useCallback(() => {
    sessionVersion.current += 1;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);

    setCustomer(null);
    setToken(null);
    setAuthLoading(false);
  }, []);

  const login = useCallback(({ token: newToken, customer: newCustomer }) => {
    if (!newToken || !newCustomer) {
      throw new Error("Invalid authentication response");
    }

    sessionVersion.current += 1;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(
      CUSTOMER_KEY,
      JSON.stringify(newCustomer)
    );

    setToken(newToken);
    setCustomer(newCustomer);
    setAuthLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      logout();
      return null;
    }

    const version = ++sessionVersion.current;

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        if (version === sessionVersion.current) {
          logout();
        }
        return null;
      }

      if (!response.ok) {
        throw new Error("Unable to load customer profile");
      }

      const data = await response.json();

      if (!data.success || !data.customer) {
        throw new Error("Invalid profile response");
      }

      if (version !== sessionVersion.current) {
        return null;
      }

      // Ensure a newer login has not replaced this session.
      if (localStorage.getItem(TOKEN_KEY) !== savedToken) {
        return null;
      }

      setCustomer(data.customer);
      setToken(savedToken);

      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify(data.customer)
      );

      return data.customer;
    } catch (error) {
      console.error("Profile refresh failed:", error);

      // Network errors do not necessarily mean the JWT expired.
      // Keep the session stored and allow another validation attempt.
      return null;
    } finally {
      if (version === sessionVersion.current) {
        setAuthLoading(false);
      }
    }
  }, [logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const isAuthenticated = Boolean(token && customer);

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated,
        authLoading,
        login,
        logout,
        refreshProfile,
        setCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
