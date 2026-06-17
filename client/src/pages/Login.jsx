import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/profile");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      localStorage.setItem("adminInfo", JSON.stringify(res.data.user));

      redirectByRole(res.data.user.role);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", {
        email: forgotEmail,
      });

      setResetToken(res.data.resetToken || "");
      setMessage(
        `Reset token generated. Token: ${res.data.resetToken}`
      );
      setShowReset(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Forgot password failed");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });

      setMessage(res.data.message || "Password reset successfully");
      setShowForgot(false);
      setShowReset(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-card-header">
          <span className="auth-badge">Unified Access</span>
          <h1>Login to BloodCare</h1>
          <p>Admin, member and donor can login from the same page.</p>
        </div>

        {!showForgot && (
          <form onSubmit={handleLogin}>
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
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="submit-btn auth-submit-btn" type="submit">
              Login
            </button>

            <button
              type="button"
              className="text-link-btn"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </form>
        )}

        {showForgot && (
          <form onSubmit={handleForgotPassword}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <button className="submit-btn auth-submit-btn" type="submit">
              Generate Reset Token
            </button>

            <button
              type="button"
              className="text-link-btn"
              onClick={() => {
                setShowForgot(false);
                setShowReset(false);
              }}
            >
              Back to login
            </button>
          </form>
        )}

        {showReset && (
          <form onSubmit={handleResetPassword} className="reset-box">
            <div className="field">
              <label>Reset Token</label>
              <input
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button className="submit-btn auth-submit-btn" type="submit">
              Reset Password
            </button>
          </form>
        )}

        <div className="auth-footer-text">
          New member? <Link to="/register">Join as Member</Link>
        </div>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default Login;