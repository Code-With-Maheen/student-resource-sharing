import { useState } from "react";
import cover from "./assets/cover.webp";
import "./signin.css";

function Signin({ setPage, setUserName }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Enter a valid email");
      hasError = true;
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

    if (res.ok) {
  setUserName(data.user.fullName);

  if (data.user.role === "admin") {
    setPage("admin-dashboard");
  } else {
    setPage("user-dashboard");
  }
} else {
  alert(data.detail || data.message || "Signin failed");
}
    } catch (err) {
      console.log("Signin error:", err);
      alert("Error connecting to server");
    }
  }

  return (
    <div
      className="signin-page"
      style={{ backgroundImage: `url(${cover})` }}
    >
      <div className="signin-overlay"></div>

      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-badge">Welcome Back</div>
          <h1>Sign in to StudyShare</h1>
          <p>Access your notes, uploads, and saved materials.</p>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="error">{emailError}</p>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="error">{passwordError}</p>
          </div>

          <div className="signin-row">
            <button type="button" className="forgot-btn">
              Forgot Password?
            </button>
          </div>

          <button className="signin-btn" type="submit">
            Sign In
          </button>
        </form>

        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        <div className="switch-auth">
          <p>Don’t have an account?</p>
          <button
            type="button"
            className="switch-btn"
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signin;