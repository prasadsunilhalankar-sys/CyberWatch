import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function UploadLogs() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload-logs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("Only admin users can upload logs.");
      } else {
        setError("Upload failed. Check the file format.");
      }
    }
  };

  const runDetection = async () => {
    setError("");
    setMessage("");
    try {
      const response = await api.post("/run-detection");
      setMessage(response.data.message);
    } catch (err) {
      setError("Could not run detection.");
    }
  };

   return (
    <div style={{ minHeight: "100vh", background: "#0f1729", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 24px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: "#8fa8c9", cursor: "pointer", marginBottom: "20px" }}
        >
          ← Back to Dashboard
        </button>

        <div style={{
          background: "#1a2332",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}>
          <h2 style={{ color: "#fff", marginTop: 0 }}>Upload Log File</h2>

          <form onSubmit={handleUpload} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ color: "#8fa8c9", flex: 1 }}
            />
            <button type="submit" style={{
              padding: "8px 18px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}>
              Upload
            </button>
          </form>

          <button onClick={runDetection} style={{
            padding: "8px 18px",
            background: "#334155",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}>
            Run Detection
          </button>

          {message && <p style={{ color: "#8aff9a", marginTop: "16px" }}>{message}</p>}
          {error && <p style={{ color: "#ff8a8a", marginTop: "16px" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default UploadLogs;