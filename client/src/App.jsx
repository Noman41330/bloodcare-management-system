import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import DonorRegister from "./pages/DonorRegister";
import DonorList from "./pages/DonorList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import EmergencyRequest from "./pages/EmergencyRequest";

function App() {
  return (
    <BrowserRouter>
      {/* App Shell = main layout wrapper */}
      <div className="app-shell">
        {/* Sidebar = professional dashboard navigation */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">🩸</div>
            <div>
              <h2>BloodCare</h2>
              <p>Donor Management</p>
            </div>
          </div>

          <nav className="side-nav">
            <NavLink to="/" end>
              Dashboard
            </NavLink>

            <NavLink to="/donor-register">
              Register Donor
            </NavLink>

            <NavLink to="/donors">
              Donor List
            </NavLink>

            <NavLink to="/dashboard">Admin Dashboard</NavLink>

            <NavLink to="/login">Login</NavLink>

            <NavLink to="/register">Create Admin</NavLink>

            <NavLink to="/emergency">
               Emergency Request
            </NavLink>
          </nav>
        </aside>

        {/* Main area = page content */}
        <main className="main-content">
          <header className="topbar">
            <div>
              <h3>Blood Donor Management System</h3>
              <p>Manage donor registration and donor records</p>
            </div>

            <button className="topbar-btn">Emergency Request</button>
          </header>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donor-register" element={<DonorRegister />} />
            <Route path="/donors" element={<DonorList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/emergency" element={<EmergencyRequest />} />

            <Route
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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