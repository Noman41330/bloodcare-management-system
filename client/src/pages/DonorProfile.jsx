import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function DonorProfile() {
  const { id } = useParams();

  const [donor, setDonor] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [donationForm, setDonationForm] = useState({
    donationDate: "",
    hospitalName: "",
    area: "",
    note: "",
  });

  const [historySearch, setHistorySearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [message, setMessage] = useState("");

  const fetchDonorProfile = async () => {
    try {
      setLoading(true);

      const donorRes = await api.get(`/donors/${id}`);
      const historyRes = await api.get(`/donations/donor/${id}`);
      const notificationRes = await api.get(`/notifications/donor/${id}`);

      setDonor(donorRes.data.donor);
      setDonationHistory(historyRes.data.histories || []);
      setNotifications(notificationRes.data.notifications || []);
    } catch (error) {
      console.log("Donor profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorProfile();
  }, [id]);

  const pendingRequestCount = notifications.filter(
    (item) => item.status === "Pending"
  ).length;

  const getDonationCounter = () => {
    if (!donor.lastDonationDate) {
      return {
        daysLeft: 0,
        text: "Ready to donate",
        available: true,
      };
    }

    const lastDate = new Date(donor.lastDonationDate);
    const today = new Date();

    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(90 - diffDays, 0);

    return {
      daysLeft,
      text: daysLeft > 0 ? `${daysLeft} days left` : "Ready to donate",
      available: daysLeft === 0,
    };
  };

  const donationCounter = getDonationCounter();

  const handleDonationChange = (e) => {
    setDonationForm({
      ...donationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleManualDonation = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/donations/manual", {
        donorId: donor._id,
        donationDate: donationForm.donationDate,
        hospitalName: donationForm.hospitalName,
        area: donationForm.area,
        note: donationForm.note,
      });

      setMessage(res.data.message || "Donation history added successfully");
      setShowDonationForm(false);

      setDonationForm({
        donationDate: "",
        hospitalName: "",
        area: "",
        note: "",
      });

      fetchDonorProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add donation");
    }
  };

  const handleAcceptRequest = async (notificationId) => {
    try {
      const res = await api.patch(`/notifications/${notificationId}/accept`);
      setMessage(res.data.message || "Request accepted successfully");
      fetchDonorProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleDeclineRequest = async (notificationId) => {
    try {
      const res = await api.patch(`/notifications/${notificationId}/decline`);
      setMessage(res.data.message || "Request declined");
      fetchDonorProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to decline request");
    }
  };

  const handleDonationSuccessful = async (notificationId) => {
    try {
      const res = await api.post(`/notifications/${notificationId}/successful`, {
        note: "Donation completed by donor confirmation",
      });

      setMessage(res.data.message || "Donation successful");
      fetchDonorProfile();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to mark donation successful"
      );
    }
  };

  const filteredDonationHistory = donationHistory.filter((item) => {
    const searchText = `
      ${item.hospitalName || ""}
      ${item.area || ""}
      ${item.note || ""}
      ${item.source || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(historySearch.toLowerCase());
    const matchesSource = sourceFilter === "" || item.source === sourceFilter;

    const matchesDate =
      dateFilter === "" ||
      new Date(item.donationDate).toISOString().slice(0, 10) === dateFilter;

    return matchesSearch && matchesSource && matchesDate;
  });

  if (loading) {
    return <div className="profile-page">Loading donor profile...</div>;
  }

  if (!donor) {
    return <div className="profile-page">Donor not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-action-row">
        <div className="donation-counter-box">
          <span>Donation Counter</span>

          <h3>{donationCounter.text}</h3>

          <p>
            {donationCounter.available
              ? "Donor is eligible now"
              : "Counter will reset after next donation"}
          </p>
        </div>

        <button
          type="button"
          className="blood-request-btn"
          onClick={() => setShowRequestModal(true)}
        >
          Blood Requests
          {pendingRequestCount > 0 && (
            <span className="request-count">{pendingRequestCount}</span>
          )}
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-photo-wrap">
          <img
            src={`http://localhost:5000${donor.photo}`}
            alt={donor.name}
            className="profile-photo"
          />
        </div>

        <h1>{donor.name}</h1>

        <div className="profile-badge-row">
          <span className="profile-blood">{donor.bloodGroup}</span>
          <span className="profile-donor-id">{donor.donorId || "No ID"}</span>
        </div>

        <button
          type="button"
          className="submit-btn profile-action-btn"
          onClick={() => setShowDonationForm(true)}
        >
          Manual Donation Update
        </button>

        {message && <div className="message-box">{message}</div>}

        <div className="profile-details-grid">
          <div>
            <span>Phone</span>
            <strong>{donor.phone}</strong>
          </div>

          <div>
            <span>District</span>
            <strong>{donor.district}</strong>
          </div>

          <div>
            <span>Religion</span>
            <strong>{donor.religion || "-"}</strong>
          </div>

          <div>
            <span>Gender</span>
            <strong>{donor.gender || "-"}</strong>
          </div>

          <div>
            <span>Last Donation</span>
            <strong>
              {donor.lastDonationDate
                ? new Date(donor.lastDonationDate).toLocaleDateString()
                : "-"}
            </strong>
          </div>

          <div>
            <span>Availability</span>
            <strong>{donor.availability || "Available"}</strong>
          </div>

          <div>
            <span>Address</span>
            <strong>{donor.address}</strong>
          </div>
        </div>
      </div>

      <div className="profile-history-grid">
        <div className="profile-history-card wide-history-card">
          <h2>Donation History</h2>

          <div className="history-filter-row">
            <input
              placeholder="Search hospital, area, note or source..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="Manual">Manual</option>
              <option value="Blood Request">Blood Request</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {filteredDonationHistory.length === 0 ? (
            <p>No donation history found.</p>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hospital</th>
                    <th>Area</th>
                    <th>Source</th>
                    <th>Note</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDonationHistory.map((item) => (
                    <tr key={item._id}>
                      <td>{new Date(item.donationDate).toLocaleDateString()}</td>
                      <td>{item.hospitalName}</td>
                      <td>{item.area}</td>
                      <td>
                        <span className="source-pill">{item.source}</span>
                      </td>
                      <td>{item.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="profile-history-card">
          <h2>Blood Request History</h2>

          {notifications.length === 0 ? (
            <p>No blood request history found.</p>
          ) : (
            <div className="request-history-list">
              {notifications.map((item) => {
                const request = item.requestId;

                return (
                  <div className="request-history-card" key={item._id}>
                    <div>
                      <strong>{request?.patientName || "Unknown Patient"}</strong>
                      <span>{request?.hospital || item.hospital}</span>
                      <small>{request?.area || item.area}</small>
                    </div>

                    <span className={`notification-status ${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Blood Requests</h2>
                <p>Pending, accepted, declined and completed requests.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowRequestModal(false)}
              >
                ×
              </button>
            </div>

            {notifications.length === 0 ? (
              <p>No blood request notification found.</p>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => {
                  const request = item.requestId;

                  return (
                    <div className="notification-card" key={item._id}>
                      <div className="notification-content">
                        <div className="notification-top">
                          <h3>{item.title}</h3>
                          <span className={`notification-status ${item.status}`}>
                            {item.status}
                          </span>
                        </div>

                        <p>{item.message}</p>

                        <div className="notification-details">
                          <span>
                            <strong>Patient:</strong>{" "}
                            {request?.patientName || "-"}
                          </span>

                          <span>
                            <strong>Problem:</strong>{" "}
                            {request?.patientProblem || "-"}
                          </span>

                          <span>
                            <strong>Hospital:</strong>{" "}
                            {request?.hospital || item.hospital}
                          </span>

                          <span>
                            <strong>Area:</strong>{" "}
                            {request?.area || item.area}
                          </span>

                          <span>
                            <strong>Phone:</strong> {request?.phone || "-"}
                          </span>

                          <span>
                            <strong>Urgency:</strong>{" "}
                            {request?.urgency || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="notification-actions">
                        {item.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => handleAcceptRequest(item._id)}
                            >
                              Accept Request
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleDeclineRequest(item._id)}
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {item.status === "Accepted" && (
                          <button
                            type="button"
                            className="submit-btn success-action-btn"
                            onClick={() => handleDonationSuccessful(item._id)}
                          >
                            Donation Successful
                          </button>
                        )}

                        {item.status === "Completed" && (
                          <span className="completed-label">
                            Donation Completed
                          </span>
                        )}

                        {item.status === "Declined" && (
                          <span className="declined-label">Declined</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showDonationForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDonationForm(false)}
        >
          <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Manual Donation Update</h2>
                <p>Add new donation history for {donor.name}</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDonationForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleManualDonation}>
              <div className="form-grid">
                <div className="field">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="donationDate"
                    value={donationForm.donationDate}
                    onChange={handleDonationChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Hospital Name *</label>
                  <input
                    type="text"
                    name="hospitalName"
                    placeholder="Example: Dhaka Medical"
                    value={donationForm.hospitalName}
                    onChange={handleDonationChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Area *</label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Example: Mirpur"
                    value={donationForm.area}
                    onChange={handleDonationChange}
                    required
                  />
                </div>

                <div className="field full">
                  <label>Note / Comment</label>
                  <textarea
                    name="note"
                    placeholder="Optional note..."
                    value={donationForm.note}
                    onChange={handleDonationChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowDonationForm(false)}
                >
                  Cancel
                </button>

                <button className="submit-btn" type="submit">
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorProfile;