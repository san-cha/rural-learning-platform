// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * ProtectedRoute
 * - If no user -> redirect to /auth (login)
 * - If allowedRoles provided -> check user.role is in allowedRoles
 *    - If not authorized -> redirect to '/' (or a 403 page)
 * - If authorized -> render nested routes via <Outlet />
 *
 * Usage:
 * <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
 *   <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
 * </Route>
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If allowedRoles provided, check user's role
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    // ensure your user object includes a `role` field (e.g. 'admin','teacher','student')
    const userRole = user.role || user?.roles || null;
    // if role stored differently, adapt above line accordingly

    // if role not present or not allowed
    if (!userRole || !allowedRoles.includes(userRole)) {
      // unauthorized - redirect to home or show 403 page
      return <Navigate to="/" replace />;
    }
  }

  // authorized
  return <Outlet />;
};

export default ProtectedRoute;
