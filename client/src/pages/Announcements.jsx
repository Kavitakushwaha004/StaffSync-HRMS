import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const emptyForm = { title: "", message: "", priority: "Normal", department: "All" };

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPrivileged = ["HR", "Manager"].includes(user.role);

  const loadAnnouncements = async () => {
    try {
      const { data } = await API.get("/announcements");
      setAnnouncements(data.announcements);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load announcements");
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/announcements", form);
      setForm(emptyForm);
      setMessage("Announcement posted successfully");
      loadAnnouncements();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete");
    }
  };

  const inputStyle = { padding: 8, marginRight: 8, marginBottom: 8 };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Announcements</h2>
        {message && <p>{message}</p>}

        {isPrivileged && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={inputStyle} />
            <input name="message" placeholder="Message" value={form.message} onChange={handleChange} required style={inputStyle} />
            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
            </select>
            <input name="department" placeholder="Department (All)" value={form.department} onChange={handleChange} style={inputStyle} />
            <button type="submit">Post Announcement</button>
          </form>
        )}

        {announcements.map((a) => (
          <div key={a._id} style={{ border: "1px solid #888", padding: 12, marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>
              {a.title} <small>({a.priority})</small>
            </h3>
            <p>{a.message}</p>
            <small>
              By {a.postedBy?.name || "-"} | Dept: {a.department} |{" "}
              {new Date(a.createdAt).toLocaleDateString()}
            </small>
            {isPrivileged && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleDelete(a._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        {announcements.length === 0 && <p>No announcements yet.</p>}
      </div>
    </div>
  );
}

export default Announcements;