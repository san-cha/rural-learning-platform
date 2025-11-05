import { Link, useNavigate, Outlet } from "react-router-dom";
import Button from "./ui/Button.jsx";
import {
  Home,
  BookCopy,
  Users,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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

const TeacherLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* SIDEBAR */}
      <div className="hidden border-r bg-blue-900 text-white md:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <Link to="/teacher-dashboard" className="flex items-center gap-2 font-semibold">
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
            <Link to="/teacher-settings" className="w-full mb-2 block">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col bg-slate-50">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30">
          <h1 className="text-xl font-semibold flex-1">Teacher Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              Welcome, {user?.name || "Teacher"}
            </span>
          </div>
        </header>

        {/* Outlet for child routes */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

