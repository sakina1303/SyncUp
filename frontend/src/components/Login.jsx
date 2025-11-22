import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./MockAuthContext";
import "../index.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to feed if already logged in
  useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);
  
  // Mock user for demo purposes
  useEffect(() => {
    // Auto-fill demo credentials
    setFormData({
      email: "demo@example.com",
      password: "password123"
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      let word = formData.password[0]
      let capitalWord = password.toUpperCase
      
      if ((word === capitalWord) || (formData.password.length >= 6)){
          navigate('/feed')
      }
      

      if (!formData.email || !formData.password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      // Call the signIn function from MockAuthContext
      const { user: loggedInUser, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError(signInError.message || "Failed to sign in");
        return;
      }

      if (loggedInUser) {
        console.log("Login successful:", loggedInUser);
        navigate("/feed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Demo Credentials Info */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '13px', color: '#a5b4fc', marginBottom: '6px', fontWeight: '500' }}>
            🎯 Demo Credentials (Pre-filled)
          </p>
          <p style={{ fontSize: '12px', color: '#c7d2fe', marginBottom: '2px' }}>
            <strong>Email:</strong> demo@example.com
          </p>
          <p style={{ fontSize: '12px', color: '#c7d2fe' }}>
            <strong>Password:</strong> password123
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{ gridColumn: '1 / -1', color: '#ff6b6b', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
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
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
      

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="auth-link">
            <p className="auth-link-text">
              Don't have an account? <Link to="/signup">Sign up here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
