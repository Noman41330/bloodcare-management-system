import { useState } from "react";
import api from "../api/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // handleChange = input value update
  const handleChange = (e) => {
    setFormData({
      ...formData,

      // e.target.name = name/email/password
      // e.target.value = typed value
      [e.target.name]: e.target.value,
    });
  };

  // handleRegister = submit form to backend
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      // API request = POST http://localhost:5000/api/auth/register
      const res = await api.post("/auth/register", formData);

      setMessage(res.data.message || "Admin registered successfully");
      setMessageType("success");

      // Clear form after success
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      // Console helps us see exact backend/frontend error
      console.log("FULL ERROR:", error);
      console.log("BACKEND RESPONSE:", error.response?.data);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Registration failed"
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-badge">Create Admin</span>

        <h1>Register Admin</h1>
        <p>Create an admin account for this system.</p>

        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Admin name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>

        {message && (
          <div className={messageType === "success" ? "message-box" : "error-box"}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;