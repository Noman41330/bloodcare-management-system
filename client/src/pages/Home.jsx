import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Home() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    bloodGroupStats: [],
    districtCount: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const donorRes = await api.get("/donors/stats");
        const emergencyRes = await api.get("/emergency/stats");

        setStats({
          totalDonors: donorRes.data.totalDonors || 0,
          bloodGroupStats: donorRes.data.bloodGroupStats || [],
          districtCount: donorRes.data.districtCount || 0,
          pendingRequests: emergencyRes.data.pendingRequests || 0,
        });
      } catch (error) {
        console.log("Home stats error:", error);
      }
    };

    fetchStats();
  }, []);

  const getBloodCount = (group) => {
    const found = stats.bloodGroupStats.find((item) => item._id === group);
    return found ? found.count : 0;
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <span className="home-badge">Live BloodCare Platform</span>

          <h1>Save Lives Through Smart Blood Donor Management</h1>

          <p>
            Register donors, organize blood groups, manage emergency requests,
            and build a reliable blood donor network.
          </p>

          <div className="home-actions">
            <Link to="/register" className="home-primary-btn">
              Join as Member
            </Link>

            <Link to="/donor-register" className="home-secondary-btn">
              Register as Donor
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <span>Emergency Availability</span>
          <h2>24/7</h2>
          <p>Donor information ready for urgent blood requests.</p>
        </div>
      </section>

      <section className="home-stats-grid">
        <Link to="/donors" className="home-stat-card">
          <span>Total Donors</span>
          <h2>{stats.totalDonors}</h2>
          <p>Registered donors</p>
        </Link>

        <a href="#blood-overview" className="home-stat-card">
          <span>Blood Groups</span>
          <h2>8</h2>
          <p>A+, A-, B+, B-, O+, O-, AB+, AB-</p>
        </a>

        <Link to="/donors" className="home-stat-card">
          <span>District Coverage</span>
          <h2>{stats.districtCount}</h2>
          <p>Unique districts added</p>
        </Link>

        <Link to="/emergency" className="home-stat-card danger">
          <span>Urgent Requests</span>
          <h2>{stats.pendingRequests}</h2>
          <p>Pending requests</p>
        </Link>
      </section>

      <section className="home-section-card" id="blood-overview">
        <div className="section-title">
          <h2>Blood Group Overview</h2>
          <p>Quick visual grouping for future donor filtering.</p>
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
    </div>
  );
}

export default Home;