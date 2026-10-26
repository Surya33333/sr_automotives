"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = useCallback((customerData) => {
    setCustomer(customerData);
    setAuthLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        setCustomer(null);
        return null;
      }

      if (!response.ok) {
        throw new Error("Unable to check session");
      }

      const data = await response.json();

      if (!data.success || !data.customer) {
        throw new Error("Invalid profile response");
      }

      setCustomer(data.customer);
      return data.customer;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to log out");
    }

    setCustomer(null);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        authLoading,
        login,
        logout,
        refreshProfile,
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
