import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Circle,
  AlertCircle,
  Menu,
  X,
  Home,
  Loader
} from "lucide-react";

// Helper component for material icons
const MaterialIcon = ({ type, isCompleted }) => {
  if (isCompleted) {
    return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
  }
  if (type.includes('quiz') || type.includes('assignment') || type.includes('assessment')) {
    return <ClipboardCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
  }
  if (type.includes('video')) {
    return <PlayCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
  }
  if (type.includes('reading') || type.includes('pdf')) {
    return <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  }
  return <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />;
};

export default function LessonDetail() {
  const { id: classId } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [classDetails, setClassDetails] = useState(null);
  const [allClassContent, setAllClassContent] = useState([]); 
  const [completedMap, setCompletedMap] = useState(new Set());
  
  // UI states
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [markCompleteLoading, setMarkCompleteLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  // Fetch class content on mount
  useEffect(() => {
    const fetchClassContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/student/class/${classId}/content`);
        const { classDetails, content } = res.data;

        setClassDetails(classDetails);

        // Track completed items
        const completedIdSet = new Set();
        content.forEach(item => {
          if (item.isCompleted) {
            completedIdSet.add(item._id);
          }
        });

        setAllClassContent(content || []);
        setCompletedMap(completedIdSet);

        // Auto-select first item
        if (content && content.length > 0) {
          setSelectedMaterial(content[0]);
        }
        
      } catch (err) {
        console.error("Error fetching class content:", err);
        setError("Could not load class content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassContent();
  }, [classId]);

  // Get next material in the list
  const getNextMaterial = () => {
    if (!selectedMaterial) return null;
    
    const currentIndex = allClassContent.findIndex(m => m._id === selectedMaterial._id);
    if (currentIndex >= 0 && currentIndex < allClassContent.length - 1) {
      return allClassContent[currentIndex + 1];
    }
    
    return null;
  };

  // Mark current material as complete
  const handleMarkComplete = async () => {
    if (!selectedMaterial) return;

    setMarkCompleteLoading(true);
    setError(null);

    try {
      await axios.post(`/student/material/${selectedMaterial._id}/complete`);
      
      // Update UI
      setCompletedMap(prev => new Set(prev).add(selectedMaterial._id));

      // Auto-advance
      const nextMaterial = getNextMaterial();
      if (nextMaterial) {
        setSelectedMaterial(nextMaterial);
      }
      
    } catch (err) {
      console.error("Error marking complete:", err);
      setError("Could not save your progress. Please try again."); 
      setTimeout(() => setError(null), 5000);
    } finally {
      setMarkCompleteLoading(false);
    }
  };

  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold">
           <BookOpen className="w-5 h-5 text-blue-600" />
           <span className="text-lg text-gray-800 truncate">
             {classDetails?.name || 'Class Content'}
           </span>
        </div>
        <button 
          className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 py-4 px-4 space-y-4 overflow-y-auto">
        {allClassContent.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            No content has been added to this class yet.
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              All Class Content
            </h3>
            <div className="space-y-1">
              {allClassContent.map((material) => {
                const isSelected = selectedMaterial?._id === material._id;
                const isCompleted = completedMap.has(material._id);

                return (
                  <button
                    key={material._id}
                    onClick={() => {
                      setSelectedMaterial(material);
                      setSidebarOpen(false); 
                    }}
                    className={`flex items-start w-full gap-3 rounded-lg px-3 py-3 text-left transition-all
                      ${isSelected 
                        ? 'bg-blue-100 text-blue-700 font-semibold shadow-inner' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="pt-0.5">
                      <MaterialIcon type={material.type} isCompleted={isCompleted} />
                    </div>
                    <span className="leading-tight">{material.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );

  // Main content area component
  const MainContent = () => {
    if (!selectedMaterial) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Welcome to your class!</h2>
          <p className="text-gray-500 mt-2">Select a lesson from the sidebar to get started.</p>
        </div>
      );
    }

    const { type = 'unknown', title, content, videoUrl, materialUrl, _id } = selectedMaterial;
    const isCompleted = completedMap.has(_id);
    const nextMaterial = getNextMaterial();
    
    const isQuiz = type.includes('quiz') || type.includes('assignment') || type.includes('assessment');

    return (
      <div className="p-4 sm:p-8 flex-grow flex flex-col max-w-4xl mx-auto w-full h-full">
        
        {error && !isLoading && (
            <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{error}</span>
            </div>
        )}
        
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 flex-shrink-0">{title}</h1>

        <div className="bg-white rounded-2xl shadow-xl mb-6 flex-grow overflow-y-auto">
          
          {/* Video Content */}
          {type.includes('video') && (
            <div className="w-full">
              <iframe 
                src={videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                title={title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-[400px] sm:h-[500px] rounded-t-2xl" 
              ></iframe>
              {content && (
                  <div className="p-8 prose prose-lg max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
              )}
            </div>
          )}
          
          {/* Reading/PDF Content */}
          {(type.includes('reading') || type.includes('pdf')) && (
            <div className="p-8 prose prose-lg max-w-none">
                <h2>{type.includes('pdf') ? 'Document View' : 'Reading Content'}</h2>
                <div dangerouslySetInnerHTML={{ 
                    __html: content || '<p class="text-gray-500 italic">No detailed content provided for this material.</p>' 
                }} />
                
                {materialUrl && (
                    <div className="mt-6 border-2 border-gray-300 rounded-lg overflow-hidden">
                        <iframe 
                            src={materialUrl}
                            title={title}
                            className="w-full h-[600px]"
                            frameBorder="0"
                        />
                        <p className="p-4 bg-gray-50 border-t">
                            <a href={materialUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Open in New Tab
                            </a>
                        </p>
                    </div>
                )}
            </div>
          )}
          
          {/* Quiz/Assignment View */}
          {isQuiz && (
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[50vh]">
              <ClipboardCheck className="w-16 h-16 text-indigo-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                {content || `This is a ${type.replace('-', ' ')}. Click below to start or view your submission.`}
              </p>
              <Button 
                onClick={() => navigate(`/assessment-submission/${_id}`)} 
                className="bg-indigo-600 text-white font-bold py-3 px-8 text-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                Start / View {isCompleted ? 'Grade' : 'Assessment'}
              </Button>
            </div>
          )}
          
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-lg mt-auto flex-shrink-0">
          <div className="flex-1">
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                Completed
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!isQuiz && (
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted || markCompleteLoading}
                className={`font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-md
                  ${isCompleted 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200' 
                    : 'bg-green-600 text-white hover:bg-green-700'}`
                }
              >
                {markCompleteLoading 
                  ? 'Saving...' 
                  : (isCompleted ? 'Completed' : 'Mark as Complete')
                }
              </Button>
            )}
            
            {nextMaterial && (
              <Button
                onClick={() => {
                  if (!isQuiz && !isCompleted) {
                    handleMarkComplete(); 
                  } else {
                    setSelectedMaterial(nextMaterial);
                  }
                }}
                disabled={markCompleteLoading}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            {!nextMaterial && isCompleted && (
                <div className="text-gray-500 flex items-center px-4 font-medium">
                    You've finished all class content!
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700">Loading Your Classroom...</h1>
      </div>
    );
  }

  if (error && !classDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Class</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/student-dashboard">
          <Button className="bg-blue-600 text-white px-6 py-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between h-16 border-b bg-white px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
        
        <div className="flex items-center">
            <button 
                className="p-1 text-gray-700 hover:bg-gray-100 rounded-md lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                {classDetails?.name || 'Classroom'}
            </h1>
            <span className="hidden md:inline text-sm text-gray-500 ml-4">
                (Taught by: <span className="font-semibold text-gray-700">{classDetails?.teacherName || 'Teacher'}</span>)
            </span>
        </div>

        <Link to="/student-dashboard">
            <Button 
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-md"
            >
                <span className="hidden sm:inline">Back to Dashboard</span>
                <Home className="w-4 h-4" />
            </Button>
        </Link>
      </header>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-4rem)]">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block col-span-1 bg-white border-r border-gray-200 h-full overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          >
            <aside 
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r h-full shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            >
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="col-span-1 lg:col-span-3 bg-slate-100 h-full overflow-y-auto flex flex-col">
          <MainContent />
        </main>
      </div>
    </div>
  );
}