import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const emptyForm = { title: "", description: "", date: "", trainer: "", assignedTo: "" };

function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPrivileged = ["HR", "Manager"].includes(user.role);

  const loadTrainings = async () => {
    try {
      const url = isPrivileged ? "/trainings" : "/trainings/my";
      const { data } = await API.get(url);
      setTrainings(data.trainings);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load trainings");
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        trainer: form.trainer || undefined,
        assignedTo: form.assignedTo
          ? form.assignedTo.split(",").map((id) => id.trim())
          : [],
      };
      await API.post("/trainings", payload);
      setForm(emptyForm);
      setMessage("Training created successfully");
      loadTrainings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create training");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this training?")) return;
    try {
      await API.delete(`/trainings/${id}`);
      loadTrainings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete");
    }
  };

  const inputStyle = { padding: 8, marginRight: 8, marginBottom: 8 };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Trainings</h2>
        {message && <p>{message}</p>}

        {isPrivileged && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={inputStyle} />
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={inputStyle} />
            <input name="date" type="date" value={form.date} onChange={handleChange} required style={inputStyle} />
            <input name="trainer" placeholder="Trainer (optional)" value={form.trainer} onChange={handleChange} style={inputStyle} />
            <input name="assignedTo" placeholder="User IDs (comma separated)" value={form.assignedTo} onChange={handleChange} style={inputStyle} />
            <button type="submit">Create Training</button>
          </form>
        )}

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Date</th>
              <th>Trainer</th>
              {isPrivileged && <th>Assigned</th>}
              {isPrivileged && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {trainings.map((t) => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.description}</td>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.trainer}</td>
                {isPrivileged && <td>{t.assignedTo?.length || 0}</td>}
                {isPrivileged && (
                  <td>
                    <button onClick={() => handleDelete(t._id)}>Delete</button>
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

export default Trainings;