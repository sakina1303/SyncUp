import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { API_BASE_URL } from "../context/AuthContext";
import axios from "axios";

const Clubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Academic", "Social", "Sport"];

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/clubs`);
        setClubs(response.data.clubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="clubs-page">
        <div className="clubs-container">
          <div className="clubs-header">
            <h1 className="clubs-title">Discover Clubs</h1>
            <p className="clubs-subtitle">
              Find your community on campus. Join clubs that match your
              interests and passions.
            </p>

            <div className="clubs-search-filter">
              <div className="clubs-search">
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="9" r="6" />
                  <path d="m17 17-4-4" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for clubs by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="clubs-search-input"
                />
              </div>
              <div className="clubs-categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-filter ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="clubs-loading">
              <p>Loading clubs...</p>
            </div>
          ) : (
            <div className="clubs-grid">
              {filteredClubs.length > 0 ? (
                filteredClubs.map((club) => (
                  <div
                    key={club.club_id}
                    className="club-card"
                    onClick={() => navigate(`/clubs/${club.club_id}`)}
                  >
                    <div
                      className="club-card-image"
                      style={{
                        backgroundImage: club.image_url
                          ? `url(${club.image_url})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="club-card-body">
                      <h3 className="club-card-title">{club.name}</h3>
                      <p className="club-card-description">
                        {club.description}
                      </p>
                      <button
                        className="club-join-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clubs/${club.club_id}`);
                        }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="clubs-empty">
                  <p>No clubs found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clubs;
