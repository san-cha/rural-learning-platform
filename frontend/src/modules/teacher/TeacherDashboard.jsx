import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/button";
import {
  Home,
  BookCopy,
  Users,
  Bell,
  Settings,
  PlusCircle,
  FileText,
  CheckSquare,
  Video,
  FileAudio,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

import axios from "../../api/axiosInstance.jsx";

// Placeholder content list kept, but will later be backed by real uploads endpoint if available
const content = [];

// Helper
const getIconForType = (type) => {
  if (type === "Audio") return <FileAudio className="h-5 w-5 text-orange-500" />;
  if (type === "Video") return <Video className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5 text-blue-500" />;
};

// Sidebar link component
const SidebarLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 transition-all hover:text-white hover:bg-slate-700/50"
  >
    <Icon className="h-5 w-5" />
    {children}
  </Link>
);

const TeacherDashboard = () => {
  const { logout, user } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/teacher/classes");
        setClasses(res.data.classes || []);
      } catch (e) {
        setClasses([]);
      }
    };
    fetchClasses();
  }, []);

  const totals = useMemo(() => {
    const totalStudents = classes.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);
    return { totalStudents };
  }, [classes]);

  const handleCreateClass = async () => {
    const name = window.prompt("Enter class name");
    if (!name) return;
    const description = window.prompt("Enter class description (optional)") || "";
    try {
      const res = await axios.post("/teacher/classes", { name, description });
      setClasses((prev) => [res.data.class, ...prev]);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* SIDEBAR */}
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
              <SidebarLink to="/teacher-dashboard" icon={Home}>Dashboard</SidebarLink>
              <SidebarLink to="/teacher-classes" icon={Users}>My Classes</SidebarLink>
              <SidebarLink to="/teacher-notifications" icon={Bell}>Notifications</SidebarLink>
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-slate-800">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col bg-slate-50">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30">
          <h1 className="text-xl font-semibold flex-1">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              Welcome, {teacherName}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
          {/* Overview Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={handleCreateClass}>
                <PlusCircle className="h-4 w-4" /> Create New
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totals.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across {classes.length} active classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Assignments to Grade</CardTitle>
                  <CheckSquare className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">For 'Algebra Worksheet'</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Uploaded Content</CardTitle>
                  <FileText className="h-5 w-5 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">27</div>
                  <p className="text-xs text-muted-foreground">12 Audio, 8 Videos, 7 PDFs</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* My Classes */}
          <Card>
            <CardHeader>
              <CardTitle>My Active Classes</CardTitle>
              <CardDescription>An overview of your current classes and their progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {classes.map((klass) => (
                <div key={klass._id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{klass.name}</p>
                    <p className="text-sm text-muted-foreground">{klass.enrolledStudents?.length || 0} Students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-blue-600">0%</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Content */}
          <Card>
            <CardHeader>
              <CardTitle>My Recent Content</CardTitle>
              <CardDescription>A list of lessons and materials you've recently uploaded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.map((item) => (
                <div key={item.title} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex-shrink-0">{getIconForType(item.type)}</div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.class}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{item.date}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
