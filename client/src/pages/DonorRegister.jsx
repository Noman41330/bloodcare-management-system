import { useEffect, useState } from "react";
import api from "../api/api";

function DonorRegister() {
  const [isLoggedInMember, setIsLoggedInMember] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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

  useEffect(() => {
    const loadLoggedInUser = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) return;

      try {
        const res = await api.get("/auth/profile");
        const user = res.data.user;

        setIsLoggedInMember(user.role === "member");

        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          district: user.district || "",
        }));
      } catch (error) {
        console.log("Profile prefill failed:", error);
      }
    };

    loadLoggedInUser();
  }, []);

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
    setMessage("");

    if (!formData.isAgreed) {
      setMessage("Donor must agree before registration");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "email" || key === "password") {
          if (!isLoggedInMember && formData[key]) {
            data.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      let res;

      if (isLoggedInMember) {
        res = await api.post("/auth/become-donor", data);

        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        localStorage.setItem("adminInfo", JSON.stringify(res.data.user));
      } else {
        data.append("role", "donor");
        res = await api.post("/auth/register", data);
      }

      setMessage(res.data.message || "Donor registered successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Donor registration failed");
    }
  };

  return (
    <div className="donor-register-page">
      <div className="donor-register-card">
        <div className="auth-card-header">
          <span className="auth-badge">
            {isLoggedInMember ? "Become Donor" : "New Donor"}
          </span>

          <h1>Register Blood Donor</h1>

          <p>
            {isLoggedInMember
              ? "Your member information is pre-filled. You can edit before submitting."
              : "Create a donor account. You will automatically become a member too."}
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

            {!isLoggedInMember && (
              <>
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
              </>
            )}

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
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  )
                )}
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
              <div className="radio-group modern-radio-group">
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
              <div className="radio-group modern-radio-group">
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
              <div className="radio-group modern-radio-group">
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

          <button className="submit-btn auth-submit-btn" type="submit">
            {isLoggedInMember ? "Become Donor" : "Register as Donor"}
          </button>
        </form>

        {message && <div className="message-box">{message}</div>}
      </div>
    </div>
  );
}

export default DonorRegister;