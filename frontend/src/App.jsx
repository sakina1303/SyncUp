import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Clubs from "./components/Clubs";
import ClubProfile from "./components/ClubProfile";
import Events from "./components/Events";
import { useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { user } = useAuth();
  // Send logged-in users to the Feed by default (previously went to Dashboard)
  return user ? <Navigate to="/feed" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes wrapped in MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubProfile />} />
        <Route path="/events" element={<Events />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      {/* Catch-all: redirect unknown paths to root to avoid blank/404 pages during client routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
