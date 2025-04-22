"use client"

import { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import "./CitizenComplaints.css"
import { API_URL } from "../config"

const CitizenComplaints = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [escalationSuccess, setEscalationSuccess] = useState(null)
  const [escalationError, setEscalationError] = useState(null)
  const [acceptanceSuccess, setAcceptanceSuccess] = useState(null)
  const [acceptanceError, setAcceptanceError] = useState(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login")
      return
    }

    // Redirect if not a citizen
    if (user && user.role !== "citizen") {
      navigate("/")
      return
    }

    fetchComplaints()
  }, [user, navigate])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/api/complaints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setComplaints(response.data.complaints || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching complaints:", err)
      setError("Failed to load complaints. Please try again.")
      setLoading(false)
    }
  }

  const handleEscalate = async (complaintId) => {
    try {
      setEscalationSuccess(null)
      setEscalationError(null)

      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/api/complaints/${complaintId}/escalate`,
        { reason: "No response received within the expected timeframe" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update the complaint in the local state
      setComplaints(
        complaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, ...response.data.complaint } : complaint,
        ),
      )

      setEscalationSuccess(`Complaint escalated successfully to ${getStageLabel(response.data.complaint.currentStage)}`)

      // Refresh complaints after a short delay
      setTimeout(() => {
        fetchComplaints()
      }, 2000)
    } catch (err) {
      console.error("Error escalating complaint:", err)
      setEscalationError(err.response?.data?.message || "Failed to escalate complaint. Please try again.")
    }
  }

  const handleAcceptResponse = async (complaintId) => {
    try {
      setAcceptanceSuccess(null)
      setAcceptanceError(null)

      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/api/complaints/${complaintId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update the complaint in the local state
      setComplaints(
        complaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, ...response.data.complaint } : complaint,
        ),
      )

      setAcceptanceSuccess("Response accepted and complaint resolved successfully")

      // Refresh complaints after a short delay
      setTimeout(() => {
        fetchComplaints()
      }, 2000)
    } catch (err) {
      console.error("Error accepting response:", err)
      setAcceptanceError(err.response?.data?.message || "Failed to accept response. Please try again.")
    }
  }

  const filterComplaints = (status) => {
    setActiveTab(status)
  }

  const getFilteredComplaints = () => {
    if (activeTab === "all") {
      return complaints
    }
    return complaints.filter((complaint) => complaint.status === activeTab)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge badge-pending"
      case "in_progress":
        return "badge badge-in-progress"
      case "resolved":
        return "badge badge-resolved"
      case "escalated":
        return "badge badge-escalated"
      default:
        return "badge badge-pending"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStageLabel = (stage) => {
    switch (stage) {
      case "stakeholder_first":
        return "Stakeholder (First Stage)"
      case "stakeholder_second":
        return "Stakeholder (Second Stage)"
      case "wereda_first":
        return "Wereda (First Stage)"
      case "wereda_second":
        return "Wereda (Second Stage)"
      case "kifleketema_first":
        return "Kifleketema (First Stage)"
      case "kifleketema_second":
        return "Kifleketema (Second Stage)"
      case "kentiba":
        return "Kentiba Biro"
      default:
        return stage
    }
  }

  const canSubmitSecondStage = (complaint) => {
    // Can submit second stage if the complaint is in the first stage (stakeholder or wereda or kifleketema)
    // and has a response from the current handler
    return (
      (complaint.currentStage === "stakeholder_first" ||
        complaint.currentStage === "wereda_first" ||
        complaint.currentStage === "kifleketema_first") &&
      complaint.responses &&
      complaint.responses.length > 0 &&
      complaint.status === "in_progress" // Only allow if there's a response (status is in_progress)
    )
  }

  const canEscalate = (complaint) => {
    const now = new Date()

    // Check if the complaint is already resolved
    if (complaint.status === "resolved") {
      return false
    }

    // Check if the complaint can be escalated based on current stage and due date
    switch (complaint.currentStage) {
      case "stakeholder_first":
        // Can only escalate to next level if due date has passed
        // For stakeholder_first, we don't allow escalation if there's a response (use second stage instead)
        return now > new Date(complaint.stakeholderFirstResponseDue) && complaint.status !== "in_progress"
      case "stakeholder_second":
        // Can escalate to Wereda if there's a response or due date has passed
        return (
          now > new Date(complaint.stakeholderSecondResponseDue) ||
          (complaint.responses.length > 1 && complaint.status === "in_progress")
        )
      case "wereda_first":
        // Can only escalate to next level if due date has passed
        // For wereda_first, we don't allow escalation if there's a response (use second stage instead)
        return now > new Date(complaint.weredaFirstResponseDue) && complaint.status !== "in_progress"
      case "wereda_second":
        // Can escalate to Kifleketema if there's a response or due date has passed
        return (
          now > new Date(complaint.weredaSecondResponseDue) ||
          (complaint.responses.length > 3 && complaint.status === "in_progress")
        )
      case "kifleketema_first":
        // Can only escalate to next level if due date has passed
        return now > new Date(complaint.kifleketemaFirstResponseDue) && complaint.status !== "in_progress"
      case "kifleketema_second":
        // Can escalate to Kentiba if there's a response or due date has passed
        return (
          now > new Date(complaint.kifleketemaSecondResponseDue) ||
          (complaint.responses.length > 5 && complaint.status === "in_progress")
        )
      case "kentiba":
        return false // Cannot escalate beyond Kentiba
      default:
        return false
    }
  }

  const getNextStage = (currentStage) => {
    switch (currentStage) {
      case "stakeholder_first":
        return "Stakeholder (Second Stage)"
      case "stakeholder_second":
        return "Wereda (First Stage)"
      case "wereda_first":
        return "Wereda (Second Stage)"
      case "wereda_second":
        return "Kifleketema (First Stage)"
      case "kifleketema_first":
        return "Kifleketema (Second Stage)"
      case "kifleketema_second":
        return "Kentiba Biro"
      default:
        return "Next Stage"
    }
  }

  const getDueDate = (complaint) => {
    switch (complaint.currentStage) {
      case "stakeholder_first":
        return complaint.stakeholderFirstResponseDue
      case "stakeholder_second":
        return complaint.stakeholderSecondResponseDue
      case "wereda_first":
        return complaint.weredaFirstResponseDue
      case "wereda_second":
        return complaint.weredaSecondResponseDue
      case "kifleketema_first":
        return complaint.kifleketemaFirstResponseDue
      case "kifleketema_second":
        return complaint.kifleketemaSecondResponseDue
      default:
        return null
    }
  }

  const isOverdue = (complaint) => {
    const dueDate = getDueDate(complaint)
    if (!dueDate) return false

    return new Date() > new Date(dueDate)
  }

  const canAcceptResponse = (complaint) => {
    return complaint.responses && complaint.responses.length > 0 && complaint.status !== "resolved"
  }

  const hasResponseForCurrentStage = (complaint) => {
    if (!complaint.responses || complaint.responses.length === 0) return false

    // Check if there's a response for the current stage
    const stageIndex = getStageIndex(complaint.currentStage)
    return complaint.responses.length > stageIndex
  }

  const getStageIndex = (stage) => {
    switch (stage) {
      case "stakeholder_first":
        return 0
      case "stakeholder_second":
        return 1
      case "wereda_first":
        return 2
      case "wereda_second":
        return 3
      case "kifleketema_first":
        return 4
      case "kifleketema_second":
        return 5
      case "kentiba":
        return 6
      default:
        return 0
    }
  }

  return (
    <div className="citizen-complaints-container">
      <h1>My Complaints</h1>

      {escalationSuccess && (
        <div className="alert alert-success">
          <p>{escalationSuccess}</p>
          <button onClick={() => setEscalationSuccess(null)} className="close-btn">
            &times;
          </button>
        </div>
      )}

      {escalationError && (
        <div className="alert alert-error">
          <p>{escalationError}</p>
          <button onClick={() => setEscalationError(null)} className="close-btn">
            &times;
          </button>
        </div>
      )}

      {acceptanceSuccess && (
        <div className="alert alert-success">
          <p>{acceptanceSuccess}</p>
          <button onClick={() => setAcceptanceSuccess(null)} className="close-btn">
            &times;
          </button>
        </div>
      )}

      {acceptanceError && (
        <div className="alert alert-error">
          <p>{acceptanceError}</p>
          <button onClick={() => setAcceptanceError(null)} className="close-btn">
            &times;
          </button>
        </div>
      )}

      <div className="complaint-actions">
        <Link to="/complaint" className="btn btn-primary">
          Submit New Complaint
        </Link>
      </div>

      <div className="complaint-tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => filterComplaints("all")}>
          All
        </button>
        <button className={activeTab === "pending" ? "active" : ""} onClick={() => filterComplaints("pending")}>
          Pending
        </button>
        <button className={activeTab === "in_progress" ? "active" : ""} onClick={() => filterComplaints("in_progress")}>
          In Progress
        </button>
        <button className={activeTab === "resolved" ? "active" : ""} onClick={() => filterComplaints("resolved")}>
          Resolved
        </button>
        <button className={activeTab === "escalated" ? "active" : ""} onClick={() => filterComplaints("escalated")}>
          Escalated
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : getFilteredComplaints().length === 0 ? (
        <div className="no-complaints">
          <p>No complaints found.</p>
        </div>
      ) : (
        <div className="complaints-list">
          {getFilteredComplaints().map((complaint) => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-header">
                <h3 className="complaint-title">{complaint.title}</h3>
                <span className={getStatusBadgeClass(complaint.status)}>{complaint.status.replace("_", " ")}</span>
              </div>

              <div className="complaint-body">
                <p className="complaint-description">
                  {complaint.description.length > 150
                    ? `${complaint.description.substring(0, 150)}...`
                    : complaint.description}
                </p>

                <div className="complaint-meta">
                  <span className="complaint-date">Submitted: {formatDate(complaint.submittedAt)}</span>
                  <span className="complaint-stage">Current Stage: {getStageLabel(complaint.currentStage)}</span>
                </div>

                {getDueDate(complaint) && (
                  <div className={`complaint-due-date ${isOverdue(complaint) ? "overdue" : ""}`}>
                    Response Due: {formatDate(getDueDate(complaint))}
                    {isOverdue(complaint) && <span className="overdue-label"> (Overdue)</span>}
                  </div>
                )}

                {complaint.responses && complaint.responses.length > 0 && (
                  <div className="complaint-response">
                    <p>
                      <strong>Latest Response:</strong>{" "}
                      {complaint.responses[complaint.responses.length - 1].response.length > 100
                        ? `${complaint.responses[complaint.responses.length - 1].response.substring(0, 100)}...`
                        : complaint.responses[complaint.responses.length - 1].response}
                    </p>
                  </div>
                )}

                {hasResponseForCurrentStage(complaint) && complaint.status !== "resolved" && (
                  <div className="response-action-needed">
                    <p>You have a response waiting for your decision!</p>
                  </div>
                )}
              </div>

              <div className="complaint-footer">
                <Link to={`/complaint-detail/${complaint._id}`} className="btn btn-secondary">
                  View Details
                </Link>

                <div className="complaint-actions-container">
                  {canAcceptResponse(complaint) && (
                    <button
                      onClick={() => handleAcceptResponse(complaint._id)}
                      className="btn btn-resolve"
                      title="Accept the response and resolve the complaint"
                    >
                      Resolve Complaint
                    </button>
                  )}

                  {canSubmitSecondStage(complaint) && (
                    <Link
                      to={`/complaint?stage=second&complaintId=${complaint._id}`}
                      className="btn btn-primary"
                      title="Submit a second stage complaint"
                    >
                      Submit Second Stage
                    </Link>
                  )}

                  {canEscalate(complaint) && (
                    <button
                      onClick={() => handleEscalate(complaint._id)}
                      className="btn btn-escalate"
                      title={`Escalate to ${getNextStage(complaint.currentStage)}`}
                    >
                      Escalate Complaint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CitizenComplaints
