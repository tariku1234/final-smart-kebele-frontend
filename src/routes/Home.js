"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import OfficeCard from "../components/OfficeCard"
import { API_URL } from "../config"
import "./Home.css"
import { AuthContext } from "../context/AuthContext"

const Home = () => {
  const { user } = useContext(AuthContext)
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch offices
        const officesResponse = await fetch(`${API_URL}/api/offices?limit=3`)
        const officesData = await officesResponse.json()

        // Make sure we're setting arrays, even if the API returns unexpected data
        setOffices(Array.isArray(officesData.offices) ? officesData.offices : [])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching home data:", err)
        setError("Failed to load data. Please try again later.")
        setLoading(false)
        // Ensure we have empty arrays if there's an error
        setOffices([])
      }
    }

    fetchData()
  }, [])

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content" data-aos="fade-up">
          <h1 className="hero-title">Welcome to Smart-Kebele</h1>
          <p className="hero-description">
            A platform for citizens to interact with local government services, focusing on anti-corruption and
            complaint handling.
          </p>
          <div className="hero-buttons">
            {(!user || user.role === "citizen") && (
              <Link to="/complaint" className="btn btn-primary">
                Report a Complaint
              </Link>
            )}
            <Link to="/documents" className="btn btn-secondary">
              View Documents
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Our Services</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Complaint Reporting</h3>
            <p className="feature-description">
              Report corruption and service-related issues directly to the anti-corruption department.
            </p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">Document Guidance</h3>
            <p className="feature-description">
              Access clear information about required documents and procedures for services.
            </p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-icon">📰</div>
            <h3 className="feature-title">Blog Posts</h3>
            <p className="feature-description">
              Stay informed about important news, updates, and announcements from local government.
            </p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-icon">🏢</div>
            <h3 className="feature-title">Office Availability</h3>
            <p className="feature-description">
              Check the availability status of local government offices before visiting.
            </p>
          </div>
        </div>
      </section>

      <section className="offices-section">
        <div className="section-header">
          <h2 className="section-title">Office Availability</h2>
          <Link to="/offices" className="view-all-link">
          
          </Link>
        </div>
        {loading ? (
          <p className="loading-text">Loading office information...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : offices && offices.length === 0 ? (
          <p className="loading-text">No office information available.</p>
        ) : (
          <div className="offices-grid">
            {offices &&
              offices.map((office, index) => (
                <div key={office._id} data-aos="fade-up" data-aos-delay={index * 100}>
                  <OfficeCard office={office} />
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="cta-section">
        <div className="cta-content" data-aos="fade-up">
          <h2 className="cta-title">Ready to report a complaint?</h2>
          <p className="cta-description">
            Help us improve government services by reporting corruption and service-related issues.
          </p>
          {(!user || user.role === "citizen") && (
            <Link to="/complaint" className="btn btn-primary">
              Report Now
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
