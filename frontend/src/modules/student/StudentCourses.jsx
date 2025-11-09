import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import axios from '../../api/axiosInstance.jsx';

// --- Helper Component: Course Card ---
const CourseCard = ({ klass }) => {
  const navigate = useNavigate();
  return (
    <div
      className="group relative rounded-xl border bg-white shadow-sm overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/lesson/${klass._id}`)}
    >
      <div className="h-40 overflow-hidden">
        <div className="w-full h-full bg-slate-200" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 truncate">{klass?.name || 'Unnamed Class'}</h3>
        <p className="text-sm text-slate-500 h-10 mt-1">{(klass?.description || '').substring(0, 60)}</p>
      </div>
      {/* Progress Bar */}
      <div className="px-4 pb-4">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Progress</span>
              <span>0%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `0%` }}></div>
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
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    const fetchClasses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/student/classes`);
        if (!isActive) return;
        setClasses(Array.isArray(res?.data?.classes) ? res.data.classes : []);
      } catch (e) {
        if (!isActive) return;
        setError('Failed to load courses');
        setClasses([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchClasses();
    return () => { isActive = false; };
  }, []);

  const filteredAndSorted = useMemo(() => {
    const list = Array.isArray(classes) ? classes : [];
    return list
      .filter(klass => (klass?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortBy) {
          case 'title_asc':
            return (a?.name || '').localeCompare(b?.name || '');
          default:
            return 0;
        }
      });
  }, [classes, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header 
        user={{ name: "Sanjana Chavan" }} 
        currentLanguage={language} 
        onLanguageChange={setLanguage} 
      />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/student-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
          <Link to="/student-enroll" className="text-sm text-blue-600 hover:underline">Enroll in a Class</Link>
        </div>
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
        {loading && <div>Loading...</div>}
        {error && !loading && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        {!loading && filteredAndSorted.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map(klass => (
              <CourseCard key={klass._id} klass={klass} />
            ))}
          </div>
        )}
        {!loading && !error && filteredAndSorted.length === 0 && (
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