import { Link } from "react-router-dom"
import "./ComplaintCard.css"

const ComplaintCard = ({ complaint, userRole }) => {
  // Helper function to determine effective status from user's perspective
  const getEffectiveStatus = (complaint, userRole) => {
    // If complaint is resolved, it's resolved for everyone
    if (complaint.status === "resolved") {
      return "resolved"
    }

    // Check if complaint has been escalated away from this user's role
    if (userRole === "stakeholder_office") {
      // For stakeholder offices, if current handler is not stakeholder, it's escalated
      if (complaint.currentHandler !== "stakeholder_office") {
        return "escalated"
      }
    } else if (userRole === "wereda_anti_corruption") {
      // For wereda officers, if current handler is kifleketema or kentiba, it's escalated
      if (complaint.currentHandler === "kifleketema_anti_corruption" || complaint.currentHandler === "kentiba_biro") {
        return "escalated"
      }
    } else if (userRole === "kifleketema_anti_corruption") {
      // For kifleketema officers, if current handler is kentiba, it's escalated
      if (complaint.currentHandler === "kentiba_biro") {
        return "escalated"
      }
    }

    // Otherwise, return the actual status
    return complaint.status
  }

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

  const effectiveStatus = getEffectiveStatus(complaint, userRole)

  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <h3 className="complaint-title">{complaint.title || "Untitled Complaint"}</h3>
        <span className={getStatusBadgeClass(effectiveStatus)}>{getStatusText(effectiveStatus)}</span>
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
