// import { createContext, useContext, useState } from "react";
// import axios from 'axios';

// // 1. Create the context
// const AuthContext = createContext();

// // 2. Create a provider component
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // 'null' means user is not logged in

//   // Mock login function - in a real app, this would be an API call
//   const login = (userData) => {
//     setUser(userData);
//   };

//   // Mock logout function
//   const logout = () => {
//     setUser(null);
//   };

//   const value = { user, login, logout };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // 3. Create a custom hook to easily use the context
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "../api/axiosInstance"; // uses the Axios instance you'll create

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Real login function (calls backend)
  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      // expected backend response: { token: '...', user: { ... } }
      const { user: userData, token: jwt } = res.data;

      setUser(userData);
      setToken(jwt);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", jwt);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: err?.response?.data?.message || "Login failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // optional: notify backend / revoke session
    window.location.href = "/login"; // force redirect to login
  };

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
