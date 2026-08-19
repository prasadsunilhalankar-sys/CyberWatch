import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { username, password });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f1729",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        width: "360px",
        background: "#1a2332",
        padding: "36px",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
      }}>
        <h2 style={{ color: "#fff", marginBottom: "4px" }}>CyberWatch</h2>
        <p style={{ color: "#8fa8c9", marginTop: 0, marginBottom: "24px", fontSize: "14px" }}>
          Security Monitoring Dashboard
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#8fa8c9", fontSize: "13px" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                background: "#0f1729",
                border: "1px solid #2a3a52",
                borderRadius: "6px",
                color: "#fff",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: "#8fa8c9", fontSize: "13px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                background: "#0f1729",
                border: "1px solid #2a3a52",
                borderRadius: "6px",
                color: "#fff",
                boxSizing: "border-box"
              }}
            />
          </div>
          {error && <p style={{ color: "#ff8a8a", fontSize: "13px" }}>{error}</p>}
          <button type="submit" style={{
            width: "100%",
            padding: "10px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;