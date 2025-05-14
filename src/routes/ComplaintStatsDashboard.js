"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL, USER_ROLES } from "../config"
import "./ComplaintStatsDashboard.css"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const ComplaintStatsDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState("all")

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

  // Fetch complaint statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/complaints/dashboard/stats`

        if (timeframe !== "all") {
          url += `?timeframe=${timeframe}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dashboard stats data:", data) // Debug log to see the stats data
        setStats(data.stats)
      } catch (err) {
        console.error("Error fetching complaint statistics:", err)
        setError(`Failed to load statistics: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, timeframe])

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value)
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

  // Prepare data for charts
  const barChartData = [
    { name: "Total", value: stats.total },
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Resolved", value: stats.resolved },
    { name: "Escalated", value: stats.escalated },
  ]

  const pieChartData = [
    { name: "Pending", value: stats.pending, color: "#FFC107" },
    { name: "In Progress", value: stats.inProgress, color: "#2196F3" },
    { name: "Resolved", value: stats.resolved, color: "#4CAF50" },
    { name: "Escalated", value: stats.escalated, color: "#F44336" },
  ].filter((item) => item.value > 0)

  const COLORS = ["#FFC107", "#2196F3", "#4CAF50", "#F44336"]

  // Calculate percentages for the summary cards
  const calculatePercentage = (value) => {
    if (stats.total === 0) return 0
    return ((value / stats.total) * 100).toFixed(1)
  }

  if (authLoading) {
    return (
      <div className="stats-dashboard">
        <p className="loading-text">Loading user data...</p>
      </div>
    )
  }

  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  return (
    <div className="stats-dashboard">
      <h2 className="dashboard-title">Complaint Statistics Dashboard</h2>
      <p className="dashboard-subtitle">
        {getRoleName(user.role)} View
        {user.kifleketema && ` - ${user.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
        {user.wereda && ` - Wereda ${user.wereda}`}
      </p>

      <div className="timeframe-selector">
        <label htmlFor="timeframe">Timeframe:</label>
        <select id="timeframe" value={timeframe} onChange={handleTimeframeChange} className="timeframe-select">
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
          <option value="year">Last 365 Days</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading statistics...</p>
      ) : (
        <>
          <div className="stats-summary">
            <div className="stat-card total">
              <h3>Total Complaints</h3>
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">All complaints in the system</p>
            </div>
            <div className="stat-card pending">
              <h3>Pending</h3>
              <p className="stat-value">{stats.pending}</p>
              <p className="stat-percentage">{calculatePercentage(stats.pending)}% of total</p>
              <p className="stat-label">Awaiting initial response</p>
            </div>
            <div className="stat-card in-progress">
              <h3>In Progress</h3>
              <p className="stat-value">{stats.inProgress}</p>
              <p className="stat-percentage">{calculatePercentage(stats.inProgress)}% of total</p>
              <p className="stat-label">Being processed</p>
            </div>
            <div className="stat-card resolved">
              <h3>Resolved</h3>
              <p className="stat-value">{stats.resolved}</p>
              <p className="stat-percentage">{calculatePercentage(stats.resolved)}% of total</p>
              <p className="stat-label">Successfully completed</p>
            </div>
            <div className="stat-card escalated">
              <h3>Escalated</h3>
              <p className="stat-value">{stats.escalated}</p>
              <p className="stat-percentage">{calculatePercentage(stats.escalated)}% of total</p>
              <p className="stat-label">Moved to higher authority</p>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper bar-chart-wrapper">
              <h3>Complaint Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Number of Complaints" fill="#3f51b5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper pie-chart-wrapper">
              <h3>Complaint Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Complaints"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-footer">
            <p>
              This dashboard shows the current status of all complaints in the system. Use the timeframe selector to
              view statistics for different time periods.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default ComplaintStatsDashboard
