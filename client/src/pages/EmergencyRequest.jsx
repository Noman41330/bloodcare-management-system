import { useEffect, useState } from "react";
import api from "../api/api";

function EmergencyRequest() {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    hospital: "",
    phone: "",
    urgency: "Urgent",
    note: "",
  });

  const [requests, setRequests] = useState([]);
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [message, setMessage] = useState("");

  // handleChange = update form data
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // fetch emergency requests
  const fetchRequests = async () => {
    const res = await api.get("/emergency");
    setRequests(res.data.requests);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // submit emergency request
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/emergency", formData);

      setMessage(res.data.message);

      // Find matching donors immediately
      const matchRes = await api.get(`/emergency/match/${formData.bloodGroup}`);
      setMatchingDonors(matchRes.data.donors);

      setFormData({
        patientName: "",
        bloodGroup: "",
        hospital: "",
        phone: "",
        urgency: "Urgent",
        note: "",
      });

      fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || "Request failed");
    }
  };

  // update status
  const markCompleted = async (id) => {
    await api.patch(`/emergency/${id}/status`, {
      status: "Completed",
    });

    fetchRequests();
  };

  return (
    <div className="emergency-page">
      <div className="page-heading">
        <div>
          <h1>Emergency Blood Request</h1>
          <p>Create urgent blood requests and find matching donors.</p>
        </div>
      </div>

      <section className="emergency-grid">
        <div className="form-card professional">
          <div className="form-card-header">
            <h2>Create Request</h2>
            <p>Fill patient and hospital information.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Example: Rahim Uddin"
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
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="field">
                <label>Hospital</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Example: Dhaka Medical"
                  required
                />
              </div>

              <div className="field">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="017XXXXXXXX"
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
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Extra details..."
                />
              </div>
            </div>

            <button className="submit-btn" type="submit">
              Create Emergency Request
            </button>
          </form>

          {message && <div className="message-box">{message}</div>}
        </div>

        <div className="section-card">
          <div className="section-title">
            <h2>Matching Donors</h2>
            <p>Donors matched by requested blood group.</p>
          </div>

          {matchingDonors.length === 0 ? (
            <p className="table-message">No matching donor selected yet</p>
          ) : (
            <div className="recent-donor-list">
              {matchingDonors.map((donor) => (
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
        </div>
      </section>

      <section className="section-card">
        <div className="section-title">
          <h2>Emergency Requests</h2>
          <p>All emergency blood requests.</p>
        </div>

        {requests.length === 0 ? (
          <p className="table-message">No emergency request found</p>
        ) : (
          <div className="request-list">
            {requests.map((item) => (
              <div className="request-card" key={item._id}>
                <div>
                  <h3>{item.patientName}</h3>
                  <p>{item.hospital}</p>
                  <small>{item.phone}</small>
                </div>

                <span className="blood-pill">{item.bloodGroup}</span>

                <span className={`urgency ${item.urgency.toLowerCase()}`}>
                  {item.urgency}
                </span>

                <span className="status-pill">{item.status}</span>

                {item.status === "Pending" && (
                  <button
                    className="complete-btn"
                    onClick={() => markCompleted(item._id)}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default EmergencyRequest;