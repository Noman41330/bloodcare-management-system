import { useState } from "react";
import api from "../api/api";

function BecomeDonor() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [formData, setFormData] = useState({
    bloodGroup: "",
    address: "",
    age: "",
    weight: "",
    lastDonationMonths: "",
    hasMajorIllness: "no",
    photo: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const res = await api.post("/auth/become-donor", data);

      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      localStorage.setItem("adminInfo", JSON.stringify(res.data.user));

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to become donor");
    }
  };

  return (
    <div className="register-page">
      <div className="form-card professional">
        <div className="form-card-header">
          <h2>Become a Donor</h2>
          <p>Your member data will be used automatically.</p>
        </div>

        <div className="member-info-box">
          <strong>{userInfo?.name}</strong>
          <span>{userInfo?.phone}</span>
          <span>{userInfo?.district}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select</option>
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
              <label>Age</label>
              <input name="age" type="number" value={formData.age} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Weight KG</label>
              <input name="weight" type="number" value={formData.weight} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Last Donation Months Ago</label>
              <input name="lastDonationMonths" type="number" value={formData.lastDonationMonths} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Major Illness?</label>
              <select name="hasMajorIllness" value={formData.hasMajorIllness} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="field full">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="field full">
              <label>Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} required />
            </div>
          </div>

          <button className="submit-btn" type="submit">
            Become Donor
          </button>
        </form>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default BecomeDonor;