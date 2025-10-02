import { createContext, useContext, useState } from "react";

// 1. Create the context
const AuthContext = createContext();

// 2. Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 'null' means user is not logged in

  // Mock login function - in a real app, this would be an API call
  const login = (userData) => {
    setUser(userData);
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};