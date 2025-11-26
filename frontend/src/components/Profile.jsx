import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { API_BASE_URL, useAuth } from "../context/AuthContext";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("clubs");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.user_id) {
        setLoading(false);
        setPosts([]);
        setClubs([]);
        return;
      }

      try {
        setLoading(true);
        setProfileError("");
        const response = await axios.get(`${API_BASE_URL}/api/posts`);
        const userPosts = (response.data || []).filter(
          (post) => post.user_id === authUser.user_id
        );
        setPosts(userPosts);
        setClubs([]);
      } catch (err) {
        setProfileError(
          err.response?.data?.error || "Failed to load your profile data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authUser?.user_id, API_BASE_URL]);

  const user = {
    name: authUser?.name || authUser?.email?.split("@")[0] || "User",
    title: "Student",
    bio: authUser?.bio || "Welcome to my profile!",
    avatar:
      authUser?.profile_pic_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        authUser?.name || authUser?.email || "User"
      )}&background=6366f1&color=fff&size=150`,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="profile-page-wrapper">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="profile-header-content">
              <div className="profile-header-main">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="profile-avatar-img"
                />
                <div className="profile-header-text">
                  <h1 className="profile-name-text">{user.name}</h1>
                  <p className="profile-title-text">{user.title}</p>
                  <p className="profile-bio-text">{user.bio}</p>
                </div>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="profile-edit-button"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs-card">
            <div className="profile-tabs-header">
              <button
                onClick={() => setActiveTab("clubs")}
                className={`profile-tab-button ${
                  activeTab === "clubs" ? "active" : ""
                }`}
              >
                My Clubs
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`profile-tab-button ${
                  activeTab === "posts" ? "active" : ""
                }`}
              >
                My Posts
              </button>
            </div>

            {/* Tab Content */}
            <div className="profile-tab-content">
              {profileError && (
                <p className="profile-error-message">{profileError}</p>
              )}
              {activeTab === "clubs" && (
                <div className="profile-clubs-grid">
                  {clubs.length > 0 ? (
                    clubs.map((club) => (
                      <div
                        key={club.id}
                        className="profile-club-card"
                        onClick={() => navigate(`/clubs/${club.id}`)}
                      >
                        <img
                          src={club.logo_url}
                          alt={club.name}
                          className="profile-club-logo"
                        />
                        <div className="profile-club-info">
                          <h3 className="profile-club-name">{club.name}</h3>
                          <p className="profile-club-description">
                            {club.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clubs/${club.id}`);
                            }}
                            className="profile-club-view-btn"
                          >
                            View Club →
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="profile-empty-message">
                      You haven't joined any clubs yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div className="profile-posts-list">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.post_id} className="profile-post-card">
                        <div className="profile-post-header">
                          <img
                            src={post.user?.profile_pic_url || user.avatar}
                            alt={post.user?.name || user.name}
                            className="profile-post-avatar"
                          />
                          <div className="profile-post-user-info">
                            <p className="profile-post-user-name">
                              {post.user?.name || user.name}
                            </p>
                            <p className="profile-post-time">
                              {formatDate(post.created_at)}
                            </p>
                          </div>
                        </div>
                        <p className="profile-post-content">{post.content}</p>
                        <div className="profile-post-stats">
                          <span className="profile-post-stat">
                            👍 {post.likes_count ?? 0}
                          </span>
                          <span className="profile-post-stat">
                            💬 {post.comments_count ?? 0}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="profile-empty-message">
                      You haven't made any posts yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
