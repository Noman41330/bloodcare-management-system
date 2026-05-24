import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Dashboard() {
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

  const [stats, setStats] = useState({
    totalDonors: 0,
    recentDonors: [],
    bloodGroupStats: [],
  });

  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await api.get("/donors/stats");

      setStats({
        totalDonors: res.data.totalDonors || 0,
        recentDonors: res.data.recentDonors || [],
        bloodGroupStats: res.data.bloodGroupStats || [],
      });
    } catch (error) {
      console.log("Dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getBloodCount = (group) => {
    const found = stats.bloodGroupStats.find((item) => item._id === group);
    return found ? found.count : 0;
  };

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

      <section className="stats-grid">
        <Link to="/donors" className="stat-card clickable-card">
          <span>Total Donors</span>
          <h2>{loading ? "..." : stats.totalDonors}</h2>
          <p>Click to view all donors</p>
        </Link>

        <a href="#blood-group-list" className="stat-card clickable-card">
          <span>Blood Groups</span>
          <h2>{bloodGroups.length}</h2>
          <p>Click to view blood group list</p>
        </a>

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

      <section className="section-card" id="blood-group-list">
        <div className="section-title">
          <h2>Blood Group Analytics</h2>
          <p>Click any blood group to view matching donors.</p>
        </div>

        <div className="blood-overview-grid">
          {bloodGroups.map((group) => (
            <Link
              to={`/donors?bloodGroup=${encodeURIComponent(group)}`}
              className="blood-overview-card"
              key={group}
            >
              <div className="blood-group-circle">{group}</div>
              <h3>{getBloodCount(group)}</h3>
              <p>Donors</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="chart-card">
        <div className="section-title">
          <h2>Blood Group Chart</h2>
          <p>Visual donor distribution overview.</p>
        </div>

        {stats.bloodGroupStats.length === 0 ? (
          <p className="table-message">No chart data found</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={stats.bloodGroupStats}
                dataKey="count"
                nameKey="_id"
                outerRadius={120}
                label
              >
                {stats.bloodGroupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

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
              <Link
                to={`/donors?bloodGroup=${encodeURIComponent(donor.bloodGroup)}`}
                className="recent-donor-card"
                key={donor._id}
              >
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
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;