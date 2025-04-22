import { Link } from "react-router-dom"
import "./ComplaintCard.css"

const ComplaintCard = ({ complaint }) => {
  const getStatusBadgeClass = (status) => {
    if (!status) return "badge badge-pending"

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
    if (!dateString) return "N/A"

    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStageLabel = (stage) => {
    if (!stage) return "Unknown Stage"

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

  // Safely get the status text
  const getStatusText = (status) => {
    if (!status) return "Pending"
    return status.replace("_", " ")
  }

  // Safely get description with truncation
  const getDescription = (description) => {
    if (!description) return "No description provided"
    return description.length > 150 ? `${description.substring(0, 150)}...` : description
  }

  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <h3 className="complaint-title">{complaint.title || "Untitled Complaint"}</h3>
        <span className={getStatusBadgeClass(complaint.status)}>{getStatusText(complaint.status)}</span>
      </div>
      <div className="complaint-body">
        <p className="complaint-description">{getDescription(complaint.description)}</p>
        <div className="complaint-meta">
          <span className="complaint-date">Submitted: {formatDate(complaint.submittedAt || complaint.createdAt)}</span>
          <span className="complaint-stage">Stage: {getStageLabel(complaint.currentStage)}</span>
        </div>
        {complaint.responses && complaint.responses.length > 0 && (
          <div className="response-indicator">
            <span className="response-count">{complaint.responses.length} response(s)</span>
            <span className="citizen-action-needed">Waiting for citizen decision</span>
          </div>
        )}
      </div>
      <div className="complaint-footer">
        <Link to={`/admin/response/${complaint._id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ComplaintCard

