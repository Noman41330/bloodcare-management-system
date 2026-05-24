import { useState } from "react";
import api from "../api/api";

function DonorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    district: "",
    address: "",
    religion: "",
    gender: "",
    isNewDonor: "Yes",
    lastDonationDate: "",
    isAgreed: false,
    photo: null,
    nidPhoto: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.isAgreed) {
      setMessage("Donor must agree before registration");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const res = await api.post("/donors/register", data);

      setMessage(res.data.message || "Donor registered successfully");

      setFormData({
        name: "",
        phone: "",
        bloodGroup: "",
        district: "",
        address: "",
        religion: "",
        gender: "",
        isNewDonor: "Yes",
        lastDonationDate: "",
        isAgreed: false,
        photo: null,
        nidPhoto: null,
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="single-form-card">
        <div className="form-card-header">
          <span className="auth-badge">New Donor</span>
          <h1>Register Blood Donor</h1>
          <p>
            Fill donor details carefully. Donor ID will be generated
            automatically from DNR10001.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="field">
              <label>Donor Name</label>
              <input
                name="name"
                placeholder="Example: Rahim Uddin"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Phone Number</label>
              <input
                name="phone"
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select blood group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div className="field">
              <label>District</label>
              <input
                name="district"
                placeholder="Example: Dhaka"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field full">
              <label>Full Address</label>
              <textarea
                name="address"
                placeholder="Example: Mirpur 10, Dhaka"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field full">
              <label>Religion</label>
              <div className="radio-group">
                {["Islam", "Hindu", "Christian", "Buddhist", "Others"].map(
                  (item) => (
                    <label key={item}>
                      <input
                        type="radio"
                        name="religion"
                        value={item}
                        checked={formData.religion === item}
                        onChange={handleChange}
                        required
                      />
                      {item}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="field full">
              <label>Gender</label>
              <div className="radio-group">
                {["Male", "Female", "Other"].map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="gender"
                      value={item}
                      checked={formData.gender === item}
                      onChange={handleChange}
                      required
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="field full">
              <label>New Donor?</label>
              <div className="radio-group">
                {["Yes", "No"].map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="isNewDonor"
                      value={item}
                      checked={formData.isNewDonor === item}
                      onChange={handleChange}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {formData.isNewDonor === "No" && (
              <div className="field">
                <label>Last Donation Date</label>
                <input
                  type="date"
                  name="lastDonationDate"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Donor Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="field">
              <label>NID Photo</label>
              <input
                type="file"
                name="nidPhoto"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="field full">
              <label className="agree-box">
                <input
                  type="checkbox"
                  name="isAgreed"
                  checked={formData.isAgreed}
                  onChange={handleChange}
                />
                I willingly agree to donate blood. No one forced me.
              </label>
            </div>
          </div>

          <button className="submit-btn" type="submit">
            Register Donor
          </button>
        </form>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default DonorRegister;