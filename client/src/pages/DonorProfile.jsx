import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function DonorProfile() {
  const { id } = useParams();

  const [donor, setDonor] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        const res = await api.get(`/donors/${id}`);

        setDonor(res.data.donor);
        setDonationHistory(res.data.donationHistory || []);
        setRequestHistory(res.data.requestHistory || []);
      } catch (error) {
        console.log("Donor profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorProfile();
  }, [id]);

  if (loading) {
    return <div className="profile-page">Loading donor profile...</div>;
  }

  if (!donor) {
    return <div className="profile-page">Donor not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-photo-wrap">
          <img
            src={`http://localhost:5000${donor.photo}`}
            alt={donor.name}
            className="profile-photo"
          />
        </div>

        <h1>{donor.name}</h1>
        <span className="profile-blood">{donor.bloodGroup}</span>

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
            <span>Address</span>
            <strong>{donor.address}</strong>
          </div>

          <div>
            <span>Availability</span>
            <strong>{donor.availability || "Available"}</strong>
          </div>
        </div>
      </div>

      <div className="profile-history-grid">
        <div className="profile-history-card">
          <h2>Donation History</h2>

          {donationHistory.length === 0 ? (
            <p>No donation history found.</p>
          ) : (
            donationHistory.map((item) => (
              <div className="history-item" key={item._id}>
                <strong>{item.date}</strong>
                <span>{item.place}</span>
              </div>
            ))
          )}
        </div>

        <div className="profile-history-card">
          <h2>Blood Request History</h2>

          {requestHistory.length === 0 ? (
            <p>No blood request history found.</p>
          ) : (
            requestHistory.map((item) => (
              <div className="history-item" key={item._id}>
                <strong>{item.patientName}</strong>
                <span>{item.hospital}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorProfile;