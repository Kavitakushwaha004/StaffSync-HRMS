import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function Attendance() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPrivileged = ["HR", "Manager"].includes(user.role);

  const loadRecords = async () => {
    try {
      const url = isPrivileged ? "/attendance" : "/attendance/my";
      const { data } = await API.get(url);
      setRecords(data.records);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load attendance");
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleCheckIn = async () => {
    setMessage("");
    try {
      await API.post("/attendance/check-in");
      setMessage("Checked in successfully");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    setMessage("");
    try {
      await API.put("/attendance/check-out");
      setMessage("Checked out successfully");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-out failed");
    }
  };

  const formatTime = (t) => (t ? new Date(t).toLocaleTimeString() : "-");
  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Attendance</h2>
        {message && <p>{message}</p>}

        <div style={{ marginBottom: 20 }}>
          <button onClick={handleCheckIn} style={{ marginRight: 12 }}>
            Check In
          </button>
          <button onClick={handleCheckOut}>Check Out</button>
        </div>

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              {isPrivileged && <th>Employee</th>}
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{formatDate(r.date)}</td>
                {isPrivileged && <td>{r.employee?.name || "-"}</td>}
                <td>{formatTime(r.checkIn)}</td>
                <td>{formatTime(r.checkOut)}</td>
                <td>{r.workingHours}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;