import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/Auth/AuthPage.jsx";
import StudentDashboard from "./components/Dashboard/StudentDashboard.jsx";
import LessonDetail from "./components/Lesson/LessonDetail.jsx";
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="p-4">Home Page</div>} /> {/* khajuria add home page link*/}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lesson/:id" element={<LessonDetail />} /> {/* Added Lesson Detail route */}
      </Routes>
    </Router>
  );
}

export default App;
