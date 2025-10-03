import { Link, useLocation } from "react-router-dom";
import { BookOpen, Globe, Wifi, WifiOff, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-slate-600 font-medium";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-2 md:px-4">
        {/* Logo and Brand Name */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            SarvaShiksha
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm transition-colors hover:text-blue-600 ${getNavLinkClass(
              "/"
            )}`}
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Features
          </a>
          <Link
            to="/contact" // Use 'to' instead of 'href', and set the route path
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            Contact
          </Link>
        </nav>

        {/* Right-side Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
          </Button>

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-slate-400" />
                <span>Offline</span>
              </>
            )}
          </div>
          
          {/* Auth Button: Shows Login or Welcome Message */}
          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-medium text-slate-800">
                  Welcome, {user.name}
                </span>
                <Button onClick={logout} variant="outline" size="sm" className="rounded-full px-2 py-1 text-xs">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs text-white shadow-md hover:bg-blue-700"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;