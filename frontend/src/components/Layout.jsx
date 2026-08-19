import { useNavigate, useLocation } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkStyle = (path) => ({
    display: "block",
    padding: "12px 20px",
    color: location.pathname === path ? "#fff" : "#8fa8c9",
    background: location.pathname === path ? "#2563eb" : "transparent",
    borderRadius: "8px",
    textDecoration: "none",
    marginBottom: "6px",
    cursor: "pointer",
    fontSize: "14px",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1729", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "240px", background: "#1a2332", padding: "24px 16px", flexShrink: 0 }}>
        <h2 style={{ color: "#fff", padding: "0 4px", marginBottom: "32px" }}>CyberWatch</h2>
        <div onClick={() => navigate("/dashboard")} style={linkStyle("/dashboard")}>Dashboard</div>
        <div onClick={() => navigate("/upload")} style={linkStyle("/upload")}>Upload Logs</div>
        <div onClick={handleLogout} style={{ ...linkStyle(""), marginTop: "24px", color: "#ff8a8a" }}>Logout</div>
      </div>
      <div style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;