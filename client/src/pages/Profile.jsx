import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    district: "",
    profilePhoto: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/profile");

      setUser(res.data.user);
      setDonor(res.data.donor);

      setProfileForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        district: res.data.user.district || "",
        profilePhoto: null,
      });
    } catch (error) {
      console.log("Profile load error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePhoto = (e) => {
    setProfileForm({
      ...profileForm,
      profilePhoto: e.target.files[0],
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = new FormData();

      data.append("name", profileForm.name);
      data.append("phone", profileForm.phone);
      data.append("district", profileForm.district);

      if (profileForm.profilePhoto) {
        data.append("profilePhoto", profileForm.profilePhoto);
      }

      const res = await api.put("/auth/profile", data);

      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      localStorage.setItem("adminInfo", JSON.stringify(res.data.user));

      setMessage(res.data.message || "Profile updated successfully");
      setShowEditForm(false);
      loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Profile update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.put("/auth/change-password", passwordForm);

      setMessage(res.data.message || "Password changed successfully");

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
      });

      setShowPasswordForm(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password change failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("adminInfo");
    navigate("/login");
  };

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  if (!user) {
    return <div className="profile-page">Profile not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card member-profile-card">
        <div className="profile-photo-wrap">
          {user.photo ? (
            <img
              src={`http://localhost:5000${user.photo}`}
              alt={user.name}
              className="profile-photo"
            />
          ) : (
            <div className="member-profile-placeholder">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>

        <h1>{user.name}</h1>

        <div className="profile-badge-row">
          <span className="profile-donor-id">{user.role}</span>
        </div>

        <div className="member-action-buttons">
          <button
            type="button"
            className="submit-btn profile-action-btn"
            onClick={() => setShowEditForm(true)}
          >
            Edit Profile
          </button>

          <button
            type="button"
            className="submit-btn profile-action-btn"
            onClick={() => setShowPasswordForm(true)}
          >
            Change Password
          </button>

          {user.role === "donor" && donor && (
            <Link
              className="submit-btn profile-action-btn member-link-btn"
              to={`/donors/${donor._id}`}
            >
              Open Donor Profile
            </Link>
          )}

          {user.role === "member" && (
            <Link
              className="submit-btn profile-action-btn member-link-btn"
              to="/donor-register"
            >
              Become Donor
            </Link>
          )}

          {user.role === "admin" && (
            <Link
              className="submit-btn profile-action-btn member-link-btn"
              to="/dashboard"
            >
              Admin Dashboard
            </Link>
          )}

          <button type="button" className="delete-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {message && <div className="message-box">{message}</div>}

        <div className="profile-details-grid">
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{user.phone}</strong>
          </div>

          <div>
            <span>District</span>
            <strong>{user.district}</strong>
          </div>

          <div>
            <span>Account Type</span>
            <strong>{user.role}</strong>
          </div>
        </div>
      </div>

      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Edit Profile</h2>
                <p>Update your personal information.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="form-grid">
                <div className="field">
                  <label>Name</label>
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>District</label>
                  <input
                    name="district"
                    value={profileForm.district}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Update Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhoto}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>

                <button className="submit-btn" type="submit">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordForm(false)}
        >
          <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Change Password</h2>
                <p>Use your old password to set a new password.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowPasswordForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="form-grid">
                <div className="field">
                  <label>Old Password</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </button>

                <button className="submit-btn" type="submit">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;