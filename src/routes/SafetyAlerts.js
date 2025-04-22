"use client"

import { useState, useEffect } from "react"
import AlertCard from "../components/AlertCard"
import { API_URL, ALERT_PRIORITY } from "../config"
import "./SafetyAlerts.css"

const SafetyAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let url = `${API_URL}/api/alerts`

        if (filter !== "all") {
          url += `?priority=${filter}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok) {
          setAlerts(data.alerts)
        } else {
          setError(data.message || "Failed to fetch safety alerts")
        }
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  return (
    <div className="safety-alerts-container">
      <h2 className="page-title">Safety Alerts</h2>
      <p className="page-description">Stay informed about public safety threats and important announcements.</p>

      <div className="filter-container">
        <label htmlFor="priority-filter" className="filter-label">
          Filter by Priority:
        </label>
        <select id="priority-filter" value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Priorities</option>
          <option value={ALERT_PRIORITY.HIGH}>High Priority</option>
          <option value={ALERT_PRIORITY.MEDIUM}>Medium Priority</option>
          <option value={ALERT_PRIORITY.LOW}>Low Priority</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading safety alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="no-alerts">No safety alerts found.</p>
      ) : (
        <div className="alerts-grid">
          {alerts.map((alert) => (
            <AlertCard key={alert._id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SafetyAlerts

