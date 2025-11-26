import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import { API_BASE_URL, useAuth } from "../context/AuthContext";

const Feed = () => {
  const [filter, setFilter] = useState("all");
  const [likedPosts, setLikedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [feedError, setFeedError] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [postComments, setPostComments] = useState({});
  const { user } = useAuth();

  const myClubs = [
    { id: 1, name: "Coding Club", icon: "💻", active: true },
    { id: 2, name: "Gaming Society", icon: "🎮", active: false },
    { id: 3, name: "Art Collective", icon: "🎨", active: false },
    { id: 4, name: "Debate Team", icon: "🎤", active: false },
  ];

  const announcements = [
    {
      id: 1,
      title: "Library Hours Extended for Finals",
      subtitle: "The main library will be open 24/7 starting next week...",
      date: "Today",
    },
    {
      id: 2,
      title: "Fall Career Fair Registration",
      subtitle: "Don't miss the chance to meet top employers...",
      date: "Yesterday",
    },
    {
      id: 3,
      title: "COVID-19 Policy Update",
      subtitle: "Masks are now optional in most campus buildings...",
      date: "2 days ago",
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await axios.get(`${API_BASE_URL}/api/posts`);
        setPosts(response.data || []);
      } catch (err) {
        console.error(
          "Failed to load posts:",
          err.response?.data?.error || err.message
        );
        setFeedError(
          err.response?.data?.error || "Failed to load posts. Please try again."
        );
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    if (filter === "public") return post.visibility === "public";
    if (filter === "following") return likedPosts[post.post_id];
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (Number.isNaN(diffInHours)) return "Just now";
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the post's like count and liked status
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                likes_count: response.data.likes_count,
                user_liked: response.data.liked,
              }
            : post
        )
      );

      // Update local liked state
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: response.data.liked,
      }));
    } catch (error) {
      console.error("Error liking post:", error);
      setFeedError("Failed to like post");
    }
  };

  // Add function to toggle comments
  const toggleComments = async (postId) => {
    if (!showComments[postId]) {
      // Fetch comments if not already loaded
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/posts/${postId}/comments`
        );
        setPostComments((prev) => ({
          ...prev,
          [postId]: response.data.comments,
        }));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }

    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Add function to post comment
  const handleComment = async (postId) => {
    const content = commentText[postId];
    if (!content || content.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update comments list
      setPostComments((prev) => ({
        ...prev,
        [postId]: [response.data.comment, ...(prev[postId] || [])],
      }));

      // Update comment count
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? { ...post, comments_count: response.data.comments_count }
            : post
        )
      );

      // Clear input
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error posting comment:", error);
      setFeedError("Failed to post comment");
    }
  };

  return (
    <Layout>
      <div className="feed-wrapper">
        <div className="feed-sidebar-left">
          <div className="sidebar-section">
            <h3 className="sidebar-title">My Clubs</h3>
            <div className="clubs-list">
              {myClubs.map((club) => (
                <div
                  key={club.id}
                  className={`club-item ${club.active ? "active" : ""}`}
                >
                  <span className="club-icon">{club.icon}</span>
                  <span className="club-name">{club.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Actions</h3>
            <div className="quick-actions">
              <button className="quick-action-btn">
                📢 Create Announcement
              </button>
              <button className="quick-action-btn">📝 Draft Post</button>
              <button className="quick-action-btn">📅 Schedule Event</button>
            </div>
          </div>
        </div>

        <div className="feed-center">
          <div className="create-post-card">
            <div className="create-post-header">
              <img
                src={
                  user?.profile_pic_url ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                }
                alt={user?.name || "User"}
                className="create-post-avatar"
              />
              <input
                type="text"
                placeholder="What's on your mind?"
                className="create-post-input"
                disabled
              />
            </div>
            <div className="create-post-actions">
              <button className="create-action-btn">
                <span>📷</span> Photo
              </button>
              <button className="create-action-btn">
                <span>🎥</span> Video
              </button>
              <button className="create-action-btn">
                <span>📅</span> Event
              </button>
            </div>
          </div>

          <div className="feed-filters">
            {["all", "public", "following"].map((option) => (
              <button
                key={option}
                className={`filter-btn ${filter === option ? "active" : ""}`}
                onClick={() => setFilter(option)}
              >
                {option === "all" && "All Posts"}
                {option === "public" && "Public"}
                {option === "following" && "Following"}
              </button>
            ))}
          </div>

          <div className="feed-posts">
            {feedError && (
              <div
                className="post-card"
                style={{ borderColor: "#fecaca", background: "#fef2f2" }}
              >
                <p style={{ color: "#b91c1c", margin: 0 }}>{feedError}</p>
              </div>
            )}

            {loadingPosts && (
              <div className="post-card">
                <p style={{ margin: 0 }}>Loading posts...</p>
              </div>
            )}

            {!loadingPosts && !feedError && filteredPosts.length === 0 && (
              <div className="post-card">
                <p style={{ margin: 0 }}>
                  No posts to show yet. Check back soon!
                </p>
              </div>
            )}

            {!loadingPosts &&
              !feedError &&
              filteredPosts.map((post) => {
                const displayName = post.user?.name || "Club Member";
                const avatar =
                  post.user?.profile_pic_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=6366f1&color=fff&size=128`;
                const postLikes = post.likes_count ?? 0;
                const postComments = post.comments_count ?? 0;

                return (
                  <div key={post.post_id} className="post-card">
                    <div className="post-header">
                      <div className="post-user-info">
                        <img
                          src={avatar}
                          alt={displayName}
                          className="post-avatar"
                        />
                        <div className="post-user-details">
                          <h4 className="post-user-name">{displayName}</h4>
                          <p className="post-time">
                            Posted {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="post-body">
                      <p className="post-text">{post.content}</p>
                      {post.image_url && (
                        <div className="post-image">
                          <img src={post.image_url} alt="Post" />
                        </div>
                      )}
                    </div>

                    <div className="post-stats">
                      <span className="stat">👍 {postLikes}</span>
                      <span className="stat">💬 {postComments}</span>
                      <span className="stat">🔗 0</span>
                    </div>

                    <div className="post-footer">
                      <button
                        className={`post-action ${
                          likedPosts[post.post_id] ? "liked" : ""
                        }`}
                        onClick={() => handleLike(post.post_id)}
                      >
                        👍 Like
                      </button>
                      <button
                        className="post-action"
                        onClick={() => toggleComments(post.post_id)}
                      >
                        💬 Comment
                      </button>
                      
                    </div>

                    {/* Comments Section */}
                    {showComments[post.post_id] && (
                      <div className="comments-section">
                        <div className="comment-input-wrapper">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText[post.post_id] || ""}
                            onChange={(e) =>
                              setCommentText((prev) => ({
                                ...prev,
                                [post.post_id]: e.target.value,
                              }))
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter")
                                handleComment(post.post_id);
                            }}
                            className="comment-input"
                          />
                          <button
                            onClick={() => handleComment(post.post_id)}
                            className="comment-submit-btn"
                          >
                            Send
                          </button>
                        </div>

                        <div className="comments-list">
                          {postComments[post.post_id]?.map((comment) => (
                            <div
                              key={comment.comment_id}
                              className="comment-item"
                            >
                              <img
                                src={
                                  comment.user?.profile_pic_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    comment.user?.name
                                  )}`
                                }
                                alt={comment.user?.name}
                                className="comment-avatar"
                              />
                              <div className="comment-content">
                                <div className="comment-header">
                                  <span className="comment-user-name">
                                    {comment.user?.name}
                                  </span>
                                  <span className="comment-time">
                                    {formatDate(comment.created_at)}
                                  </span>
                                </div>
                                <p className="comment-text">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="feed-sidebar-right">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Campus Announcements</h3>
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item">
                  <h4 className="announcement-title">{announcement.title}</h4>
                  <p className="announcement-subtitle">
                    {announcement.subtitle}
                  </p>
                  <span className="announcement-date">{announcement.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
