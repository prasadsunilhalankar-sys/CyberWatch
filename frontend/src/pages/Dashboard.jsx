import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const uniqueIPs = new Set(riskEvents.map((e) => e.source_ip)).size;

  const chartData = riskEvents.map((e) => ({
    ip: e.source_ip,
    count: 1,
  }));

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h2 style={{ color: "#fff", margin: 0 }}>Dashboard</h2>
        <button onClick={handleExportCSV} style={{
          padding: "8px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Export CSV
        </button>
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

      <div style={{ display: "flex", gap: "20px", margin: "24px 0" }}>
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #1e3a5f, #16213e)",
          padding: "20px 24px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <p style={{ margin: 0, color: "#8fa8c9", fontSize: "14px" }}>Total Risk Events</p>
          <h3 style={{ margin: "8px 0 0", fontSize: "32px", color: "#fff" }}>{riskEvents.length}</h3>
        </div>
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #5f1e1e, #3e1616)",
          padding: "20px 24px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <p style={{ margin: 0, color: "#c98f8f", fontSize: "14px" }}>High Severity</p>
          <h3 style={{ margin: "8px 0 0", fontSize: "32px", color: "#fff" }}>{highCount}</h3>
        </div>
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #1e4a3f, #163e2e)",
          padding: "20px 24px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <p style={{ margin: 0, color: "#8fc9a8", fontSize: "14px" }}>Unique Source IPs</p>
          <h3 style={{ margin: "8px 0 0", fontSize: "32px", color: "#fff" }}>{uniqueIPs}</h3>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <thead>
          <tr style={{ background: "#1a2332" }}>
            <th style={{ padding: "14px 16px", textAlign: "left", color: "#8fa8c9", fontSize: "13px", textTransform: "uppercase" }}>Rule Triggered</th>
            <th style={{ padding: "14px 16px", textAlign: "left", color: "#8fa8c9", fontSize: "13px", textTransform: "uppercase" }}>Severity</th>
            <th style={{ padding: "14px 16px", textAlign: "left", color: "#8fa8c9", fontSize: "13px", textTransform: "uppercase" }}>Source IP</th>
            <th style={{ padding: "14px 16px", textAlign: "left", color: "#8fa8c9", fontSize: "13px", textTransform: "uppercase" }}>Description</th>
            <th style={{ padding: "14px 16px", textAlign: "left", color: "#8fa8c9", fontSize: "13px", textTransform: "uppercase" }}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {riskEvents.map((event, index) => (
            <tr key={event.id} style={{ background: index % 2 === 0 ? "#212b3d" : "#1a2332" }}>
              <td style={{ padding: "12px 16px" }}>{event.rule_triggered}</td>
              <td style={{ padding: "12px 16px" }}>
                <span style={{
                  background: event.severity === "High" ? "#5f1e1e" : "#5f4a1e",
                  color: event.severity === "High" ? "#ff8a8a" : "#ffd28a",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {event.severity}
                </span>
              </td>
              <td style={{ padding: "12px 16px" }}>{event.source_ip}</td>
              <td style={{ padding: "12px 16px" }}>{event.description}</td>
              <td style={{ padding: "12px 16px", color: "#8fa8c9" }}>{new Date(event.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        background: "#1a2332",
        borderRadius: "10px",
        padding: "20px 24px",
        marginTop: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
          Risk Events by Source IP
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a52" />
            <XAxis dataKey="ip" stroke="#8fa8c9" fontSize={12} />
            <YAxis stroke="#8fa8c9" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid #2a3a52", color: "#fff" }} />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}

export default Dashboard;