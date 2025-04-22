"use client"

import { useState, useEffect } from "react"
import OfficeCard from "../components/OfficeCard"
import { API_URL, OFFICE_STATUS } from "../config"
import "./OfficeAvailability.css"

const OfficeAvailability = () => {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        let url = `${API_URL}/api/offices`

        if (filter !== "all") {
          url += `?status=${filter}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok) {
          setOffices(data.offices)
        } else {
          setError(data.message || "Failed to fetch office information")
        }
      } catch (err) {
        console.error("Error fetching offices:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    fetchOffices()
  }, [filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter offices based on search term
  const filteredOffices = offices.filter(
    (office) =>
      office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="office-availability-container">
      <h2 className="page-title">Office Availability</h2>
      <p className="page-description">Check the availability status of local government offices before visiting.</p>

      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search offices..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="status-filter">
          <label htmlFor="status-filter" className="filter-label">
            Filter by Status:
          </label>
          <select id="status-filter" value={filter} onChange={handleFilterChange} className="filter-select">
            <option value="all">All Offices</option>
            <option value={OFFICE_STATUS.OPEN}>Open</option>
            <option value={OFFICE_STATUS.LIMITED}>Limited Service</option>
            <option value={OFFICE_STATUS.CLOSED}>Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading office information...</p>
      ) : filteredOffices.length === 0 ? (
        <p className="no-offices">No offices found matching your criteria.</p>
      ) : (
        <div className="offices-grid">
          {filteredOffices.map((office) => (
            <OfficeCard key={office._id} office={office} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OfficeAvailability

