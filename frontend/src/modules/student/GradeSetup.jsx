import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// We are in src/modules/student/, so we go up two levels for contexts
import { useAuth } from '../../contexts/AuthContext.jsx'; 
import axios from 'axios';

// --- Helper function (No changes) ---
const calculateSuggestedGrade = (dob) => {
  if (!dob) return 1;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Logic: Grade 1 @ 6, Grade 2 @ 7, etc.
    if (age <= 6) return 1;
    if (age === 7) return 2;
    if (age === 8) return 3;
    if (age === 9) return 4;
    if (age === 10) return 5;
    if (age === 11) return 6;
    if (age === 12) return 7;
    if (age === 13) return 8;
    if (age === 14) return 9;
    if (age === 15) return 10;
    if (age === 16) return 11;
    if (age >= 17) return 12;
    
    return 1; // Default for very young or error
  } catch (error) {
    console.error("Error calculating age:", error);
    return 1;
  }
};

const GradeSetup = () => {
  const navigate = useNavigate();
  // We still get the base user and fetchUser function from context
  const { user, fetchUser } = useAuth(); 
  
  // === NEW STATE ===
  // We will store the full user details here
  const [fullUser, setFullUser] = useState(null); 
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showGradeList, setShowGradeList] = useState(false);
  
  // === NEW useEffect to fetch full user data ===
  useEffect(() => {
    const fetchFullUserData = async () => {
      if (!user) return; // Wait for context to provide the basic user
      
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_FRONTEND_URL}/auth/me`,
          { withCredentials: true }
        );
        setFullUser(res.data); // Save the full user data
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setError("Could not load your profile. Please refresh.");
      } finally {
        setIsPageLoading(false);
      }
    };
    
    fetchFullUserData();
  }, [user]); // Run this when the basic user context loads

  // === MODIFIED: Calculate grade from our new 'fullUser' state ===
  const suggestedGrade = useMemo(() => {
    return calculateSuggestedGrade(fullUser?.dob);
  }, [fullUser?.dob]);

  const [selectedGrade, setSelectedGrade] = useState(suggestedGrade);

  // Update selectedGrade if the suggestion changes
  useEffect(() => {
    setSelectedGrade(suggestedGrade);
  }, [suggestedGrade]);

  // This shows a loading screen while we fetch the full user data
  if (isPageLoading || !fullUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        Loading your profile...
      </div>
    );
  }
  
  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
  };

  // This function saves the grade to the backend
  const handleSubmitGrade = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // === THIS IS THE CORRECTED URL (no /api) ===
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/student/set-grade`, 
        { grade: selectedGrade },
        { withCredentials: true } // This sends the auth cookie
      );
      
      if (fetchUser) {
        await fetchUser(); 
      }
      
      navigate('/student-dashboard');
      
    } catch (err) {
      console.error("Error saving grade:", err);
      setError(err.response?.data?.message || "Failed to save your grade. Please try again.");
      setIsSubmitting(false);
    }
  };

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // --- UI (No changes) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10">
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-2">
              Welcome, {fullUser.name || 'Student'}!
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Let's set up your learning level.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-blue-800 opacity-70">
              Based on your age, we suggest you're in:
            </p>
            <h2 className="text-5xl font-bold text-blue-600 my-3">
              Grade {suggestedGrade}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Is this the right grade for you?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  handleGradeSelect(suggestedGrade);
                  setShowGradeList(false);
                }}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]
                  ${!showGradeList 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Yes, that's right
              </button>
              
              <button
                onClick={() => setShowGradeList(true)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]
                  ${showGradeList 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                No, let me choose
              </button>
            </div>
          </div>
          
          {showGradeList && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please select your grade level:
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => handleGradeSelect(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSubmitGrade}
              disabled={isSubmitting}
              className="w-full py-4 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : `Start Learning in Grade ${selectedGrade}`}
            </button>
            
            {error && (
              <p className="text-sm text-red-600 text-center mt-4">{error}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GradeSetup;