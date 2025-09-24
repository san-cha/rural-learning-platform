import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthPage } from "./components/Auth/AuthPage.jsx";

function App() {
  const [user, setUser] = useState(null); // state hook

  return (
    <AuthProvider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
