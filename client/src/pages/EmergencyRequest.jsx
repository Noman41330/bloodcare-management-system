import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function EmergencyRequest() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientProblem: "",
    bloodGroup: "",
    hospital: "",
    area: "",
    phone: "",
    urgency: "Urgent",
    note: "",
  });

  const [matchingDonors, setMatchingDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const fetchRequests = async () => {
    try {
      const res = await api.get("/emergency");
      setRequests(res.data.requests || []);
    } catch (error) {
      console.log("Emergency requests fetch error:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    if (name === "bloodGroup" && value) {
      try {
        const res = await api.get(
          `/emergency/match/${encodeURIComponent(value)}`
        );
        setMatchingDonors(res.data.donors || []);
      } catch (error) {
        console.log("Matching donor error:", error);
        setMatchingDonors([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/emergency", formData);

      setMessage(res.data.message || "Emergency request created successfully");

      setFormData({
        patientName: "",
        patientProblem: "",
        bloodGroup: "",
        hospital: "",
        area: "",
        phone: "",
        urgency: "Urgent",
        note: "",
      });

      setMatchingDonors([]);
      fetchRequests();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create emergency request"
      );
    }
  };

  const uniqueAreas = useMemo(() => {
    return [...new Set(requests.map((item) => item.area).filter(Boolean))];
  }, [requests]);

  const filteredRequests = requests.filter((item) => {
    const searchText = `
      ${item.patientName || ""}
      ${item.patientProblem || ""}
      ${item.bloodGroup || ""}
      ${item.hospital || ""}
      ${item.area || ""}
      ${item.phone || ""}
      ${item.urgency || ""}
      ${item.status || ""}
      ${item.acceptedDonor?.name || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesGroup = groupFilter === "" || item.bloodGroup === groupFilter;
    const matchesArea = areaFilter === "" || item.area === areaFilter;
    const matchesStatus = statusFilter === "" || item.status === statusFilter;

    const matchesDate =
      dateFilter === "" ||
      new Date(item.createdAt).toISOString().slice(0, 10) === dateFilter;

    return (
      matchesSearch &&
      matchesGroup &&
      matchesArea &&
      matchesStatus &&
      matchesDate
    );
  });

  return (
    <div className="emergency-page">
      <div className="page-heading">
        <div>
          <h1>Emergency Blood Request</h1>
          <p>Create urgent requests and manage all blood requests.</p>
        </div>
      </div>

      <div className="emergency-grid">
        <div className="form-card">
          <h2>Create Request</h2>
          <p>Fill patient and hospital information.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  placeholder="Example: Rahim Uddin"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Required Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label>Patient Problem</label>
                <input
                  type="text"
                  name="patientProblem"
                  placeholder="Example: Delivery, accident, surgery..."
                  value={formData.patientProblem}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Hospital</label>
                <input
                  type="text"
                  name="hospital"
                  placeholder="Example: Dhaka Medical"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Area</label>
                <input
                  type="text"
                  name="area"
                  placeholder="Example: Mirpur, Dhaka"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="field full">
                <label>Note</label>
                <textarea
                  name="note"
                  placeholder="Extra details..."
                  value={formData.note}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="submit-btn" type="submit">
              Create Emergency Request
            </button>
          </form>

          {message && <div className="message-box">{message}</div>}
        </div>

        <div className="form-card">
          <h2>Matching Donors</h2>
          <p>Donors matched by requested blood group.</p>

          {matchingDonors.length === 0 ? (
            <p>No matching donor selected/found.</p>
          ) : (
            <div className="matching-donor-list">
              {matchingDonors.map((donor) => (
                <div className="matching-donor-card" key={donor._id}>
                  <img
                    src={`http://localhost:5000${donor.photo}`}
                    alt={donor.name}
                  />

                  <div>
                    <h4>{donor.name}</h4>
                    <p>{donor.phone}</p>
                  </div>

                  <span className="blood-pill">{donor.bloodGroup}</span>
                  <strong>{donor.district}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-request-card">
        <div className="admin-request-heading">
          <div>
            <h2>All Blood Requests</h2>
            <p>Admin can search, filter and track every request.</p>
          </div>

          <strong>{filteredRequests.length} Requests</strong>
        </div>

        <div className="admin-request-filters">
          <input
            placeholder="Search patient, hospital, area, phone, donor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="">All Groups</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">All Areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Declined">Declined</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => {
              setSearch("");
              setGroupFilter("");
              setAreaFilter("");
              setStatusFilter("");
              setDateFilter("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="admin-request-table-wrap">
          <table className="admin-request-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Problem</th>
                <th>Blood</th>
                <th>Hospital</th>
                <th>Area</th>
                <th>Phone</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Accepted Donor</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="10">No blood request found.</td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.patientName}</td>
                    <td>{item.patientProblem}</td>
                    <td>
                      <span className="blood-pill">{item.bloodGroup}</span>
                    </td>
                    <td>{item.hospital}</td>
                    <td>{item.area}</td>
                    <td>{item.phone}</td>
                    <td>{item.urgency}</td>
                    <td>
                      <span className={`notification-status ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.acceptedDonor?.name || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmergencyRequest;