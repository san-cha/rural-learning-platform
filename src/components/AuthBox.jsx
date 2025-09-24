// src/components/AuthBox.jsx
import React from "react";
import { Link } from "react-router-dom";
export default function AuthBox({ children }) {
  return (
    <div className="auth-box">
      {children}
      <div className="auth-footer">
        <p>
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
