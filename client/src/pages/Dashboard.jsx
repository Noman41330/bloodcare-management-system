import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  // adminInfo = logged-in admin data
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

  // stats = dashboard data from backend
  const [stats, setStats] = useState({
    totalDonors: 0,
    recentDonors: [],
    bloodGroupStats: [],
  });

  const [loading, setLoading] = useState(true);

  // logout = remove login session
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");

    navigate("/login");
  };

  // fetchStats = get dashboard data from backend
  const fetchStats = async () => {
    try {
      setLoading(true);

      // GET /api/donors/stats
      const res = await api.get("/donors/stats");

      setStats({
        totalDonors: res.data.totalDonors,
        recentDonors: res.data.recentDonors,
        bloodGroupStats: res.data.bloodGroupStats,
      });
    } catch (error) {
      console.log("Dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect = run when dashboard page opens
  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {adminInfo?.name || "Admin"}</p>
        </div>

        <button className="delete-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Analytics Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Donors</span>
          <h2>{loading ? "..." : stats.totalDonors}</h2>
          <p>Registered blood donors</p>
        </div>

        <div className="stat-card">
          <span>Blood Groups</span>
          <h2>{stats.bloodGroupStats.length}</h2>
          <p>Available group categories</p>
        </div>

        <div className="stat-card">
          <span>Admin</span>
          <h2 style={{ fontSize: "22px" }}>{adminInfo?.name}</h2>
          <p>{adminInfo?.email}</p>
        </div>

        <div className="stat-card danger">
          <span>System Status</span>
          <h2>Active</h2>
          <p>BloodCare system running</p>
        </div>
      </section>

      {/* Blood Group Analytics */}
      <section className="section-card">
        <div className="section-title">
          <h2>Blood Group Analytics</h2>
          <p>Donor count grouped by blood type.</p>
        </div>

        {stats.bloodGroupStats.length === 0 ? (
          <p className="table-message">No blood group data found</p>
        ) : (
          <div className="blood-grid analytics">
            {stats.bloodGroupStats.map((item) => (
              <div className="blood-card" key={item._id}>
                <strong>{item._id}</strong>
                <span>{item.count} Donors</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="chart-card">
      <h2>Blood Group Chart</h2>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={stats.bloodGroupStats}
            dataKey="count"
            nameKey="_id"
            outerRadius={120}
            label
          >
            {stats.bloodGroupStats?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

      {/* Recent Donors */}
      <section className="section-card">
        <div className="section-title">
          <h2>Recent Donors</h2>
          <p>Latest registered donors in the system.</p>
        </div>

        {stats.recentDonors.length === 0 ? (
          <p className="table-message">No recent donors found</p>
        ) : (
          <div className="recent-donor-list">
            {stats.recentDonors.map((donor) => (
              <div className="recent-donor-card" key={donor._id}>
                <img
                  src={`http://localhost:5000${donor.photo}`}
                  alt={donor.name}
                />

                <div>
                  <h4>{donor.name}</h4>
                  <p>{donor.phone}</p>
                </div>

                <span className="blood-pill">{donor.bloodGroup}</span>

                <small>{donor.district}</small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;