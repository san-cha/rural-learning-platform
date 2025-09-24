import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/Auth/AuthPage.jsx";
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="p-4">Home Page</div>} /> {/* khajuria add home page link*/}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/studentdash" element={<div className="p-4">Dash</div>} />{/* chavan std dash link*/}
      </Routes>
    </Router>
  );
}

export default App;
