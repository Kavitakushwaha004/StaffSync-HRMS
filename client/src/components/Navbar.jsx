import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkStyle = { color: "white", marginRight: 16, textDecoration: "none" };

  return (
    <nav
      style={{
        background: "#1f2937",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        {["HR", "Manager"].includes(user.role) && (
          <Link to="/employees" style={linkStyle}>Employees</Link>
        )}
        <Link to="/attendance" style={linkStyle}>Attendance</Link>
        <Link to="/leaves" style={linkStyle}>Leaves</Link>
        <Link to="/trainings" style={linkStyle}>Trainings</Link>
        <Link to="/announcements" style={linkStyle}>Announcements</Link>
      </div>
      <div style={{ color: "white" }}>
        {user.name} ({user.role}){" "}
        <button onClick={logout} style={{ marginLeft: 12 }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;