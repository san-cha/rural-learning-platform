import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card"; // Assuming Card components are in this path
import Button from "../../components/ui/button"; // Assuming Button component is in this path
import {
  Home,
  BookCopy,
  Bell,
  Settings,
  LogOut,
  Library,
  BookCheck,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../api/axiosInstance.jsx";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [studentName, setStudentName] = useState("");
  const [classes, setClasses] = useState([]);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setStudentName(user?.name || "");
  }, [user]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/student/classes");
        setClasses(res.data.classes || []);
      } catch (e) {
        setClasses([]);
      }
    };
    fetchClasses();
  }, []);

  const SidebarLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 transition-all hover:text-white hover:bg-slate-700/50"
  >
    <Icon className="h-5 w-5" />
    {children}
  </Link>
);

  const handleLessonClick = (classId) => {
    navigate(`/lesson/${classId}`);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* --- SIDEBAR --- */}
      <div className="hidden border-r bg-blue-900 text-white md:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                <BookCopy className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg">SarvaShiksha</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <nav className="grid items-start px-4 text-sm font-medium">
              <SidebarLink to="/student-dashboard" icon={Home}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/student-courses" icon={Library}>
                My Courses
              </SidebarLink>
              <SidebarLink to="/student-notifications" icon={Bell}>
                Notifications
              </SidebarLink>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-slate-800">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col bg-slate-50">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30">
          <h1 className="text-xl font-semibold flex-1">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              Welcome, {studentName}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
          {/* Overview Cards */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Overview</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                  <BookCheck className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0/{classes.length}</div>
                  <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">Improvement from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <Library className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">Currently enrolled</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- My Courses Section --- */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
              <Link to="/student-courses" className="text-sm font-medium text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {classes.map((klass) => (
                <div
                  key={klass._id}
                  className="group relative rounded-xl border bg-white shadow-sm overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => handleLessonClick(klass._id)}
                >
                  <div className="h-40 overflow-hidden">
                    <div className="w-full h-full bg-slate-200" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-800">{klass.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          <span>{klass.enrolledStudents?.length || 0} students</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 group-hover:text-white"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  {/* Progress Badge */}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-blue-700">
                      0% Complete
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5">
                      <div className="bg-blue-500 h-1.5" style={{ width: `0%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;