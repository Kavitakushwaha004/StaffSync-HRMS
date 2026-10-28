import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const emptyForm = { leaveType: "Casual", startDate: "", endDate: "", reason: "" };

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPrivileged = ["HR", "Manager"].includes(user.role);

  const loadLeaves = async () => {
    try {
      const url = isPrivileged ? "/leaves" : "/leaves/my";
      const { data } = await API.get(url);
      setLeaves(data.leaves);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load leaves");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/leaves", form);
      setForm(emptyForm);
      setMessage("Leave applied successfully");
      loadLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      loadLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const inputStyle = { padding: 8, marginRight: 8, marginBottom: 8 };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Leaves</h2>
        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <select name="leaveType" value={form.leaveType} onChange={handleChange} style={inputStyle}>
            <option>Casual</option>
            <option>Sick</option>
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Other</option>
          </select>
          <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required style={inputStyle} />
          <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required style={inputStyle} />
          <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} required style={inputStyle} />
          <button type="submit">Apply Leave</button>
        </form>

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {isPrivileged && <th>Employee</th>}
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              {isPrivileged && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id}>
                {isPrivileged && <td>{l.employee?.name || "-"}</td>}
                <td>{l.leaveType}</td>
                <td>{formatDate(l.startDate)}</td>
                <td>{formatDate(l.endDate)}</td>
                <td>{l.reason}</td>
                <td>{l.status}</td>
                {isPrivileged && (
                  <td>
                    {l.status === "Pending" && (
                      <>
                        <button onClick={() => updateStatus(l._id, "Approved")} style={{ marginRight: 6 }}>
                          Approve
                        </button>
                        <button onClick={() => updateStatus(l._id, "Rejected")}>Reject</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaves;