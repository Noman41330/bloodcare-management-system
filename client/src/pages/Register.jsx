import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: "",
    profilePhoto: null,
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
      profilePhoto: e.target.files[0],
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = new FormData();

      data.append("role", "member");

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const res = await api.post("/auth/register", data);

      setMessage(res.data.message || "Member registered successfully");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card modern-register-card">
        <div className="auth-card-header">
          <span className="auth-badge">Member Registration</span>
          <h1>Join BloodCare</h1>
          <p>
            Create a member account to request blood, track requests, and become
            a donor anytime.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="field">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="Example: Rahim Uddin"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Phone</label>
              <input
                name="phone"
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
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

            <div className="field">
              <label>Profile Photo</label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <button className="submit-btn auth-submit-btn" type="submit">
            Join as Member
          </button>
        </form>

        <div className="auth-footer-text">
          Want to donate blood directly?{" "}
          <Link to="/donor-register">Register as Donor</Link>
        </div>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default Register;