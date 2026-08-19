import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
  const [riskEvents, setRiskEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const riskResponse = await api.get("/risk-events");
        setRiskEvents(riskResponse.data);

        const alertResponse = await api.get("/alerts");
        setAlerts(alertResponse.data);
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

    const handleExportCSV = async () => {
    try {
      const response = await api.get("/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "risk_events_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Could not export CSV");
    }
  };

    const dismissAlert = async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/mark-read`);
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error("Could not dismiss alert");
    }
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
          <button onClick={handleExportCSV} style={{ marginRight: "10px" }}>
            Export CSV
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

            {alerts.length > 0 && (
        <div style={{ margin: "16px 0" }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: "#fff3cd",
                color: "#664d03",
                border: "1px solid #ffe69c",
                borderRadius: "6px",
                padding: "10px 14px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>⚠ {alert.message}</span>
              <button onClick={() => dismissAlert(alert.id)}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

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