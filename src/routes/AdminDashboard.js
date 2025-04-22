"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import ComplaintCard from "../components/ComplaintCard"
import { API_URL, USER_ROLES } from "../config"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0,
  })

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role === USER_ROLES.CITIZEN) {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch complaints based on admin role
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return

      try {
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/complaints`

        // Add query parameters based on filter
        if (filter !== "all") {
          url += `?status=${filter}`
        }

        console.log("Fetching complaints from:", url)

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Server response:", errorText)
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Complaints data:", data)

        setComplaints(data.complaints || [])

        // Calculate stats from the complaints
        const complaintStats = {
          total: data.complaints ? data.complaints.length : 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          escalated: 0,
        }

        if (data.complaints && data.complaints.length > 0) {
          data.complaints.forEach((complaint) => {
            switch (complaint.status) {
              case "pending":
                complaintStats.pending++
                break
              case "in_progress":
                complaintStats.inProgress++
                break
              case "resolved":
                complaintStats.resolved++
                break
              case "escalated":
                complaintStats.escalated++
                break
              default:
                break
            }
          })
        }

        setStats(complaintStats)
      } catch (err) {
        console.error("Error fetching complaints:", err)
        setError(`Failed to load data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== USER_ROLES.CITIZEN) {
      fetchComplaints()
    }
  }, [user, filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  const getRoleName = (role) => {
    switch (role) {
      case USER_ROLES.STAKEHOLDER_OFFICE:
        return "Stakeholder Office"
      case USER_ROLES.WEREDA_ANTI_CORRUPTION:
        return "Wereda Anti-Corruption"
      case USER_ROLES.KIFLEKETEMA_ANTI_CORRUPTION:
        return "Kifleketema Anti-Corruption"
      case USER_ROLES.KENTIBA_BIRO:
        return "Kentiba Biro"
      default:
        return "Administrator"
    }
  }

  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">{getRoleName(user.role)} Dashboard</h2>

      <div className="stats-container">
        <div className="stat-card">
          <h3 className="stat-title">Total</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Pending</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">In Progress</h3>
          <p className="stat-value">{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Resolved</h3>
          <p className="stat-value">{stats.resolved}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Escalated</h3>
          <p className="stat-value">{stats.escalated}</p>
        </div>
      </div>

      <div className="filter-container">
        <label htmlFor="filter" className="filter-label">
          Filter by Status:
        </label>
        <select id="filter" value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="no-complaints">No complaints found.</p>
      ) : (
        <div className="complaints-container">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
