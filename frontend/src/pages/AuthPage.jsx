import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Define initial states outside the component for easy resetting
const initialLoginState = {
  loginIdentifier: '',
  password: '',
  role: '',
};

const initialRegisterState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dob: '',
  password: '',
  confirmPassword: '',
  role: '',
};


const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // FIX 1: Separated form state for Login and Register to prevent data leakage.
  const [loginData, setLoginData] = useState(initialLoginState);
  const [registerData, setRegisterData] = useState(initialRegisterState);

  // FIX 2: Added a dedicated state for displaying user-friendly error messages instead of using alert().
  const [error, setError] = useState(null);

  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin/NGO' },
  ];
  useEffect(() => {
    setError(null);
    setIsLoading(false);
    setLoginData(initialLoginState);
    setRegisterData(initialRegisterState);
  }, [activeTab]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError(null); // Clear error when user starts typing

    // Update the correct state object based on the active tab
    if (activeTab === 'login') {
      setLoginData(prevData => ({ ...prevData, [name]: value }));
    } else {
      setRegisterData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleLoginDropdownSelect = (role) => {
    setLoginData(prevData => ({ ...prevData, role }));
    setIsLoginDropdownOpen(false);
  };

  const handleRegisterDropdownSelect = (role) => {
    setRegisterData(prevData => ({ ...prevData, role }));
    setIsRegisterDropdownOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!loginData.loginIdentifier || !loginData.password || !loginData.role) {
        setError("All fields are required.");
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentifier: loginData.loginIdentifier,
          password: loginData.password,
          role: loginData.role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.role === "student") navigate("/student-dashboard");
        else if (data.role === "teacher") navigate("/teacher-dashboard");
        else if (data.role === "admin_ngo") navigate("/admin-dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    // FIX 4: Added client-side validation for matching passwords.
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          name: registerData.fullName,
          email: registerData.email,
          phone: registerData.phoneNumber,
          dob: registerData.dob,
          password: registerData.password,
          role: registerData.role,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data.success) {
        
        setActiveTab("login");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("An unexpected error occurred. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };


  // Helper component for displaying error messages
  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {message}
        </div>
    );
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-emerald-50 relative">
      <div className="absolute inset-0">
        <div className="absolute w-[900px] h-[480px] bg-blue-200 opacity-70 rounded-full blur-[200px] top-[10%] left-[10%]"></div>
        <div className="absolute w-[900px] h-[480px] bg-emerald-200 opacity-70 rounded-full blur-[200px] bottom-[10%] right-[10%]"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-1">
            Welcome to SarvaShiksha
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Quality education for every child, everywhere.
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl border-2 border-gray-200 shadow-xl p-6 sm:p-8">
          <div className="flex justify-center rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-6 py-2 rounded-md font-semibold transition-all duration-200
                ${activeTab === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 px-6 py-2 rounded-md font-semibold transition-all duration-200
                ${activeTab === 'register' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter your credentials to access your learning dashboard
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <ErrorMessage message={error} />
                <div>
                  <label htmlFor="loginIdentifier" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number or Email
                  </label>
                  <input
                    id="loginIdentifier"
                    name="loginIdentifier"
                    type="text"
                    required
                    onChange={handleInputChange}
                    value={loginData.loginIdentifier}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your phone number or email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    onChange={handleInputChange}
                    value={loginData.password}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Login as
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-xl border-2 border-gray-300 transition-all duration-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 flex justify-between items-center"
                      onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    >
                      {loginData.role ? roles.find(r => r.value === loginData.role).label : 'Select your role'}
                      <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isLoginDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isLoginDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg animate-fade-in-down">
                        {roles.map((role) => (
                          <div
                            key={role.value}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-100 first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => handleLoginDropdownSelect(role.value)}
                          >
                            {role.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-transform duration-100 ease-in-out active:scale-[0.99] disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                Create an account
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Join SarvaShiksha today
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <ErrorMessage message={error} />
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    onChange={handleInputChange}
                    value={registerData.fullName}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    onChange={handleInputChange}
                    value={registerData.email}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    onChange={handleInputChange}
                    value={registerData.phoneNumber}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    onChange={handleInputChange}
                    value={registerData.dob}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    I am a...
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 rounded-xl border-2 border-gray-300 transition-all duration-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 flex justify-between items-center"
                      onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
                    >
                      {registerData.role ? roles.find(r => r.value === registerData.role).label : 'Select your role'}
                       <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isRegisterDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                    </button>
                    {isRegisterDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg animate-fade-in-down">
                        {roles.map((role) => (
                          <div
                            key={role.value}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-100 first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => handleRegisterDropdownSelect(role.value)}
                          >
                            {role.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {registerData.role === 'student' && (
                    <div className="mt-4 text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg" role="alert">
                       <div className="flex items-center">
                         <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099a.75.75 0 011.486 0l5.58 9.92a.75.75 0 01-.643 1.131H3.32a.75.75 0 01-.643-1.131l5.58-9.92zM9 11a1 1 0 112 0 1 1 0 01-2 0zm-1-4a1 1 0 011-1h.008a1 1 0 011 1v3a1 1 0 01-1 1h-.008a1 1 0 01-1-1V7z" clipRule="evenodd" />
                           </svg>
                         </div>
                         <div className="ml-3">
                           <p className="text-sm font-bold">Guardian Consent Required</p>
                           <p className="text-sm">For students under 18, a guardian must provide consent for account creation.</p>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="regPassword"
                    name="password"
                    type="password"
                    required
                    onChange={handleInputChange}
                    value={registerData.password}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    onChange={handleInputChange}
                    value={registerData.confirmPassword}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-transform duration-100 ease-in-out active:scale-[0.99] disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

