// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AuthPage from "./pages/AuthPage.jsx";
// import StudentDashboard from "./modules/student/StudentDashboard.jsx";
// import LessonDetail from "./modules/student/LessonDetail.jsx";
// import Assessment from './modules/student/Assessment';
// import StudentCourses from './modules/student/StudentCourses';
// import StudentNotifications from './modules/student/StudentNotifications';
// import Landing from "./pages/Landing.jsx";
// import { AuthProvider } from "./contexts/AuthContext.jsx";
// import TeacherDashboard from "./modules/teacher/TeacherDashboard.jsx";
// import TeacherClasses from "./modules/teacher/TeacherClasses.jsx";
// import AdminDashboard from "./modules/admin/AdminDashboard.jsx";
// import About from './pages/About.jsx';
// import Contact from './pages/Contact.jsx';
// import ErrorPage from "./pages/Error.jsx";
// import ProtectedRoute from './components/ProtectedRoute';
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Landing />} /> {/* khajuria add home page link*/}
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/auth" element={<AuthPage />} />
//           <Route path="/student-dashboard" element={<StudentDashboard />} />
//           <Route path="/lesson/:id" element={<LessonDetail />} /> {/* Added Lesson Detail route */}
//           <Route path="/assessment/:id" element={<Assessment />} /> {/* Added Assessment route */}
//           <Route path="/student-courses" element={<StudentCourses />} />
//           <Route path="/student-notifications" element={<StudentNotifications />} />
//           <Route path="/teacher-dashboard/*" element={<TeacherDashboard />} /> {/* Teacher Dashboard with nested routes */}
//           <Route path="/teacher-classes" element={<TeacherClasses />} />
//           <Route path="/admin-dashboard" element={<AdminDashboard />} />
//           {/* Catch-all route for 404 */}
//           <Route path="*" element={<ErrorPage />} />
//           {/* ... your public routes like '/' and '/auth' go here ... */}

//           {/* This is the part you need for a protected route */}
//           <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
//             <Route path="/admin-dashboard" element={<AdminDashboard />} />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import StudentDashboard from "./modules/student/StudentDashboard.jsx";
import LessonDetail from "./modules/student/LessonDetail.jsx";
import Assessment from "./modules/student/Assessment";
import StudentCourses from "./modules/student/StudentCourses";
import StudentNotifications from "./modules/student/StudentNotifications";
import Landing from "./pages/Landing.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import TeacherDashboard from "./modules/teacher/TeacherDashboard.jsx";
import TeacherClasses from "./modules/teacher/TeacherClasses.jsx";
import AdminDashboard from "./modules/admin/AdminDashboard.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import ErrorPage from "./pages/Error.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
// NOTE: keep this link tag in index.html or public/index.html for correct HTML placement
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Public student pages (if you want these protected, wrap with ProtectedRoute below) */}
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/student-courses" element={<StudentCourses />} />
          <Route path="/student-notifications" element={<StudentNotifications />} />



          {/* Teacher pages (example: protect teacher dashboard & classes) */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            {/* teacher-dashboard/* keeps nested routes if TeacherDashboard defines <Routes> inside */}
            <Route path="/teacher-dashboard/*" element={<TeacherDashboard />} />
            <Route path="/teacher-classes" element={<TeacherClasses />} />
          </Route>

          {/* Admin pages */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Student-protected routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Fallback / 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
