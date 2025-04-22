"use client"

import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Smart-Kebele
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/documents" className="navbar-link">
              Documents
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/alerts" className="navbar-link">
              Safety Alerts
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/offices" className="navbar-link">
              Office Availability
            </Link>
          </li>
          {user ? (
            <>
              {user.role === "citizen" && (
                <>
                  <li className="navbar-item">
                    <Link to="/complaint" className="navbar-link">
                      Report Complaint
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/citizen-complaints" className="navbar-link">
                      My Complaints
                    </Link>
                  </li>
                </>
              )}
              {user.role === "stakeholder_office" && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link">
                    Manage Complaints
                  </Link>
                </li>
              )}
              {user.role === "wereda_anti_corruption" && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link">
                    Wereda Dashboard
                  </Link>
                </li>
              )}
              {user.role === "kifleketema_anti_corruption" && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link">
                    Kifleketema Dashboard
                  </Link>
                </li>
              )}
              {user.role === "kentiba_biro" && (
                <>
                  <li className="navbar-item">
                    <Link to="/admin" className="navbar-link">
                      Kentiba Dashboard
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/stakeholders" className="navbar-link">
                      Approve Stakeholders
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/approve-admins" className="navbar-link">
                      Approve Administrators
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/statistics" className="navbar-link">
                      User Statistics
                    </Link>
                  </li>
                </>
              )}
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

