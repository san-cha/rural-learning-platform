// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axiosInstance"; // Assumes Axios is configured with `withCredentials: true`

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.msg || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      window.location.href = "/auth";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
