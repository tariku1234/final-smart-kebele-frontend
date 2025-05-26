"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import ComplaintCard from "../components/ComplaintCard"
import { API_URL, USER_ROLES } from "../config"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { user, loading: authLoading, userDataReady } = useContext(AuthContext)
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
    if (!authLoading && user === null) {
      navigate("/login")
      return
    }

    if (!authLoading && user && user.role === USER_ROLES.CITIZEN) {
      navigate("/")
      return
    }
  }, [user, authLoading, navigate])

  // Fetch complaints based on admin role
  useEffect(() => {
    const fetchComplaints = async () => {
      // Only fetch complaints if user data is fully loaded
      if (!userDataReady || !user) return

      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/complaints`

        // Add query parameters based on filter
        if (filter !== "all") {
          url += `?status=${filter}`
        }

        console.log("Fetching complaints from:", url)
        console.log("Current user role:", user.role)
        console.log("User location data:", {
          kifleketema: user.kifleketema,
          wereda: user.wereda,
        })

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

        // Filter complaints based on user's role and location
        let filteredComplaints = data.complaints || []

        // Additional client-side filtering for wereda administrators
        if (user.role === USER_ROLES.WEREDA_ANTI_CORRUPTION && user.kifleketema && user.wereda) {
          filteredComplaints = filteredComplaints.filter(
            (complaint) =>
              complaint.kifleketema === user.kifleketema && Number(complaint.wereda) === Number(user.wereda),
          )
          console.log("Filtered complaints for wereda admin:", filteredComplaints.length)
        }

        setComplaints(filteredComplaints)

        // Calculate stats from the complaints
        const complaintStats = {
          total: filteredComplaints.length,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          escalated: 0,
        }

        if (filteredComplaints.length > 0) {
          filteredComplaints.forEach((complaint) => {
            // Determine the effective status for this user's perspective
            const effectiveStatus = getEffectiveStatus(complaint, user.role)

            switch (effectiveStatus) {
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

    fetchComplaints()
  }, [user, userDataReady, filter])

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

  // Helper function to determine effective status from user's perspective
  const getEffectiveStatus = (complaint, userRole) => {
    // If complaint is resolved, it's resolved for everyone
    if (complaint.status === "resolved") {
      return "resolved"
    }

    // Check if complaint has been escalated away from this user's role
    if (userRole === USER_ROLES.STAKEHOLDER_OFFICE) {
      // For stakeholder offices, if current handler is not stakeholder, it's escalated
      if (complaint.currentHandler !== "stakeholder_office") {
        return "escalated"
      }
    } else if (userRole === USER_ROLES.WEREDA_ANTI_CORRUPTION) {
      // For wereda officers, if current handler is kifleketema or kentiba, it's escalated
      if (complaint.currentHandler === "kifleketema_anti_corruption" || complaint.currentHandler === "kentiba_biro") {
        return "escalated"
      }
    } else if (userRole === USER_ROLES.KIFLEKETEMA_ANTI_CORRUPTION) {
      // For kifleketema officers, if current handler is kentiba, it's escalated
      if (complaint.currentHandler === "kentiba_biro") {
        return "escalated"
      }
    }

    // Otherwise, return the actual status
    return complaint.status
  }

  // Show loading state while auth is loading or user data is not ready
  if (authLoading || !userDataReady) {
    return (
      <div className="admin-dashboard">
        <p className="loading-text">Loading user data...</p>
      </div>
    )
  }

  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">{getRoleName(user.role)} Dashboard</h2>

      {user.role === USER_ROLES.WEREDA_ANTI_CORRUPTION && (
        <div className="admin-location-info">
          <p>
            <strong>Your assigned location:</strong>{" "}
            {user.kifleketema
              ? user.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
              : "Not assigned"}
            {user.wereda ? ` - Wereda ${user.wereda}` : ""}
          </p>
          <p className="location-note">You will only see complaints from your assigned location.</p>
        </div>
      )}

      {user.role === USER_ROLES.KIFLEKETEMA_ANTI_CORRUPTION && (
        <div className="admin-location-info">
          <p>
            <strong>Your assigned location:</strong>{" "}
            {user.kifleketema
              ? user.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
              : "Not assigned"}
          </p>
          <p className="location-note">You will only see complaints from your assigned location.</p>
        </div>
      )}

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
            <ComplaintCard key={complaint._id} complaint={complaint} userRole={user.role} />
          ))}
        </div>
      )}

      <style jsx>{`
      .admin-location-info {
        background-color: #f8f9fa;
        border-radius: 5px;
        padding: 10px 15px;
        margin-bottom: 20px;
        border-left: 4px solid #4e73df;
      }
      
      .location-note {
        font-size: 0.9em;
        color: #6c757d;
        margin-top: 5px;
      }
    `}</style>
    </div>
  )
}

export default AdminDashboard
