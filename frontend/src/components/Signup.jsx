import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "./MockAuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to feed if already logged in
  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);
  
  // Auto-fill demo data for testing
  useEffect(() => {
    setFormData({
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      password: "password123",
      confirmPassword: "password123"
    });
  }, []);

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // password validation
  const validatePassword = (password, confirmPassword) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  // signup function
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    // Validate input
    if (!formData.firstName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    
    const passwordError = validatePassword(formData.password, formData.confirmPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call your signup API here
      // For demo, we'll just redirect to login
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us today and get started</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="auth-link">
            <p className="auth-link-text">
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
            <p className="auth-link-text">
              <Link to="/clubs">Browse Clubs</Link> • <Link to="/feed">View Feed</Link> • <Link to="/profile">View Demo Profile</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;