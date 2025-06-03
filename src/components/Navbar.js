"use client"

import { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Only apply scroll behavior on desktop
    if (isMobile) {
      setIsVisible(true)
      return
    }

    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", controlNavbar)
    return () => window.removeEventListener("scroll", controlNavbar)
  }, [lastScrollY, isMobile])

  const handleLogout = () => {
    logout()
    navigate("/login")
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`navbar ${isVisible ? "navbar-visible" : "navbar-hidden"}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src="/images/smart-kebele-logo.png" alt="Smart Kebele" className="navbar-logo-image" />
        </Link>

        {/* Hamburger Menu Button */}
        {isMobile && (
          <button
            className={`hamburger ${isMobileMenuOpen ? "hamburger-active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}

        {/* Navigation Menu */}
        <ul className={`navbar-menu ${isMobile ? (isMobileMenuOpen ? "mobile-menu-open" : "mobile-menu-closed") : ""}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/blog" className="navbar-link" onClick={closeMobileMenu}>
              Blog
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/documents" className="navbar-link" onClick={closeMobileMenu}>
              Documents
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/offices" className="navbar-link" onClick={closeMobileMenu}>
              Office Availability
            </Link>
          </li>
          {user ? (
            <>
              {user.role === "citizen" && (
                <>
                  <li className="navbar-item">
                    <Link to="/complaint" className="navbar-link" onClick={closeMobileMenu}>
                      Report Complaint
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/citizen-complaints" className="navbar-link" onClick={closeMobileMenu}>
                      My Complaints
                    </Link>
                  </li>
                </>
              )}
              {user.role === "stakeholder_office" && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                    Manage Complaints
                  </Link>
                </li>
              )}
              {user.role === "wereda_anti_corruption" && (
                <>
                  <li className="navbar-item">
                    <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                      Wereda Dashboard
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/offices" className="navbar-link" onClick={closeMobileMenu}>
                      Manage Offices
                    </Link>
                  </li>
                </>
              )}
              {user.role === "kifleketema_anti_corruption" && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                    Kifleketema Dashboard
                  </Link>
                </li>
              )}
              {user.role === "kentiba_biro" && (
                <>
                  <li className="navbar-item">
                    <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                      Kentiba Dashboard
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/stakeholders" className="navbar-link" onClick={closeMobileMenu}>
                      Approve Stakeholders
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/approve-admins" className="navbar-link" onClick={closeMobileMenu}>
                      Approve Administrators
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/statistics" className="navbar-link" onClick={closeMobileMenu}>
                      User Statistics
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/documents" className="navbar-link" onClick={closeMobileMenu}>
                      Manage Documents
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admin/reports" className="navbar-link" onClick={closeMobileMenu}>
                      Performance
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
                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link" onClick={closeMobileMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Overlay */}
        {isMobile && isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
      </div>
    </nav>
  )
}

export default Navbar
