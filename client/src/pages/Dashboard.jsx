import Navbar from "../components/Navbar";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div>
      <Navbar />
      <div style={{ padding: 30 }}>
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role}</p>
      </div>
    </div>
  );
}

export default Dashboard;