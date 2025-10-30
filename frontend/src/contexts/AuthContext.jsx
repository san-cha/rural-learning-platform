// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axiosInstance"; // Assumes Axios is configured with `withCredentials: true`
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try user from localStorage first
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
          setLoading(false);
          return;
        }
        // Fall back to API
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/auth/me`, { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (loginIdentifier, password, role) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/auth/login`,
        { loginIdentifier, password, role },
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
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
      await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
