// src/api/axiosInstance.js
import axios from "axios";

// baseURL - change to your backend URL or add REACT_APP_API_URL in .env
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true
});

// Attach token from localStorage automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// Optional: global response handler for 401 -> force logout
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // redirect to login (causes full reload but is simple & reliable)
      // window.location.href = "/login";
      
    }
    return Promise.reject(error);
  }
);

export default instance;
