import { useState } from "react";
import cover from "./assets/cover.webp";
import "./signup.css";

function Signup({ setPage }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setFullNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasError = false;

    if (fullName.trim() === "") {
      setFullNameError("Full name is required");
      hasError = true;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Enter a valid email");
      hasError = true;
    }

    if (phone.trim() === "") {
      setPhoneError("Phone number is required");
      hasError = true;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
     const res = await fetch(`${import.meta.env.VITE_API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password
        })
      });

      const data = await res.json();
      console.log("Signup response:", data);

      if (res.ok) {
        alert(data.message);

        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");

        setPage("signin");
      } else {
        alert(data.detail || data.message || "Signup failed");
      }
    } catch (err) {
      console.log("Signup error:", err);
      alert("Error connecting to server");
    }
  }

  return (
    <div
      className="main-container"
      style={{ backgroundImage: `url(${cover})` }}
    >
      <div className="box">
        <div className="header">
          <h1>Create Account</h1>
          <p className="subtitle">Join us to start sharing study resources</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <p className="error">{fullNameError}</p>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="error">{emailError}</p>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="error">{phoneError}</p>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="error">{passwordError}</p>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <p className="error">{confirmPasswordError}</p>
          </div>

          <button className="signup-btn" type="submit">
            Sign Up
          </button>
        </form>

        <div className="or">
          <div className="line"></div>
          <span>OR</span>
          <div className="line"></div>
        </div>

        <div className="signin">
          <p>Already have an account? </p>
          <button
            type="button"
            className="signin-link-btn"
            onClick={() => setPage("signin")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;