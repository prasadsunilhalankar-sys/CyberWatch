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
    <div style={{ maxWidth: "500px", margin: "60px auto", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      <h2>Upload Log File</h2>

      <form onSubmit={handleUpload}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" style={{ marginLeft: "10px" }}>Upload</button>
      </form>

      <button onClick={runDetection} style={{ marginTop: "16px" }}>
        Run Detection
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UploadLogs;