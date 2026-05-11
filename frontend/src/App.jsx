import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import "./App.css";
import Signin from "./signin";
import Signup from "./signup";
import UploadMaterial from "./UploadMaterial";
import UserDashboard from "./UserDashboard";


function Welcome({ name }) {
  return (
    <div className="page">
      <div
        className="container"
        style={{ textAlign: "center", paddingTop: "100px" }}
      >
        <h1>Welcome, {name} 🎉</h1>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [userName, setUserName] = useState("");

  if (page === "signup") {
    return <Signup setPage={setPage} />;
  }

  if (page === "signin") {
    return <Signin setPage={setPage} setUserName={setUserName} />;
  }

 

  if (page === "admin-dashboard") {
    return <AdminDashboard setPage={setPage} userName={userName} />;
  }

  if (page === "welcome") {
    return <Welcome name={userName} />;
  }
  
  if (page === "user-dashboard") {
  return <UserDashboard setPage={setPage} userName={userName} />;
}
if (page === "upload") {
  return <UploadMaterial setPage={setPage} userName={userName} />;
}

  return (
    <div className="page">
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">📘</div>
            <h2>
              Study<span>Share</span>
            </h2>
          </div>

          <ul className="nav-links">
            <li className="active">Home</li>
            <li>Explore</li>
            <li>Subjects</li>
            <li>About</li>
          </ul>

          <div className="nav-buttons">
            <button
  className="btn btn-outline"
  onClick={() => setPage("signin")}
>
  Login
</button>

            <button
              className="btn btn-fill"
              onClick={() => setPage("signup")}
            >
              Sign Up
            </button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-left">
            <h1>
              Share and Discover
              <br />
              Study Materials
              <br />
              <span>Easily</span>
            </h1>

            <p>
              Upload your notes, assignments, and study guides.
              <br />
              Find the best study materials shared by students
              <br />
              from different colleges.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-fill">☁ Upload Notes</button>
              <button className="btn btn-outline purple">
                🔍 Explore Materials
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="laptop">
              <div className="laptop-header">Study Materials</div>

              <div className="search-bar">
                <input type="text" placeholder="Search materials..." />
                <button>🔍</button>
              </div>

              <div className="material-list">
                <div className="material-item">
                  <div className="file-icon pdf">PDF</div>
                  <div className="material-info">
                    <h4>Data Structures Notes</h4>
                    <p>Computer Science • 3rd Sem</p>
                  </div>
                  <span className="download">⬇</span>
                </div>

                <div className="material-item">
                  <div className="file-icon word">W</div>
                  <div className="material-info">
                    <h4>Operating System Notes</h4>
                    <p>Computer Science • 5th Sem</p>
                  </div>
                  <span className="download">⬇</span>
                </div>

                <div className="material-item">
                  <div className="file-icon green">PDF</div>
                  <div className="material-info">
                    <h4>Discrete Mathematics</h4>
                    <p>Mathematics • 2nd Sem</p>
                  </div>
                  <span className="download">⬇</span>
                </div>
              </div>
            </div>

            <div className="books">
              <div className="book purple-book"></div>
              <div className="book yellow-book"></div>
            </div>

            <div className="plant">
              <div className="pot"></div>
              <div className="leaf leaf1"></div>
              <div className="leaf leaf2"></div>
              <div className="leaf leaf3"></div>
              <div className="leaf leaf4"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}