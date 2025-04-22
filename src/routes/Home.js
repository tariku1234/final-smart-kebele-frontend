"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import AlertCard from "../components/AlertCard"
import OfficeCard from "../components/OfficeCard"
import { API_URL } from "../config"
import "./Home.css"

const Home = () => {
  const [alerts, setAlerts] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alerts
        const alertsResponse = await fetch(`${API_URL}/api/alerts?limit=3`)
        const alertsData = await alertsResponse.json()

        // Fetch offices
        const officesResponse = await fetch(`${API_URL}/api/offices?limit=3`)
        const officesData = await officesResponse.json()

        setAlerts(alertsData.alerts)
        setOffices(officesData.offices)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching home data:", err)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Smart-Kebele</h1>
          <p className="hero-description">
            A platform for citizens to interact with local government services, focusing on anti-corruption and
            complaint handling.
          </p>
          <div className="hero-buttons">
            <Link to="/complaint" className="btn btn-primary">
              Report a Complaint
            </Link>
            <Link to="/documents" className="btn btn-secondary">
              View Documents
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Our Services</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Complaint Reporting</h3>
            <p className="feature-description">
              Report corruption and service-related issues directly to the anti-corruption department.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">Document Guidance</h3>
            <p className="feature-description">
              Access clear information about required documents and procedures for services.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">Safety Alerts</h3>
            <p className="feature-description">
              Stay informed about public safety threats and important announcements.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3 className="feature-title">Office Availability</h3>
            <p className="feature-description">
              Check the availability status of local government offices before visiting.
            </p>
          </div>
        </div>
      </section>

      <section className="alerts-section">
        <div className="section-header">
          <h2 className="section-title">Safety Alerts</h2>
          <Link to="/alerts" className="view-all-link">
            View All
          </Link>
        </div>
        {loading ? (
          <p>Loading alerts...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : alerts.length === 0 ? (
          <p>No alerts at this time.</p>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} />
            ))}
          </div>
        )}
      </section>

      <section className="offices-section">
        <div className="section-header">
          <h2 className="section-title">Office Availability</h2>
          <Link to="/offices" className="view-all-link">
            View All
          </Link>
        </div>
        {loading ? (
          <p>Loading office information...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : offices.length === 0 ? (
          <p>No office information available.</p>
        ) : (
          <div className="offices-grid">
            {offices.map((office) => (
              <OfficeCard key={office._id} office={office} />
            ))}
          </div>
        )}
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to report a complaint?</h2>
          <p className="cta-description">
            Help us improve government services by reporting corruption and service-related issues.
          </p>
          <Link to="/complaint" className="btn btn-primary">
            Report Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

