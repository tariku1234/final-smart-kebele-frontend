import "./OfficeCard.css"

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
        </div>
      </div>
    </div>
  )
}

export default OfficeCard

