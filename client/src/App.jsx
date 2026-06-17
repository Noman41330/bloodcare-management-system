import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import DonorRegister from "./pages/DonorRegister";
import DonorList from "./pages/DonorList";
import DonorProfile from "./pages/DonorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EmergencyRequest from "./pages/EmergencyRequest";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="brand-box">
            <div className="brand-icon">🩸</div>
            <div>
              <h2>BloodCare</h2>
              <p>Donor Management</p>
            </div>
          </div>

          <nav>
            <NavLink to="/" onClick={closeSidebar}>Home</NavLink>
            <NavLink to="/dashboard" onClick={closeSidebar}>Dashboard</NavLink>
            <NavLink to="/register" onClick={closeSidebar}>Join Member</NavLink>
            <NavLink to="/donor-register" onClick={closeSidebar}>Register Donor</NavLink>
            <NavLink to="/donors" onClick={closeSidebar}>Donor List</NavLink>
            <NavLink to="/emergency" onClick={closeSidebar}>Emergency</NavLink>
            <NavLink to="/profile" onClick={closeSidebar}>Profile</NavLink>
            <NavLink to="/login" onClick={closeSidebar}>Login</NavLink>
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}

        <main className="main-content">
          <header className="topbar">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <NavLink to="/" className="top-logo">
              <span>🩸</span>
              <strong>BloodCare</strong>
            </NavLink>

            <div className="topbar-actions">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/emergency" className="emergency-top-btn">
                Emergency Request
              </NavLink>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/donor-register" element={<DonorRegister />} />
            <Route path="/donors" element={<DonorList />} />
            <Route path="/donors/:id" element={<DonorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/emergency" element={<EmergencyRequest />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;