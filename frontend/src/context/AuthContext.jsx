import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Use port 5001 because macOS may reserve port 5000 for system services (AirPlay/Control Center).
// You can also set REACT_APP_API_URL in your environment to override this.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null); // We can add user details later
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // For now, we'll just set a dummy user if token exists
      setUser({ token: token }); 
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({ token: newToken });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (name, email, password) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};