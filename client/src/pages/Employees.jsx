import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: "",
  user: "",
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadEmployees = async () => {
    try {
      const { data } = await API.get("/employees");
      setEmployees(data.employees);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/employees", form);
      setForm(emptyForm);
      setMessage("Employee added successfully");
      loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add employee");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete");
    }
  };

  const inputStyle = { padding: 8, marginRight: 8, marginBottom: 8 };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Employees</h2>
        {message && <p>{message}</p>}

        {user.role === "HR" && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} required style={inputStyle} />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={inputStyle} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required style={inputStyle} />
            <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} required style={inputStyle} />
            <input name="salary" type="number" placeholder="Salary" value={form.salary} onChange={handleChange} style={inputStyle} />
            <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} required style={inputStyle} />
            <input name="user" placeholder="User ID (from users)" value={form.user} onChange={handleChange} required style={inputStyle} />
            <button type="submit">Add Employee</button>
          </form>
        )}

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              {user.role === "HR" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employeeId}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>{emp.status}</td>
                {user.role === "HR" && (
                  <td>
                    <button onClick={() => handleDelete(emp._id)}>Delete</button>
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

export default Employees;