import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// --- FIX: Using a NAMED import with curly braces from the CORRECT file ---
import { lessons } from '../../data/courseData.js'; 
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

// --- Helper Component: Course Card ---
const CourseCard = ({ lesson }) => {
  const navigate = useNavigate();
  return (
    <div
      className="group relative rounded-xl border bg-white shadow-sm overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/lesson/${lesson.id}`)}
    >
      <div className="h-40 overflow-hidden">
        <img
          src={lesson.imageUrl}
          alt={lesson.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 truncate">{lesson.title}</h3>
        <p className="text-sm text-slate-500 h-10 mt-1">{lesson.description.substring(0, 60)}...</p>
      </div>
      {/* Progress Bar */}
      <div className="px-4 pb-4">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Progress</span>
              <span>{lesson.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${lesson.progress}%` }}></div>
          </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function StudentCourses() {
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress_desc');

  const filteredAndSortedLessons = useMemo(() => {
    // Safety check to ensure `lessons` is a valid array.
    if (!Array.isArray(lessons)) {
      return [];
    }

    return lessons
      .filter(lesson => {
        // Safety check for title property
        if (!lesson || !lesson.title) return false;
        return lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'progress_desc':
            return b.progress - a.progress;
          case 'progress_asc':
            return a.progress - b.progress;
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          default:
            return 0;
        }
      });
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header 
        user={{ name: "Sanjana Chavan" }} 
        currentLanguage={language} 
        onLanguageChange={setLanguage} 
      />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">My Courses</h1>
                <p className="text-slate-500 mt-1">All your enrolled courses in one place.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <input 
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                 <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                >
                    <option value="progress_desc">Sort by Progress (High to Low)</option>
                    <option value="progress_asc">Sort by Progress (Low to High)</option>
                    <option value="title_asc">Sort by Title (A-Z)</option>
                </select>
            </div>
        </div>

        {/* Courses Grid */}
        {filteredAndSortedLessons.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedLessons.map(lesson => (
                    <CourseCard key={lesson.id} lesson={lesson} />
                ))}
            </div>
        ) : (
            <div className="text-center col-span-full py-16 bg-white rounded-lg shadow-sm">
                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Courses Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Your search for "{searchTerm}" did not match any courses.
                </p>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}