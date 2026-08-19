import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
  const [riskEvents, setRiskEvents] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/risk-events");
        setRiskEvents(response.data);
      } catch (err) {
        setError("Could not load risk events. Please login again.");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const highCount = riskEvents.filter((e) => e.severity === "High").length;

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>CyberWatch Dashboard</h2>
        <div>
          <button onClick={() => navigate("/upload")} style={{ marginRight: "10px" }}>
            Upload Logs
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", margin: "20px 0" }}>
        <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "6px" }}>
          <p>Total Risk Events</p>
          <h3>{riskEvents.length}</h3>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "6px" }}>
          <p>High Severity</p>
          <h3>{highCount}</h3>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Rule Triggered</th>
            <th>Severity</th>
            <th>Source IP</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {riskEvents.map((event) => (
            <tr key={event.id}>
              <td>{event.rule_triggered}</td>
              <td>{event.severity}</td>
              <td>{event.source_ip}</td>
              <td>{event.description}</td>
              <td>{new Date(event.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;