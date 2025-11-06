import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosInstance.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Library, ArrowLeft, Search, Check, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx'; // Using your Button component

const FindClasses = () => {
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- NEW STATE ---
  // This will hold the IDs of classes the student is ALREADY in
  const [enrolledClassIds, setEnrolledClassIds] = useState(new Set());
  // This tracks which button is loading (e.g., '605c...')
  const [enrollingId, setEnrollingId] = useState(null); 
  // This shows success/error messages
  const [statusMessage, setStatusMessage] = useState({ msg: '', type: '' }); 

  useEffect(() => {
    // Fetch BOTH all classes AND the classes the user is enrolled in
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setStatusMessage({ msg: '', type: '' });

        // We run both requests at the same time
        const [allClassesRes, enrolledRes] = await Promise.all([
          axios.get("/student/all-classes"), // From our last step
          axios.get("/student/classes")      // From your dashboard
        ]);

        setAllClasses(allClassesRes.data);
        setFilteredClasses(allClassesRes.data);
        
        // Create a Set of IDs for fast lookup (e.g., {'id1', 'id2'})
        const enrolledIds = new Set(enrolledRes.data.classes.map(c => c._id));
        setEnrolledClassIds(enrolledIds);

      } catch (err) {
        console.error("Error fetching data:", err);
        setStatusMessage({ msg: 'Could not load class data.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter logic (no change)
  useEffect(() => {
    const results = allClasses.filter(klass => 
      klass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      klass.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(results);
  }, [searchTerm, allClasses]);

  // --- NEW: Handle Enroll Function ---
  const handleEnroll = async (enrollmentCode, classId) => {
    setEnrollingId(classId); // Show loading spinner on this card
    setStatusMessage({ msg: '', type: '' });

    try {
      // Your backend route already handles all the logic!
      const res = await axios.post("/student/enroll", { enrollmentCode });

      // Success!
      setStatusMessage({ msg: res.data.msg || 'Successfully enrolled!', type: 'success' });
      
      // Add this class to our "enrolled" list to update its button
      setEnrolledClassIds(prevIds => new Set(prevIds).add(classId));

    } catch (err) {
      // The backend sends a 400 if already enrolled, but our UI
      // should prevent this. This is for other errors.
      const msg = err.response?.data?.msg || "An error occurred.";
      setStatusMessage({ msg, type: 'error' });
    } finally {
      setEnrollingId(null); // Stop loading spinner
    }
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-2xl font-semibold text-gray-700">Loading Available Classes...</div>
      </div>
    );
  }

  // Main UI
  return (
    // --- FIX 1: Changed bg-white to bg-slate-50 ---
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <header className="flex h-16 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30">
        <Link 
          to="/student-dashboard" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-semibold flex-1">Find a New Class</h1>
      </header>
      
      {/* Main Content */}
      <main className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
        
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by class name or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
            />
          </div>

          {/* --- NEW: Status Message Bar --- */}
          {statusMessage.msg && (
            <div 
              className={`flex items-center gap-3 p-4 mb-6 rounded-lg ${
                statusMessage.type === 'error' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              <span className="font-medium">{statusMessage.msg}</span>
            </div>
          )}

          {/* Class List */}
          {filteredClasses.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700">No classes found</h2>
              <p className="text-gray-500 mt-2">
                {searchTerm 
                  ? "Try adjusting your search terms." 
                  : "There are no classes available to join right now. Please check back later!"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((klass) => {
                
                // --- NEW LOGIC: Check if student is already enrolled ---
                const isEnrolled = enrolledClassIds.has(klass._id);
                const isThisCardLoading = enrollingId === klass._id;

                return (
                  <div key={klass._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col">
                    <div className="p-6 flex-grow">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{klass.name}</h2>
                        <p className="text-sm text-gray-600 mb-4 h-16 overflow-auto">
                          {klass.description || 'No description provided.'}
                        </p>
                        <div className="text-sm font-medium text-gray-800">
                          Taught by: <span className="font-bold text-blue-600">{klass.teacherName}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* --- FIX 2: Replaced code display with an Enroll Button --- */}
                    <div className="p-4 m-4">
                      <Button
                        onClick={() => handleEnroll(klass.enrollmentCode, klass._id)}
                        disabled={isEnrolled || isThisCardLoading}
                        className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2
                          ${isEnrolled 
                            ? 'bg-green-100 text-green-700 cursor-default' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:-translate-y-0.5'
                          }
                          ${isThisCardLoading ? 'opacity-50 cursor-wait' : ''}
                        `}
                      >
                        {isThisCardLoading 
                          ? 'Enrolling...' 
                          : (isEnrolled ? (
                              <><Check className="h-5 w-5" /> Enrolled</>
                            ) : (
                              'Enroll Now'
                            )
                          )
                        }
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FindClasses;