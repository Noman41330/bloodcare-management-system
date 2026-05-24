import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";

import { useState } from "react";

import Home from "./pages/Home";
import DonorRegister from "./pages/DonorRegister";
import DonorList from "./pages/DonorList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import EmergencyRequest from "./pages/EmergencyRequest";
import BecomeDonor from "./pages/BecomeDonor";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="site-shell">
        {/* TOP NAVBAR */}
        <header className="site-navbar">
          {/* LEFT */}
          <div className="nav-left">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>

          {/* CENTER */}
          <Link to="/" className="site-logo center-logo">
            <span className="site-logo-icon">🩸</span>
            <span>BloodCare</span>
          </Link>

          {/* RIGHT */}
          <div className="top-actions">
            <NavLink to="/login" className="login-link">
              Login
            </NavLink>

            <NavLink to="/emergency" className="demo-btn">
              Emergency Request
            </NavLink>
          </div>
        </header>

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-menu">
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/dashboard">
              Dashboard
            </NavLink>

            <NavLink to="/donor-register">
              Register Donor
            </NavLink>

            <NavLink to="/donors">
              Donor List
            </NavLink>

            <NavLink to="/emergency">
              Emergency
            </NavLink>
            <NavLink to="/become-donor">Become Donor</NavLink>
          </div>
        </aside>

        {/* OVERLAY */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* MAIN */}
        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/donor-register"
              element={
                <ProtectedRoute>
                  <DonorRegister />
                </ProtectedRoute>
              }
            />

            <Route
              path="/donors"
              element={
                <ProtectedRoute>
                  <DonorList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/emergency"
              element={
                <ProtectedRoute>
                  <EmergencyRequest />
                </ProtectedRoute>
              }
            />

            <Route
          path="/become-donor"
          element={
            <ProtectedRoute>
              <BecomeDonor />
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