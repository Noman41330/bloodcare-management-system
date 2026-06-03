import { useEffect, useState } from "react";
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
  const [message, setMessage] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleChange = async (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    if (name === "bloodGroup" && value) {
      try {
        const res = await api.get(`/emergency/match/${encodeURIComponent(value)}`);
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
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create emergency request"
      );
    }
  };

  return (
    <div className="emergency-page">
      <div className="page-heading">
        <div>
          <h1>Emergency Blood Request</h1>
          <p>Create urgent blood requests and notify matching donors.</p>
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
                  placeholder="Example: Delivery, accident, surgery, anemia..."
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
    </div>
  );
}

export default EmergencyRequest;