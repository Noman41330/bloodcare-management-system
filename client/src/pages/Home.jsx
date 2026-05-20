function Home() {
  return (
    <div className="dashboard-page">
      {/* Hero section */}
      <section className="dashboard-hero">
        <div>
          <span className="status-badge">Live System</span>

          <h1>Save Lives Through Smart Blood Donor Management</h1>

          <p>
            Register donors, organize blood groups, manage contact information,
            and build a reliable emergency donor database.
          </p>

          <a href="/donor-register" className="primary-action">
            Register New Donor
          </a>
        </div>

        <div className="hero-panel">
          <h4>Emergency Availability</h4>
          <h2>24/7</h2>
          <p>Donor information ready for urgent blood requests.</p>
        </div>
      </section>

      {/* Stats cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Donors</span>
          <h2>0</h2>
          <p>Registered donors</p>
        </div>

        <div className="stat-card">
          <span>Blood Groups</span>
          <h2>8</h2>
          <p>A+, A-, B+, B-, O+, O-, AB+, AB-</p>
        </div>

        <div className="stat-card">
          <span>District Coverage</span>
          <h2>0</h2>
          <p>Locations added</p>
        </div>

        <div className="stat-card danger">
          <span>Urgent Requests</span>
          <h2>0</h2>
          <p>Pending requests</p>
        </div>
      </section>

      {/* Blood group cards */}
      <section className="section-card">
        <div className="section-title">
          <h2>Blood Group Overview</h2>
          <p>Quick visual grouping for future donor filtering.</p>
        </div>

        <div className="blood-grid">
          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
            <div className="blood-card" key={group}>
              <strong>{group}</strong>
              <span>0 Donors</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;