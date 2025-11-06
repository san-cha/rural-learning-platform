import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * ProtectedRoute
 * - If no user -> redirect to /auth (login)
 * - If allowedRoles provided -> check user.role is in allowedRoles
 * - If not authorized -> redirect to '/' (or a 403 page)
 * - If authorized -> render nested routes via <Outlet />
 *
 * Usage:
 * <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
 * <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
 * </Route>
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Get current URL location

  if (loading) {
    return null;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // === MODIFICATION 1: Moved userRole definition up ===
  // Define userRole here so we can use it for both checks
  const userRole = user.role || user?.roles || null;

  // If allowedRoles provided, check user's role
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    // ensure your user object includes a `role` field (e.g. 'admin','teacher','student')
    // if role stored differently, adapt above line accordingly

    // if role not present or not allowed
    if (!userRole || !allowedRoles.includes(userRole)) {
      // unauthorized - redirect to home or show 403 page
      return <Navigate to="/" replace />;
    }
  }

  // === MODIFICATION 2: Added Student Onboarding Logic ===
  // This logic runs AFTER the role check
  if (userRole === 'student') {
    const gradeIsSet = user.grade !== null && user.grade !== undefined;

    if (!gradeIsSet && location.pathname !== '/setup-grade') {
      // If student's grade is NOT set and they are trying to go
      // ANYWHERE ELSE, force them to the setup page.
      return <Navigate to="/setup-grade" replace />;
    }

    if (gradeIsSet && location.pathname === '/setup-grade') {
      // If student's grade IS set, do NOT let them
      // visit the setup page again. Send them to their dashboard.
      return <Navigate to="/student-dashboard" replace />;
    }
  }
  // === END OF MODIFICATION 2 ===


  // authorized
  return <Outlet />;
};

export default ProtectedRoute;