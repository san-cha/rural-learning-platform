// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import StudentDashboard from "./modules/student/StudentDashboard.jsx";
import LessonDetail from "./modules/student/LessonDetail.jsx";
import Assessment from "./modules/student/Assessment.jsx";
import StudentCourses from "./modules/student/StudentCourses.jsx";
import StudentNotifications from "./modules/student/StudentNotifications.jsx";
import StudentSettings from "./modules/student/StudentSettings.jsx";
import StudentEnroll from "./modules/student/StudentEnroll.jsx";
import Landing from "./pages/Landing.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import TeacherLayout from "./components/TeacherLayout.jsx";
import TeacherDashboard from "./modules/teacher/TeacherDashboard.jsx";
import TeacherClasses from "./modules/teacher/TeacherClasses.jsx";
import TeacherCreateClass from "./modules/teacher/TeacherCreateClass.jsx";
import TeacherClassDetail from "./modules/teacher/TeacherClassDetail.jsx";
import TeacherGrades from "./modules/teacher/TeacherGrades.jsx";
import TeacherNotifications from "./modules/teacher/TeacherNotifications.jsx";
import TeacherSettings from "./modules/teacher/TeacherSettings.jsx";
import AdminDashboard from "./modules/admin/AdminDashboard.jsx";
import AdminSettings from "./modules/admin/AdminSettings.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import ErrorPage from "./pages/Error.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TechDashboard from './modules/technician/TechDashboard';

// NOTE: keep this link tag in index.html or public/index.html for correct HTML placement
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Public student pages */}
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/student-courses" element={<StudentCourses />} />
          <Route path="/student-notifications" element={<StudentNotifications />} />
          <Route path="/student-enroll" element={<StudentEnroll />} />

          {/* Teacher-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher-classes" element={<TeacherClasses />} />
              <Route path="/teacher-classes/:classId" element={<TeacherClassDetail />} />
              <Route path="/teacher-create-class" element={<TeacherCreateClass />} />
              <Route path="/teacher-grades/:id" element={<TeacherGrades />} />
              <Route path="/teacher-notifications" element={<TeacherNotifications />} />
              <Route path="/teacher-settings" element={<TeacherSettings />} />
            </Route>
          </Route>

          {/* Admin pages */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-settings" element={<AdminSettings />} />
          </Route>

          {/* Student-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-settings" element={<StudentSettings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
            <Route path="/tech-dashboard" element={<TechDashboard />} />
          </Route>

          {/* Fallback / 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
