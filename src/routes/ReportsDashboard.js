"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL, USER_ROLES } from "../config"
import "./ReportsDashboard.css"
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
  AreaChart,
  Area,
} from "recharts"

const ReportsDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const navigate = useNavigate()

  // Update the activeTab state to include new tabs
  const [activeTab, setActiveTab] = useState("complaints")

  // State for filters
  const [period, setPeriod] = useState("monthly")
  const [kifleketema, setKifleketema] = useState("")
  const [wereda, setWereda] = useState("")
  const [officeType, setOfficeType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // State for data
  const [complaintStats, setComplaintStats] = useState(null)
  const [officePerformance, setOfficePerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Kifleketema options
  const kifleketemaOptions = [
    { value: "", label: "All Kifleketemas" },
    { value: "lemi_kura", label: "Lemi Kura" },
    { value: "arada", label: "Arada" },
    { value: "addis_ketema", label: "Addis Ketema" },
    { value: "lideta", label: "Lideta" },
    { value: "kirkos", label: "Kirkos" },
    { value: "yeka", label: "Yeka" },
    { value: "bole", label: "Bole" },
    { value: "akaky_kaliti", label: "Akaky Kaliti" },
    { value: "nifas_silk_lafto", label: "Nifas Silk Lafto" },
    { value: "kolfe_keranio", label: "Kolfe Keranio" },
    { value: "gulele", label: "Gulele" },
  ]

  // Office type options
  const officeTypeOptions = [
    { value: "", label: "All Office Types" },
    { value: "health_office", label: "Health Office" },
    { value: "education_office", label: "Education Office" },
    { value: "trade_office", label: "Trade Office" },
    { value: "transport_office", label: "Transport Office" },
    { value: "construction_office", label: "Construction Office" },
    { value: "water_office", label: "Water Office" },
    { value: "electricity_office", label: "Electricity Office" },
    { value: "telecommunication_office", label: "Telecommunication Office" },
    { value: "land_management_office", label: "Land Management Office" },
    { value: "tax_office", label: "Tax Office" },
  ]

  // Fetch complaint statistics
  const fetchComplaintStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      let url = `${API_URL}/api/reports/complaints?period=${period}`

      if (kifleketema) {
        url += `&kifleketema=${kifleketema}`
      }

      if (wereda) {
        url += `&wereda=${wereda}`
      }

      if (officeType) {
        url += `&officeType=${officeType}`
      }

      // Add custom date range if both dates are provided
      if (period === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
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
      setComplaintStats(data)
    } catch (err) {
      console.error("Error fetching complaint statistics:", err)
      setError(`Failed to load statistics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [period, kifleketema, wereda, officeType, startDate, endDate])

  // Fetch office performance data
  const fetchOfficePerformance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      let url = `${API_URL}/api/reports/performance`

      if (kifleketema) {
        url += `?kifleketema=${kifleketema}`
      }

      if (wereda) {
        url += `${kifleketema ? "&" : "?"}wereda=${wereda}`
      }

      if (officeType) {
        url += `${kifleketema || wereda ? "&" : "?"}officeType=${officeType}`
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
      setOfficePerformance(data)
    } catch (err) {
      console.error("Error fetching office performance:", err)
      setError(`Failed to load performance data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [kifleketema, wereda, officeType])

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

  // Fetch data based on active tab
  useEffect(() => {
    if (!user) return

    if (activeTab === "complaints") {
      fetchComplaintStats()
    } else if (activeTab.includes("performance")) {
      fetchOfficePerformance()
    }
  }, [user, activeTab, fetchComplaintStats, fetchOfficePerformance])

  // Handle filter application
  const handleApplyFilters = () => {
    if (activeTab === "complaints") {
      fetchComplaintStats()
    } else if (activeTab.includes("performance")) {
      fetchOfficePerformance()
    }
  }

  // Handle filter reset
  const handleResetFilters = () => {
    setPeriod("monthly")
    setKifleketema("")
    setWereda("")
    setOfficeType("")
    setStartDate("")
    setEndDate("")

    // Fetch data with reset filters
    setTimeout(() => {
      if (activeTab === "complaints") {
        fetchComplaintStats()
      } else if (activeTab.includes("performance")) {
        fetchOfficePerformance()
      }
    }, 0)
  }

  // Generate wereda options based on selected kifleketema
  const generateWeredaOptions = () => {
    const options = [{ value: "", label: "All Weredas" }]

    // Add wereda options 1-13
    for (let i = 1; i <= 13; i++) {
      options.push({ value: i.toString(), label: `Wereda ${i}` })
    }

    return options
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Calculate percentage for display
  const calculatePercentage = (value, total) => {
    if (!total) return 0
    return ((value / total) * 100).toFixed(1)
  }

  // Prepare data for charts
  const prepareStatusChartData = () => {
    if (!complaintStats) return []

    return [
      { name: "Pending", value: complaintStats.statusBreakdown.pending, color: "#f6c23e" },
      { name: "In Progress", value: complaintStats.statusBreakdown.inProgress, color: "#36b9cc" },
      { name: "Resolved", value: complaintStats.statusBreakdown.resolved, color: "#1cc88a" },
      { name: "Escalated", value: complaintStats.statusBreakdown.escalated, color: "#e74a3b" },
    ].filter((item) => item.value > 0)
  }

  const prepareLocationChartData = () => {
    if (!complaintStats || !complaintStats.kifleketemaBreakdown) return []

    return Object.entries(complaintStats.kifleketemaBreakdown).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const prepareTimelineChartData = () => {
    if (!complaintStats || !complaintStats.timelineData) return []
    return complaintStats.timelineData
  }

  // Get period display name
  const getPeriodDisplayName = () => {
    switch (period) {
      case "daily":
        return "Today"
      case "weekly":
        return "Last 7 Days"
      case "monthly":
        return "Last 30 Days"
      case "quarterly":
        return "Last 3 Months"
      case "yearly":
        return "Last Year"
      case "custom":
        return startDate && endDate ? `${formatDate(startDate)} to ${formatDate(endDate)}` : "Custom Period"
      default:
        return "All Time"
    }
  }

  // Get role name for display
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

  // Render loading state
  if (authLoading) {
    return (
      <div className="reports-dashboard">
        <p className="loading-text">Loading user data...</p>
      </div>
    )
  }

  // Redirect if not authorized
  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  return (
    <div className="reports-dashboard">
      <h2 className="dashboard-title">Comprehensive Reports Dashboard</h2>
      <p className="dashboard-subtitle">
        {getRoleName(user.role)} View
        {user.kifleketema && ` - ${user.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
        {user.wereda && ` - Wereda ${user.wereda}`}
      </p>

      {/* Tab Navigation */}
      <div className="tab-container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === "complaints" ? "active" : ""}`}
            onClick={() => setActiveTab("complaints")}
          >
            Complaint Statistics
          </div>
          <div
            className={`tab ${activeTab === "office-performance" ? "active" : ""}`}
            onClick={() => setActiveTab("office-performance")}
          >
            Office Performance
          </div>
          <div
            className={`tab ${activeTab === "wereda-performance" ? "active" : ""}`}
            onClick={() => setActiveTab("wereda-performance")}
          >
            Wereda Performance
          </div>
          <div
            className={`tab ${activeTab === "kifleketema-performance" ? "active" : ""}`}
            onClick={() => setActiveTab("kifleketema-performance")}
          >
            Kifleketema Performance
          </div>
          <div
            className={`tab ${activeTab === "kentiba-performance" ? "active" : ""}`}
            onClick={() => setActiveTab("kentiba-performance")}
          >
            Kentiba Performance
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-container">
        <h3 className="filters-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          </svg>
          Filter Reports
        </h3>

        <div className="filters-grid">
          {activeTab === "complaints" && (
            <div className="filter-group">
              <label htmlFor="period" className="filter-label">
                Time Period:
              </label>
              <select id="period" className="filter-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="quarterly">Last 3 Months</option>
                <option value="yearly">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          )}

          {period === "custom" && activeTab === "complaints" && (
            <div className="filter-group">
              <label className="filter-label">Custom Date Range:</label>
              <div className="filter-date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>
            </div>
          )}

          <div className="filter-group">
            <label htmlFor="kifleketema" className="filter-label">
              Kifleketema:
            </label>
            <select
              id="kifleketema"
              className="filter-select"
              value={kifleketema}
              onChange={(e) => setKifleketema(e.target.value)}
            >
              {kifleketemaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="wereda" className="filter-label">
              Wereda:
            </label>
            <select id="wereda" className="filter-select" value={wereda} onChange={(e) => setWereda(e.target.value)}>
              {generateWeredaOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="officeType" className="filter-label">
              Office Type:
            </label>
            <select
              id="officeType"
              className="filter-select"
              value={officeType}
              onChange={(e) => setOfficeType(e.target.value)}
            >
              {officeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-buttons">
          <button className="filter-button reset-button" onClick={handleResetFilters}>
            Reset Filters
          </button>
          <button className="filter-button apply-button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Complaint Statistics Tab Content */}
      {activeTab === "complaints" && (
        <>
          {loading ? (
            <p className="loading-text">Loading statistics...</p>
          ) : !complaintStats ? (
            <div className="no-data-message">No data available for the selected filters.</div>
          ) : (
            <>
              <h3 style={{ marginBottom: "20px" }}>
                Complaint Statistics for {getPeriodDisplayName()}
                {kifleketema && ` in ${kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
                {wereda && ` Wereda ${wereda}`}
                {officeType && ` - ${officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
              </h3>

              {/* Summary Cards */}
              <div className="stats-summary">
                <div className="stat-card total">
                  <h3>Total Complaints</h3>
                  <p className="stat-value">{complaintStats.totalComplaints}</p>
                  <p className="stat-label">All complaints in the system</p>
                </div>
                <div className="stat-card pending">
                  <h3>Pending</h3>
                  <p className="stat-value">{complaintStats.statusBreakdown.pending}</p>
                  <p className="stat-percentage">
                    {calculatePercentage(complaintStats.statusBreakdown.pending, complaintStats.totalComplaints)}% of
                    total
                  </p>
                  <p className="stat-label">Awaiting initial response</p>
                </div>
                <div className="stat-card in-progress">
                  <h3>In Progress</h3>
                  <p className="stat-value">{complaintStats.statusBreakdown.inProgress}</p>
                  <p className="stat-percentage">
                    {calculatePercentage(complaintStats.statusBreakdown.inProgress, complaintStats.totalComplaints)}% of
                    total
                  </p>
                  <p className="stat-label">Being processed</p>
                </div>
                <div className="stat-card resolved">
                  <h3>Resolved</h3>
                  <p className="stat-value">{complaintStats.statusBreakdown.resolved}</p>
                  <p className="stat-percentage">
                    {calculatePercentage(complaintStats.statusBreakdown.resolved, complaintStats.totalComplaints)}% of
                    total
                  </p>
                  <p className="stat-label">Successfully completed</p>
                </div>
                <div className="stat-card escalated">
                  <h3>Escalated</h3>
                  <p className="stat-value">{complaintStats.statusBreakdown.escalated}</p>
                  <p className="stat-percentage">
                    {calculatePercentage(complaintStats.statusBreakdown.escalated, complaintStats.totalComplaints)}% of
                    total
                  </p>
                  <p className="stat-label">Moved to higher authority</p>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-container">
                {/* Status Distribution Chart */}
                <div className="chart-wrapper">
                  <h3>Complaint Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Complaints"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Location Distribution Chart */}
                <div className="chart-wrapper">
                  <h3>Complaints by Location</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareLocationChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Complaints" fill="#4e73df" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="chart-wrapper" style={{ marginBottom: "30px" }}>
                <h3>Complaint Submission Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareTimelineChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={period === "daily" ? 0 : "preserveEnd"}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Complaints"
                      stroke="#4e73df"
                      fill="#4e73df"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Data Tables */}
              <div className="data-tables-container">
                {/* Kifleketema Breakdown Table */}
                <div className="table-wrapper">
                  <h3>Complaints by Kifleketema</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kifleketema</th>
                        <th>Complaints</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(complaintStats.kifleketemaBreakdown || {}).map(([name, value]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{value}</td>
                          <td>{calculatePercentage(value, complaintStats.totalComplaints)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Office Type Breakdown Table */}
                {complaintStats.officeTypeBreakdown && Object.keys(complaintStats.officeTypeBreakdown).length > 0 && (
                  <div className="table-wrapper">
                    <h3>Complaints by Office Type</h3>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Office Type</th>
                          <th>Complaints</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(complaintStats.officeTypeBreakdown).map(([name, value]) => (
                          <tr key={name}>
                            <td>{name}</td>
                            <td>{value}</td>
                            <td>{calculatePercentage(value, complaintStats.totalComplaints)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Performance Tabs Content */}
      {activeTab.includes("performance") && (
        <>
          {loading ? (
            <p className="loading-text">Loading performance data...</p>
          ) : !officePerformance ? (
            <div className="no-data-message">No performance data available for the selected filters.</div>
          ) : (
            <>
              {/* Office Performance */}
              {activeTab === "office-performance" && (
                <>
                  <h3 style={{ marginBottom: "20px" }}>
                    Stakeholder Office Performance Metrics
                    {kifleketema && ` in ${kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
                    {wereda && ` Wereda ${wereda}`}
                    {officeType && ` - ${officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
                  </h3>

                  {officePerformance.stakeholderOffices && officePerformance.stakeholderOffices.length > 0 ? (
                    officePerformance.stakeholderOffices.map((office, index) => (
                      <div className="performance-card" key={index}>
                        <div className="performance-header">
                          <div className="performance-office">{office.name}</div>
                          <div className="performance-location">
                            {office.type} - {office.kifleketema} Wereda {office.wereda}
                          </div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.totalComplaints}</div>
                          <div className="metric-label">Total Complaints</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.resolvedComplaints}</div>
                          <div className="metric-label">Resolved</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.escalatedComplaints}</div>
                          <div className="metric-label">Escalated</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(office.responseRate) > 70 ? "good-metric" : Number.parseFloat(office.responseRate) > 40 ? "warning-metric" : "bad-metric"}`}
                          >
                            {office.responseRate}%
                          </div>
                          <div className="metric-label">Response Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(office.escalationRate) < 20 ? "good-metric" : Number.parseFloat(office.escalationRate) < 50 ? "warning-metric" : "bad-metric"}`}
                          >
                            {office.escalationRate}%
                          </div>
                          <div className="metric-label">Escalation Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.averageResponseTime} days</div>
                          <div className="metric-label">Avg. Response Time</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.pendingComplaints}</div>
                          <div className="metric-label">Pending</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{office.inProgressComplaints}</div>
                          <div className="metric-label">In Progress</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No stakeholder office performance data available.</div>
                  )}
                </>
              )}

              {/* Wereda Performance */}
              {activeTab === "wereda-performance" && (
                <>
                  <h3 style={{ marginBottom: "20px" }}>
                    Wereda Administrator Performance Metrics
                    {kifleketema && ` in ${kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
                    {wereda && ` Wereda ${wereda}`}
                  </h3>

                  {officePerformance.weredaAdministrators && officePerformance.weredaAdministrators.length > 0 ? (
                    officePerformance.weredaAdministrators.map((admin, index) => (
                      <div className="performance-card wereda-admin" key={index}>
                        <div className="performance-header">
                          <div className="performance-office">{admin.name}</div>
                          <div className="performance-location">
                            Wereda Anti-Corruption - {admin.kifleketema} Wereda {admin.wereda}
                          </div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.totalComplaints}</div>
                          <div className="metric-label">Handled Complaints</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.resolvedComplaints}</div>
                          <div className="metric-label">Resolved</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.escalatedComplaints}</div>
                          <div className="metric-label">Escalated Further</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(admin.responseRate) > 70 ? "good-metric" : Number.parseFloat(admin.responseRate) > 40 ? "warning-metric" : "bad-metric"}`}
                          >
                            {admin.responseRate}%
                          </div>
                          <div className="metric-label">Response Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(admin.escalationRate) < 30 ? "good-metric" : Number.parseFloat(admin.escalationRate) < 60 ? "warning-metric" : "bad-metric"}`}
                          >
                            {admin.escalationRate}%
                          </div>
                          <div className="metric-label">Escalation Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.averageResponseTime} days</div>
                          <div className="metric-label">Avg. Response Time</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.pendingComplaints}</div>
                          <div className="metric-label">Pending</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.inProgressComplaints}</div>
                          <div className="metric-label">In Progress</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No wereda administrator performance data available.</div>
                  )}
                </>
              )}

              {/* Kifleketema Performance */}
              {activeTab === "kifleketema-performance" && (
                <>
                  <h3 style={{ marginBottom: "20px" }}>
                    Kifleketema Administrator Performance Metrics
                    {kifleketema && ` in ${kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`}
                  </h3>

                  {officePerformance.kifleketemaAdministrators &&
                  officePerformance.kifleketemaAdministrators.length > 0 ? (
                    officePerformance.kifleketemaAdministrators.map((admin, index) => (
                      <div className="performance-card kifleketema-admin" key={index}>
                        <div className="performance-header">
                          <div className="performance-office">{admin.name}</div>
                          <div className="performance-location">Kifleketema Anti-Corruption - {admin.kifleketema}</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.totalComplaints}</div>
                          <div className="metric-label">Handled Complaints</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.resolvedComplaints}</div>
                          <div className="metric-label">Resolved</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.escalatedComplaints}</div>
                          <div className="metric-label">Escalated to Kentiba</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(admin.responseRate) > 70 ? "good-metric" : Number.parseFloat(admin.responseRate) > 40 ? "warning-metric" : "bad-metric"}`}
                          >
                            {admin.responseRate}%
                          </div>
                          <div className="metric-label">Response Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(admin.escalationRate) < 20 ? "good-metric" : Number.parseFloat(admin.escalationRate) < 40 ? "warning-metric" : "bad-metric"}`}
                          >
                            {admin.escalationRate}%
                          </div>
                          <div className="metric-label">Escalation Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.averageResponseTime} days</div>
                          <div className="metric-label">Avg. Response Time</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.pendingComplaints}</div>
                          <div className="metric-label">Pending</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.inProgressComplaints}</div>
                          <div className="metric-label">In Progress</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No kifleketema administrator performance data available.</div>
                  )}
                </>
              )}

              {/* Kentiba Performance */}
              {activeTab === "kentiba-performance" && (
                <>
                  <h3 style={{ marginBottom: "20px" }}>Kentiba Biro Performance Metrics - Final Authority</h3>

                  {officePerformance.kentibaBiro && officePerformance.kentibaBiro.length > 0 ? (
                    officePerformance.kentibaBiro.map((admin, index) => (
                      <div className="performance-card kentiba-admin" key={index}>
                        <div className="performance-header">
                          <div className="performance-office">{admin.name}</div>
                          <div className="performance-location">{admin.role} - Final Authority</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.totalComplaints}</div>
                          <div className="metric-label">Final Stage Complaints</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.resolvedComplaints}</div>
                          <div className="metric-label">Resolved</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">N/A</div>
                          <div className="metric-label">Escalated (Final Level)</div>
                        </div>
                        <div className="performance-metric">
                          <div
                            className={`metric-value ${Number.parseFloat(admin.responseRate) > 70 ? "good-metric" : Number.parseFloat(admin.responseRate) > 40 ? "warning-metric" : "bad-metric"}`}
                          >
                            {admin.responseRate}%
                          </div>
                          <div className="metric-label">Response Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value good-metric">0.0%</div>
                          <div className="metric-label">Escalation Rate</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.averageResponseTime} days</div>
                          <div className="metric-label">Avg. Response Time</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.pendingComplaints || 0}</div>
                          <div className="metric-label">Pending</div>
                        </div>
                        <div className="performance-metric">
                          <div className="metric-value">{admin.inProgressComplaints || 0}</div>
                          <div className="metric-label">In Progress</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No kentiba biro performance data available.</div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      <div className="dashboard-footer">
        <p>
          This dashboard provides comprehensive statistics and performance metrics for the Kentiba Biro complaint
          management system. Use the filters above to narrow down the data by time period, location, and office type.
        </p>
      </div>
    </div>
  )
}

export default ReportsDashboard
