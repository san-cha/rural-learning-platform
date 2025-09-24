import React, { useState } from "react";
import AuthBox from "../components/AuthBox";
export default function LandingPage() {
  const [showAbout, setShowAbout] = useState(false);

  const handleAboutClick = () => {
    setShowAbout((prev) => !prev);
  };

  return (
    <div className="landing-container">
      <div className="main-content">
        <h1 className="landing-title">InspiredToLearn</h1>
        <div className="feature-grid">
          <div
            className="feature-card"
            id="aboutBtn"
            onClick={handleAboutClick}
            style={{ cursor: "pointer" }}
          >
            About US
          </div>
        </div>
        {showAbout && (
          <p className="about-paragraph">
            InspiredToLearn is a platform dedicated to helping you achieve your learning goals through interactive resources and a supportive community.
          </p>
        )}
      </div>

      {/* Right side login/signup */}
      <div className="auth-section">
        <AuthBox>
          <h2>Welcome</h2>
          <p>Please login or signup to continue</p>
        </AuthBox>
      </div>
    </div>
  );
}
