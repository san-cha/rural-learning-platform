import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import StudentDashboard from "./modules/student/StudentDashboard.jsx";
import LessonDetail from "./modules/student/LessonDetail.jsx";
import Landing from "./pages/Landing.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import About from './pages/about';
import Contact from './pages/contact';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} /> {/* khajuria add home page link*/}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/lesson/:id" element={<LessonDetail />} /> {/* Added Lesson Detail route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
