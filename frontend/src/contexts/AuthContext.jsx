// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axiosInstance.jsx"; // Use configured axios instance
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let isActive = true;
    const checkUser = async () => {
      try {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          if (isActive) setUser(JSON.parse(localUser));
          if (isActive) setLoading(false);
          return;
        }
        const res = await axios.get('/auth/me', { withCredentials: true });
        if (isActive) setUser(res?.data?.user || null);
      } catch (err) {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    checkUser();
    return () => { isActive = false; };
  }, []);

  const login = async (loginIdentifier, password, role) => {
    try {
      const res = await axios.post('/auth/login', { loginIdentifier, password, role }, { withCredentials: true });
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
      await axios.post('/auth/logout', {}, { withCredentials: true });
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
