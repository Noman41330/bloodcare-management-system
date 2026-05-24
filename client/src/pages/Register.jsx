import { useState } from "react";
import api from "../api/api";

function Register() {
  const [role, setRole] = useState("member");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("role", role);

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const res = await api.post("/auth/register", data);

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide-auth">
        <span className="auth-badge">Create Account</span>

        <h1>Register Account</h1>
        <p>Register as a member or directly as an eligible donor.</p>

        <div className="role-switch">
          <button
            type="button"
            className={role === "member" ? "active" : ""}
            onClick={() => setRole("member")}
          >
            Member
          </button>

          <button
            type="button"
            className={role === "donor" ? "active" : ""}
            onClick={() => setRole("donor")}
          >
            Donor
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>District</label>
              <input name="district" value={formData.district} onChange={handleChange} required />
            </div>

            {role === "donor" && (
              <>
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
              </>
            )}
          </div>

          <button type="submit">
            {role === "donor" ? "Register as Donor" : "Register as Member"}
          </button>
        </form>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default Register;