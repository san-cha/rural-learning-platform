import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import StudentDashboard from "./modules/Student/StudentDashboard.jsx";
import LessonDetail from "./modules/Student/LessonDetail.jsx";
import Landing from "./pages/Landing.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} /> {/* khajuria add home page link*/}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lesson/:id" element={<LessonDetail />} /> {/* Added Lesson Detail route */}
      </Routes>
    </Router>
  );
}

export default App;
