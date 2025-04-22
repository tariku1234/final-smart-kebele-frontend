import "./AlertCard.css"

const AlertCard = ({ alert }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className={`alert-card ${alert.priority}`}>
      <div className="alert-header">
        <h3 className="alert-title">{alert.title}</h3>
        <span className={`alert-priority alert-priority-${alert.priority}`}>{alert.priority}</span>
      </div>
      <div className="alert-body">
        <p className="alert-description">{alert.description}</p>
        <div className="alert-meta">
          <span className="alert-date">Posted: {formatDate(alert.createdAt)}</span>
          <span className="alert-location">Location: {alert.location}</span>
        </div>
      </div>
    </div>
  )
}

export default AlertCard

