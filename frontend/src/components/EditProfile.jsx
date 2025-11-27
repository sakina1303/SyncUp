import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    title: "",
    avatar_url: "",
  });

  // Clubs state
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState("");

  // Load mock data on mount
  useEffect(() => {
    if (user) {
      // Mock clubs data
      const mockClubs = [
        {
          id: 1,
          name: "Coding Club",
          description: "A club for coding enthusiasts",
          icon: "💻",
        },
        {
          id: 2,
          name: "Art Collective",
          description: "Express yourself through art",
          icon: "🎨",
        },
        {
          id: 3,
          name: "Debate Society",
          description: "Sharpen your public speaking skills",
          icon: "🎤",
        },
        {
          id: 4,
          name: "Music Club",
          description: "For music lovers and musicians",
          icon: "🎵",
        },
      ];

      setFormData({
        full_name: user?.name || user?.email?.split("@")[0] || "",
        bio: user?.bio || "",
        title: "",
        avatar_url: user?.profile_pic_url || "",
      });
      setAvatarPreview(user?.profile_pic_url || "");

      // Set mock clubs
      setAllClubs(mockClubs);

      // Set mock selected clubs (user is member of first 2 clubs)
      setSelectedClubs([1, 2]);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClubToggle = (clubId) => {
    setSelectedClubs((prev) =>
      prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      setError("");

      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        setUploading(false);
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        setUploading(false);
        return;
      }

      // Mock upload - create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const publicUrl = reader.result;
        setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
        setAvatarPreview(publicUrl);
        setMessage("Avatar uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload avatar");
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-container">
          <div className="edit-profile-header">
            <h1 className="profile-name">Edit Profile</h1>
            <button onClick={() => navigate("/profile")} className="cancel-btn">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="edit-profile-form">
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {/* Avatar Upload Section */}
            <div className="form-section">
              <h3 className="section-title">Profile Photo</h3>
              <div className="avatar-upload-section">
                <div className="avatar-preview">
                  <img
                    src={
                      avatarPreview ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        formData.full_name || user?.email
                      )}&background=6366f1&color=fff&size=150`
                    }
                    alt="Avatar preview"
                    className="avatar-image"
                  />
                </div>
                <div className="avatar-upload-controls">
                  <label htmlFor="avatar-upload" className="upload-btn">
                    {uploading ? "Uploading..." : "Change Photo"}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  <p className="upload-hint">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>

              <div className="form-group">
                <label htmlFor="full_name" className="form-label">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="form-input"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title / Year
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, 2nd Year"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  About Me
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  maxLength="500"
                />
                <p className="char-count">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>

            {/* Clubs Selection Section */}
            <div className="form-section">
              <h3 className="section-title">My Clubs</h3>
              <p className="section-description">
                Select the clubs you're a member of
              </p>
              <div className="clubs-selection-grid">
                {allClubs.map((club) => (
                  <label key={club.id} className="club-checkbox-card">
                    <input
                      type="checkbox"
                      checked={selectedClubs.includes(club.id)}
                      onChange={() => handleClubToggle(club.id)}
                      className="club-checkbox"
                    />
                    <div className="club-checkbox-content">
                      <span className="club-icon-large">{club.icon}</span>
                      <h4 className="club-checkbox-name">{club.name}</h4>
                      <p className="club-checkbox-description">
                        {club.description}
                      </p>
                    </div>
                    <div className="checkbox-indicator">
                      {selectedClubs.includes(club.id) && (
                        <span className="checkmark">✓</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={loading || uploading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
