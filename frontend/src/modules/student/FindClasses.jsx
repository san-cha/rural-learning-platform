import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Correct path

const FindClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the logged-in user

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        // This is the new backend route we are about to build
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/student/all-classes`,
          { withCredentials: true }
        );
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Could not load available classes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">Loading Classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Find a Class</h1>
          <Link 
            to="/student-dashboard" 
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
        
        {classes.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-700">No classes found</h2>
            <p className="text-gray-500 mt-2">There are no classes available to join right now. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((klass) => (
              <div key={klass._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{klass.name}</h2>
                    <p className="text-sm text-gray-600 mb-4 h-16 overflow-hidden">
                      {klass.description || 'No description provided.'}
                    </p>
                    <div className="text-sm font-medium text-gray-800">
                      Taught by: <span className="font-bold text-blue-600">{klass.teacherName || 'Awaiting Teacher'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm font-semibold text-blue-800">ENROLLMENT CODE</p>
                    <p className="text-3xl font-bold text-blue-600 tracking-widest my-2">
                      {klass.enrollmentCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Use this code on your dashboard to enroll.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindClasses;