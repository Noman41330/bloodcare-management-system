import { useState } from "react";
import axios from "axios";

function DonorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    district: "",
    address: "",
    photo: null,
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State update = update form value when user types
  const handleChange = (e) => {
    setFormData({
      ...formData,

      // Dynamic key = name/phone/bloodGroup/district/address
      [e.target.name]: e.target.value,
    });
  };

  // File state = store selected image file
  const handlePhotoChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0],
    });
  };

  // Submit handler = send donor data to backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");

      // FormData = required for image upload
      const data = new FormData();

      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("district", formData.district);
      data.append("address", formData.address);
      data.append("photo", formData.photo);

      const res = await axios.post(
        "http://localhost:5000/api/donors/register",
        data
      );

      setMessage(res.data.message);

      setFormData({
        name: "",
        phone: "",
        bloodGroup: "",
        district: "",
        address: "",
        photo: null,
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <section className="form-shell">
        <div className="form-info">
          <span className="status-badge">New Donor</span>

          <h1>Register Blood Donor</h1>

          <p>
            Add verified donor information with photo, blood group, contact
            number, and location details.
          </p>

          <div className="info-list">
            <div>
              <strong>Secure Record</strong>
              <span>Data saved into MongoDB database</span>
            </div>

            <div>
              <strong>Photo Upload</strong>
              <span>Donor image stored in backend uploads folder</span>
            </div>

            <div>
              <strong>Emergency Ready</strong>
              <span>Useful for future donor search and filtering</span>
            </div>
          </div>
        </div>

        <div className="form-card professional">
          <div className="form-card-header">
            <h2>Donor Information</h2>
            <p>Please fill all required fields carefully.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Donor Name</label>
                <input
                  type="text"
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
                  type="text"
                  name="phone"
                  placeholder="Example: 017XXXXXXXX"
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
                <label>District</label>
                <input
                  type="text"
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
                <label>Donor Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} required />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Donor"}
            </button>
          </form>

          {message && <div className="message-box">{message}</div>}
        </div>
      </section>
    </div>
  );
}

export default DonorRegister;