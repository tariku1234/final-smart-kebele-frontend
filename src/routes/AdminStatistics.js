"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./AdminStatistics.css"

const AdminStatistics = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    stakeholders: {
      total: 0,
      approved: 0,
      pending: 0,
    },
    weredaAdmins: {
      total: 0,
      approved: 0,
      pending: 0,
    },
    kifleketemaAdmins: {
      total: 0,
      approved: 0,
      pending: 0,
    },
    kentibaAdmins: {
      total: 0,
    },
    citizens: {
      total: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Redirect if not logged in or not Kentiba Biro
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "kentiba_biro") {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/admin/user-statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setStats(data.stats)
        } else {
          setError(data.message || "Failed to fetch user statistics")
        }
      } catch (err) {
        console.error("Error fetching user statistics:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "kentiba_biro") {
      fetchUserStats()
    }
  }, [user])

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="admin-statistics-container">
      <h2 className="page-title">System User Statistics</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading statistics...</p>
      ) : (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3 className="stat-title">Citizens</h3>
            <div className="stat-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{stats.citizens.total}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Stakeholder Offices</h3>
            <div className="stat-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{stats.stakeholders.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved:</span>
                <span className="stat-value">{stats.stakeholders.approved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Approval:</span>
                <span className="stat-value">{stats.stakeholders.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Wereda Administrators</h3>
            <div className="stat-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{stats.weredaAdmins.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved:</span>
                <span className="stat-value">{stats.weredaAdmins.approved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Approval:</span>
                <span className="stat-value">{stats.weredaAdmins.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Kifleketema Administrators</h3>
            <div className="stat-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{stats.kifleketemaAdmins.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Approved:</span>
                <span className="stat-value">{stats.kifleketemaAdmins.approved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Approval:</span>
                <span className="stat-value">{stats.kifleketemaAdmins.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Kentiba Biro Administrators</h3>
            <div className="stat-content">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{stats.kentibaAdmins.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminStatistics

