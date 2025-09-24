import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


const App = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginIdentifier: '', 
    password: '',
    role: '',
    fullName: '',
    email: '',
    phoneNumber: '', 
    dob: '', 
    confirmPassword: '',
  });
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin_ngo', label: 'Admin/NGO' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };
  
  const handleLoginDropdownSelect = (role) => {
    setFormData(prevData => ({ ...prevData, role }));
    setIsLoginDropdownOpen(false);
  };
  
  const handleRegisterDropdownSelect = (role) => {
    setFormData(prevData => ({ ...prevData, role }));
    setIsRegisterDropdownOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // fake API call
    setTimeout(() => {
      console.log(
        "Login attempt with:",
        formData.loginIdentifier,
        formData.password,
        formData.role
      );
      setIsLoading(false);

      // ✅ Navigate based on role
      if (formData.role === "student") {
        navigate("/student-dashboard");
      } else if (formData.role === "teacher") {
        navigate("/teacher-dashboard"); // optional
      } else if (formData.role === "admin_ngo") {
        navigate("/admin-dashboard"); // optional
      }
    }, 1500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // fake api call for now
    setTimeout(() => {
      console.log('Register attempt with:', formData.fullName, formData.email, formData.phoneNumber, formData.dob, formData.role, formData.password);
      setIsLoading(false);
      setActiveTab('login'); // Redirect to login reg ke baad
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-emerald-50 relative">
      <div className="absolute inset-0">
        <div className="absolute w-[900px] h-[480px] bg-blue-200 opacity-70 rounded-full blur-[200px] top-[10%] left-[10%]"></div>
        <div className="absolute w-[900px] h-[480px] bg-emerald-200 opacity-70 rounded-full blur-[200px] bottom-[10%] right-[10%]"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {/* Header outside the card */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-1">
            Welcome to SarvaShiksha
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Quality education for every child, everywhere.
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white rounded-3xl border-2 border-gray-200 shadow-xl p-6 sm:p-8">
          {/* Tab Buttons */}
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
                    value={formData.loginIdentifier}
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
                    value={formData.password}
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
                      {formData.role ? roles.find(r => r.value === formData.role).label : 'Select your role'}
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
                    value={formData.fullName}
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
                    value={formData.email}
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
                    value={formData.phoneNumber}
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
                    value={formData.dob}
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
                      {formData.role ? roles.find(r => r.value === formData.role).label : 'Select your role'}
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
                  {formData.role === 'student' && (
                    <div className="mt-2 text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg" role="alert">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.754 1.34-1.242 3.099-2.774 2.193L9.53 12.24l-3.376 2.76A.75.75 0 014 14.25v-8.5a.75.75 0 011.25-.561l3.507 2.871z" clipRule="evenodd" />
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
                    value={formData.password}
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
                    value={formData.confirmPassword}
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

export default App;
