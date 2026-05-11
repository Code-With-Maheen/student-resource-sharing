import axios from "axios";
import { useEffect, useState } from "react";
import "./UserDashboard.css";

import ExploreMaterials from "./ExploreMaterials";
import MyMaterials from "./MyMaterials";
import SavedMaterials from "./SavedMaterials";

function UserDashboard({ setPage, userName }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [publicMaterials, setPublicMaterials] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  const API = import.meta.env.VITE_API || "http://localhost:8000";

  function handleLogout() {
    setPage("home");
  }

  useEffect(() => {
    fetchCounts();
  }, []);

  async function fetchCounts() {
    try {
      const publicRes = await axios.get(`${API}/materials`);
      const savedRes = await axios.get(`${API}/saved-materials/${userName}`);
      const myRes = await axios.get(`${API}/my-materials/${userName}`);
      setPublicMaterials(publicRes.data);
      setSavedMaterials(savedRes.data);
      setMyMaterials(myRes.data); 
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="user-logo-box">
          <h2>StudyShare</h2>
          <p>User Panel</p>
        </div>

        <nav className="user-sidebar-nav">
          <button
            className={`user-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`user-nav-item ${activeTab === "explore" ? "active" : ""}`}
            onClick={() => setActiveTab("explore")}
          >
            Explore Materials
          </button>

          <button
            className={`user-nav-item ${activeTab === "my-materials" ? "active" : ""}`}
            onClick={() => setActiveTab("my-materials")}
          >
            My Materials
          </button>

          <button
            className={`user-nav-item ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>

          <button
            className={`user-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>

          <button className="user-nav-item" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="user-main-content">
        {activeTab === "dashboard" && (
          <>
            <div className="user-topbar">
              <div>
                <h1>User Dashboard</h1>
                <p>Welcome back, {userName}</p>
              </div>
            </div>

            <div className="user-hero-card">
              <h2>Hello, {userName} 👋</h2>
              <p>Manage your public notes, private notes, and saved materials.</p>
            </div>

            <div className="user-stats-grid">
              <div className="user-stat-card">
                <h3>Public Materials</h3>
                <p>{publicMaterials.length}</p>
              </div>

               <div className="user-stat-card">
    <h3>My Uploads</h3>
    <p>{myMaterials.length}</p>
  </div>

  <div className="user-stat-card">
    <h3>Saved Materials</h3>
    <p>{savedMaterials.length}</p>
  </div>
            </div>

            <div className="user-sections-grid">
              <div className="user-card">
                <h3>Quick Actions</h3>

                <div className="user-action-buttons">
                  <button className="primary-btn" onClick={() => setPage("upload")}>
                    Upload Material
                  </button>

                  <button className="secondary-btn" onClick={() => setActiveTab("explore")}>
                    Explore Materials
                  </button>
                </div>
              </div>

              <div className="user-card">
                <h3>Recent Activity</h3>
                <p className="muted-text">No recent activity yet.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "explore" && (
          <ExploreMaterials userName={userName} refreshCounts={fetchCounts} />
        )}

        {activeTab === "my-materials" && (
          <MyMaterials userName={userName} />
        )}

        {activeTab === "saved" && (
          <SavedMaterials userName={userName} />
        )}

        {activeTab === "profile" && (
          <div className="profile-card">
            <h1>Profile</h1>
            <p><b>Name:</b> {userName}</p>
            <p><b>Role:</b> Student</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;