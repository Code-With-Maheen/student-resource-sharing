import { useState } from "react";
import "./AdminSignin.css";
import cover from "./assets/cover.webp";

function AdminSignin({ setPage, setUserName }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 async function handleSubmit(e) {
  e.preventDefault();

  try {
    const res = await fetch(`${import.meta.env.VITE_API}/admin/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      setUserName(data.user.fullName);
      setPage("admin-dashboard");
    } else {
      alert(data.detail || "Admin signin failed");
    }
  } catch (err) {
    alert("Server error");
  }
}

  return (
    <div
      className="admin-signin-page"
      style={{ backgroundImage: `url(${cover})` }}
    >
      <div className="admin-overlay"></div>

      <div className="admin-card">
        <div className="admin-header">
          <div className="admin-badge">ADMIN ACCESS</div>
          <h1>Sign in as Admin</h1>
          <p>Use your admin credentials</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="admin-btn" type="submit">
            Sign In as Admin
          </button>
        </form>

        <div className="switch-auth">
          <p>Want normal login?</p>
          <button onClick={() => setPage("signin")} className="switch-btn">
            Login as User
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSignin;