import "./OfficeCard.css"
import { DISPLAY_NAMES } from "../config"

const OfficeCard = ({ office }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "office-status-open"
      case "closed":
        return "office-status-closed"
      case "limited":
        return "office-status-limited"
      default:
        return ""
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="office-card">
      <div className="office-header">
        <h3 className="office-name">{office.name}</h3>
        <span className={`office-status ${getStatusClass(office.status)}`}>{office.status}</span>
      </div>
      <div className="office-body">
        <p className="office-description">{office.description}</p>
        <div className="office-details">
          <div className="office-detail">
            <span className="office-detail-label">Type:</span>
            <span className="office-detail-value">{DISPLAY_NAMES[office.officeType] || office.officeType}</span>
          </div>
          <div className="office-detail">
            <span className="office-detail-label">Location:</span>
            <span className="office-detail-value">{office.location}</span>
          </div>
          <div className="office-detail">
            <span className="office-detail-label">Hours:</span>
            <span className="office-detail-value">{office.hours}</span>
          </div>
          <div className="office-detail">
            <span className="office-detail-label">Contact:</span>
            <span className="office-detail-value">{office.contact}</span>
          </div>

          <div className="office-availability">
            <h4 className="availability-title">Today's Availability</h4>
            <div className="availability-times">
              <div className="availability-time">
                <span className="time-label">Morning:</span>
                <span className={`time-status ${getStatusClass(office.morningStatus || office.status)}`}>
                  {office.morningStatus || office.status}
                </span>
              </div>
              <div className="availability-time">
                <span className="time-label">Afternoon:</span>
                <span className={`time-status ${getStatusClass(office.afternoonStatus || office.status)}`}>
                  {office.afternoonStatus || office.status}
                </span>
              </div>
            </div>
          </div>

          {office.updatedAt && (
            <div className="office-detail last-updated">
              <span className="office-detail-label">Updated:</span>
              <span className="office-detail-value">{formatDate(office.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OfficeCard
