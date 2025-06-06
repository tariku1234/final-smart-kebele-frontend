"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import "./ComplaintDetail.css"
import { API_URL } from "../config"
import {
  isBase64DataUrl,
  extractFileInfoFromBase64,
  downloadBase64File,
  openBase64FileInNewTab,
  canViewInBrowser,
  getFileNameFromAttachment,
  formatFileSize,
} from "../utils/fileDownloadHelper"

const ComplaintDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [escalationSuccess, setEscalationSuccess] = useState(null)
  const [escalationError, setEscalationError] = useState(null)
  const [acceptanceSuccess, setAcceptanceSuccess] = useState(null)
  const [acceptanceError, setAcceptanceError] = useState(null)
  const [fullSizeImage, setFullSizeImage] = useState(null)

  const fetchComplaintDetails = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_URL}/api/complaints/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setComplaint(response.data.complaint)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching complaint details:", err)
      setError("Failed to load complaint details. Please try again.")
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login")
      return
    }

    fetchComplaintDetails()
  }, [user, navigate, fetchComplaintDetails])

  // Update the handleEscalate function to handle errors properly
  const handleEscalate = async () => {
    try {
      setEscalationSuccess(null)
      setEscalationError(null)

      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/api/complaints/${id}/escalate`,
        { reason: "No response received within the expected timeframe" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setComplaint(response.data.complaint)
      setEscalationSuccess(`Complaint escalated successfully to ${getStageLabel(response.data.complaint.currentStage)}`)

      // Refresh complaint details after a short delay
      setTimeout(() => {
        fetchComplaintDetails()
      }, 2000)
    } catch (err) {
      console.error("Error escalating complaint:", err)
      setEscalationError(err.response?.data?.message || "Failed to escalate complaint. Please try again.")
    }
  }

  const handleAcceptResponse = async () => {
    try {
      setAcceptanceSuccess(null)
      setAcceptanceError(null)

      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_URL}/api/complaints/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setComplaint(response.data.complaint)
      setAcceptanceSuccess("Response accepted and complaint resolved successfully")

      // Refresh complaint details after a short delay
      setTimeout(() => {
        fetchComplaintDetails()
      }, 2000)
    } catch (err) {
      console.error("Error accepting response:", err)
      setAcceptanceError(err.response?.data?.message || "Failed to accept response. Please try again.")
    }
  }

  // Helper function to get the correct attachment URL - now handles Base64 and file paths
  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null

    // If it's a Base64 data URL, we'll handle it differently in the UI
    if (isBase64DataUrl(attachment)) {
      return attachment // Return as-is, but we'll handle it specially in the UI
    }

    // If it's already a full URL, return it
    if (attachment.startsWith("http")) {
      return attachment
    }

    // Otherwise, construct the URL (for backward compatibility with old file paths)
    return `${API_URL}/${attachment}`
  }

  // Helper function to determine if an attachment is an image - now handles Base64
  const isImageAttachment = (attachment) => {
    if (!attachment) return false

    // Check if it's a Base64 image data URL
    if (isBase64DataUrl(attachment)) {
      const fileInfo = extractFileInfoFromBase64(attachment)
      return fileInfo && fileInfo.mimeType.startsWith("image/")
    }

    // Check file extension for backward compatibility
    const lowerCaseAttachment = attachment.toLowerCase()
    return (
      lowerCaseAttachment.endsWith(".jpg") ||
      lowerCaseAttachment.endsWith(".jpeg") ||
      lowerCaseAttachment.endsWith(".png") ||
      lowerCaseAttachment.endsWith(".gif")
    )
  }

  // Function to open the image modal
  const openImageModal = (imageUrl) => {
    setFullSizeImage(imageUrl)
  }

  // Function to close the image modal
  const closeImageModal = () => {
    setFullSizeImage(null)
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
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
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

  const getHandlerLabel = (handler) => {
    switch (handler) {
      case "stakeholder_office":
        return "Stakeholder Office"
      case "wereda_anti_corruption":
        return "Wereda Anti-Corruption Office"
      case "kifleketema_anti_corruption":
        return "Kifleketema Anti-Corruption Office"
      case "kentiba_biro":
        return "Kentiba Biro"
      default:
        return handler
    }
  }

  // FIXED: Enhanced second stage submission logic for escalated complaints
  const canSubmitSecondStage = (complaint) => {
    if (!complaint) return false

    // Check if complaint is in first stage
    const isFirstStage = ["stakeholder_first", "wereda_first", "kifleketema_first"].includes(complaint.currentStage)

    if (!isFirstStage) return false

    // Check if complaint is resolved
    if (complaint.status === "resolved") return false

    // Check if there are responses
    if (!complaint.responses || complaint.responses.length === 0) return false

    // FIXED: Check if there's a response from current handler
    const hasResponseFromCurrentHandler = complaint.responses.some(
      (response) => response.responderRole === complaint.currentHandler,
    )

    // FIXED: Allow escalated, in_progress, and pending statuses
    const isValidStatus = ["in_progress", "pending", "escalated"].includes(complaint.status)

    return hasResponseFromCurrentHandler && isValidStatus
  }

  // FIXED: Update the canEscalate function to handle skipped stages properly
  const canEscalate = (complaint) => {
    if (!complaint) return false

    const now = new Date()

    // Check if the complaint is already resolved
    if (complaint.status === "resolved") {
      return false
    }

    // FIXED: Enhanced escalation logic to handle skipped stages
    switch (complaint.currentStage) {
      case "stakeholder_first":
        // Can only escalate to next level if due date has passed
        return now > new Date(complaint.stakeholderFirstResponseDue) && complaint.status !== "in_progress"

      case "stakeholder_second":
        // Can escalate to Wereda if there's a response or due date has passed
        return (
          now > new Date(complaint.stakeholderSecondResponseDue) ||
          (complaint.responses.length > 1 && (complaint.status === "in_progress" || complaint.status === "escalated"))
        )

      case "wereda_first":
        // Can only escalate to next level if due date has passed
        return now > new Date(complaint.weredaFirstResponseDue) && complaint.status !== "in_progress"

      case "wereda_second":
        // Can escalate to Kifleketema if there's a response or due date has passed
        return (
          now > new Date(complaint.weredaSecondResponseDue) ||
          (complaint.responses.length > 3 && (complaint.status === "in_progress" || complaint.status === "escalated"))
        )

      case "kifleketema_first":
        // Can only escalate to next level if due date has passed
        return now > new Date(complaint.kifleketemaFirstResponseDue) && complaint.status !== "in_progress"

      case "kifleketema_second":
        // FIXED: Enhanced logic for kifleketema second stage escalation
        // Check if there's a response from kifleketema AND (due date passed OR citizen is unsatisfied)
        const hasKifleketemaResponse = complaint.responses.some(
          (response) => response.responderRole === "kifleketema_anti_corruption",
        )

        // If there's a response, allow escalation regardless of due date
        if (hasKifleketemaResponse && complaint.status === "in_progress") {
          return true
        }

        // If no response and due date passed, allow escalation
        if (complaint.kifleketemaSecondResponseDue && now > new Date(complaint.kifleketemaSecondResponseDue)) {
          return true
        }

        // FIXED: Special case for complaints that skipped wereda and went directly to kifleketema
        // Check if this complaint was escalated directly from stakeholder to kifleketema
        const wasEscalatedFromStakeholder = complaint.escalationHistory?.some(
          (esc) => esc.from === "stakeholder_office" && esc.to === "kifleketema_anti_corruption",
        )

        if (wasEscalatedFromStakeholder && hasKifleketemaResponse) {
          console.log(
            "Complaint was escalated directly from stakeholder to kifleketema and has response - allowing escalation to kentiba",
          )
          return true
        }

        return false

      case "kentiba":
        return false // Cannot escalate beyond Kentiba

      default:
        return false
    }
  }

  // Update the getNextStage function to only return the immediate next stage
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
    if (!complaint) return null

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
    if (!complaint) return false

    const dueDate = getDueDate(complaint)
    if (!dueDate) return false

    return new Date() > new Date(dueDate)
  }

  const canAcceptResponse = (complaint) => {
    if (!complaint) return false
    return complaint.responses && complaint.responses.length > 0 && complaint.status !== "resolved"
  }

  const hasResponseForCurrentStage = (complaint) => {
    if (!complaint || !complaint.responses || complaint.responses.length === 0) return false

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

  // Group responses by stage
  const getResponsesByStage = (complaint) => {
    if (!complaint || !complaint.responses) return {}

    const responsesByStage = {
      stakeholder_first: [],
      stakeholder_second: [],
      wereda_first: [],
      wereda_second: [],
      kifleketema_first: [],
      kifleketema_second: [],
      kentiba: [],
    }

    // Sort responses by date
    const sortedResponses = [...complaint.responses].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    // Assign responses to stages based on their stage field if available, or responderRole and order
    sortedResponses.forEach((response, index) => {
      if (response.stage) {
        // If the response has a stage field, use it
        responsesByStage[response.stage].push(response)
      } else {
        // Fallback to the old logic
        if (response.responderRole === "stakeholder_office") {
          if (index === 0) {
            responsesByStage.stakeholder_first.push(response)
          } else {
            responsesByStage.stakeholder_second.push(response)
          }
        } else if (response.responderRole === "wereda_anti_corruption") {
          if (responsesByStage.wereda_first.length === 0) {
            responsesByStage.wereda_first.push(response)
          } else {
            responsesByStage.wereda_second.push(response)
          }
        } else if (response.responderRole === "kifleketema_anti_corruption") {
          if (responsesByStage.kifleketema_first.length === 0) {
            responsesByStage.kifleketema_first.push(response)
          } else {
            responsesByStage.kifleketema_second.push(response)
          }
        } else if (response.responderRole === "kentiba_biro") {
          responsesByStage.kentiba.push(response)
        }
      }
    })

    return responsesByStage
  }

  // Add this near the top of the component
  const now = new Date()

  // Handle file download for Base64 attachments
  const handleFileDownload = (attachment, index) => {
    if (isBase64DataUrl(attachment)) {
      const fileName = getFileNameFromAttachment(attachment, index)
      const success = downloadBase64File(attachment, fileName)
      if (!success) {
        alert("Failed to download file. Please try again.")
      }
    } else {
      // For regular file paths, open in new tab
      window.open(getAttachmentUrl(attachment), "_blank")
    }
  }

  // Handle file viewing for Base64 attachments
  const handleFileView = (attachment, index) => {
    if (isBase64DataUrl(attachment)) {
      const fileInfo = extractFileInfoFromBase64(attachment)
      if (fileInfo && canViewInBrowser(fileInfo.mimeType)) {
        const success = openBase64FileInNewTab(attachment)
        if (!success) {
          // Fallback to download if viewing fails
          handleFileDownload(attachment, index)
        }
      } else {
        // If can't view, download instead
        handleFileDownload(attachment, index)
      }
    } else {
      // For regular file paths, open in new tab
      window.open(getAttachmentUrl(attachment), "_blank")
    }
  }

  // Get file info for display
  const getFileDisplayInfo = (attachment, index) => {
    if (isBase64DataUrl(attachment)) {
      const fileInfo = extractFileInfoFromBase64(attachment)
      if (fileInfo) {
        return {
          name: getFileNameFromAttachment(attachment, index),
          size: formatFileSize(fileInfo.size),
          type: fileInfo.mimeType,
          canView: canViewInBrowser(fileInfo.mimeType),
        }
      }
    }

    // For file paths, extract basic info
    const fileName = getFileNameFromAttachment(attachment, index)
    return {
      name: fileName,
      size: "Unknown size",
      type: "Unknown type",
      canView: true, // Assume file paths can be viewed
    }
  }

  if (loading) {
    return <div className="loading">Loading complaint details...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!complaint) {
    return <div className="error-message">Complaint not found</div>
  }

  const responsesByStage = getResponsesByStage(complaint)

  return (
    <div className="complaint-detail-container">
      {/* Image Modal */}
      {fullSizeImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content">
            <span className="close-modal" onClick={closeImageModal}>
              &times;
            </span>
            <img
              src={fullSizeImage || "/placeholder.svg"}
              alt="Full size attachment"
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="complaint-detail-header">
        <h1>{complaint.title}</h1>
        <span className={getStatusBadgeClass(complaint.status)}>{complaint.status.replace("_", " ")}</span>
      </div>

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

      <div className="complaint-detail-actions">
        <Link to="/citizen-complaints" className="btn btn-secondary">
          Back to Complaints
        </Link>

        <div className="complaint-actions-container">
          {canAcceptResponse(complaint) && (
            <button
              onClick={handleAcceptResponse}
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
              onClick={handleEscalate}
              className="btn btn-escalate"
              title={`Escalate to ${getNextStage(complaint.currentStage)}`}
            >
              Escalate Complaint
            </button>
          )}
        </div>
      </div>

      <div className="complaint-detail-card">
        <div className="complaint-detail-section">
          <h2>Complaint Information</h2>
          <div className="complaint-detail-info">
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">{complaint.status.replace("_", " ")}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Submitted:</span>
              <span className="info-value">{formatDate(complaint.submittedAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Stage:</span>
              <span className="info-value">{getStageLabel(complaint.currentStage)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Handler:</span>
              <span className="info-value">{getHandlerLabel(complaint.currentHandler)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{complaint.location}</span>
            </div>
            {complaint.stakeholderOffice && (
              <div className="info-row">
                <span className="info-label">Stakeholder Office:</span>
                <span className="info-value">{complaint.stakeholderOffice.officeName}</span>
              </div>
            )}
            {getDueDate(complaint) && (
              <div className="info-row">
                <span className="info-label">Response Due:</span>
                <span className={`info-value ${isOverdue(complaint) ? "overdue" : ""}`}>
                  {formatDate(getDueDate(complaint))}
                  {isOverdue(complaint) && <span className="overdue-label"> (Overdue)</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="complaint-detail-section">
          <h2>Description</h2>
          <p className="complaint-detail-description">{complaint.description}</p>
        </div>

        {complaint.additionalDetails && (
          <div className="complaint-detail-section">
            <h2>Additional Details (Second Stage)</h2>
            <p className="complaint-detail-description additional-details">{complaint.additionalDetails}</p>
            <div className="second-stage-indicator">
              <span className="stage-badge">Second Stage Submission</span>
            </div>
          </div>
        )}

        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="complaint-detail-section">
            <h2>Attachments</h2>
            <div className="attachments-container">
              {complaint.attachments.map((attachment, index) => {
                const fileInfo = getFileDisplayInfo(attachment, index)

                return (
                  <div key={index} className="attachment-item">
                    {isImageAttachment(attachment) ? (
                      <div className="attachment-image-container">
                        <img
                          src={getAttachmentUrl(attachment) || "/placeholder.svg"}
                          alt={`Attachment ${index + 1}`}
                          className="attachment-image"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg?height=200&width=300"
                            e.target.alt = "Image failed to load"
                          }}
                        />
                        <button
                          type="button"
                          className="view-full-size-btn"
                          onClick={() => openImageModal(getAttachmentUrl(attachment))}
                        >
                          View Full Size
                        </button>
                      </div>
                    ) : (
                      <div className="attachment-file-container">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <div className="file-name">{fileInfo.name}</div>
                          <div className="file-meta">
                            <span className="file-size">{fileInfo.size}</span>
                            {fileInfo.type !== "Unknown type" && <span className="file-type">{fileInfo.type}</span>}
                          </div>
                        </div>
                        <div className="file-actions">
                          {fileInfo.canView && (
                            <button
                              type="button"
                              className="btn btn-view"
                              onClick={() => handleFileView(attachment, index)}
                              title="View file"
                            >
                              View
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-download"
                            onClick={() => handleFileDownload(attachment, index)}
                            title="Download file"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="complaint-detail-section">
          <h2>Responses by Stage</h2>

          {/* First Stage Response */}
          <div className="stage-response-section">
            <h3 className="stage-title">Stakeholder (First Stage)</h3>
            {responsesByStage.stakeholder_first && responsesByStage.stakeholder_first.length > 0 ? (
              <div className="response-card">
                <div className="response-header">
                  <div className="response-info">
                    <span className="response-from">
                      From:{" "}
                      {responsesByStage.stakeholder_first[0].responder
                        ? `${responsesByStage.stakeholder_first[0].responder.firstName} ${responsesByStage.stakeholder_first[0].responder.lastName}`
                        : getHandlerLabel(responsesByStage.stakeholder_first[0].responderRole)}
                    </span>
                    <span className="response-date">{formatDate(responsesByStage.stakeholder_first[0].createdAt)}</span>
                  </div>
                  <span className={getStatusBadgeClass(responsesByStage.stakeholder_first[0].status)}>
                    {responsesByStage.stakeholder_first[0].status.replace("_", " ")}
                  </span>
                </div>
                <div className="response-body">
                  <p>{responsesByStage.stakeholder_first[0].response}</p>
                </div>
                {/* Update the response actions for stakeholder_first stage */}
                {complaint.currentStage === "stakeholder_first" && hasResponseForCurrentStage(complaint) && (
                  <div className="response-actions">
                    <button onClick={handleAcceptResponse} className="btn btn-resolve">
                      Resolve Complaint
                    </button>
                    <Link
                      to={`/complaint?stage=second&complaintId=${complaint._id}`}
                      className="btn btn-primary"
                      title="Submit a second stage complaint"
                    >
                      Submit Second Stage
                    </Link>
                    {/* Only show escalate button if due date has passed and no response */}
                    {now > new Date(complaint.stakeholderFirstResponseDue) && complaint.status !== "in_progress" && (
                      <button onClick={handleEscalate} className="btn btn-escalate">
                        Escalate to Next Level
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="no-response">No response received yet.</p>
            )}
          </div>

          {/* Second Stage Response */}
          {(complaint.currentStage === "stakeholder_second" ||
            complaint.currentStage === "wereda_first" ||
            complaint.currentStage === "wereda_second" ||
            complaint.currentStage === "kifleketema_first" ||
            complaint.currentStage === "kifleketema_second" ||
            complaint.currentStage === "kentiba" ||
            responsesByStage.stakeholder_second.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Stakeholder (Second Stage)</h3>
              {responsesByStage.stakeholder_second && responsesByStage.stakeholder_second.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.stakeholder_second[0].responder
                          ? `${responsesByStage.stakeholder_second[0].responder.firstName} ${responsesByStage.stakeholder_second[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.stakeholder_second[0].responderRole)}
                      </span>
                      <span className="response-date">
                        {formatDate(responsesByStage.stakeholder_second[0].createdAt)}
                      </span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.stakeholder_second[0].status)}>
                      {responsesByStage.stakeholder_second[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.stakeholder_second[0].response}</p>
                  </div>
                  {complaint.currentStage === "stakeholder_second" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                      <button onClick={handleEscalate} className="btn btn-escalate">
                        Escalate to Wereda
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}

          {/* Additional stages would follow the same pattern */}
          {/* Wereda First Stage */}
          {(complaint.currentStage === "wereda_first" ||
            complaint.currentStage === "wereda_second" ||
            complaint.currentStage === "kifleketema_first" ||
            complaint.currentStage === "kifleketema_second" ||
            complaint.currentStage === "kentiba" ||
            responsesByStage.wereda_first.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Wereda (First Stage)</h3>
              {responsesByStage.wereda_first && responsesByStage.wereda_first.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.wereda_first[0].responder
                          ? `${responsesByStage.wereda_first[0].responder.firstName} ${responsesByStage.wereda_first[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.wereda_first[0].responderRole)}
                      </span>
                      <span className="response-date">{formatDate(responsesByStage.wereda_first[0].createdAt)}</span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.wereda_first[0].status)}>
                      {responsesByStage.wereda_first[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.wereda_first[0].response}</p>
                  </div>
                  {/* Update the response actions for wereda_first stage */}
                  {complaint.currentStage === "wereda_first" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                      {/* Only show escalate button if due date has passed and no response */}
                      {now > new Date(complaint.weredaFirstResponseDue) && complaint.status !== "in_progress" && (
                        <button onClick={handleEscalate} className="btn btn-escalate">
                          Escalate to Next Level
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}
          {/* Wereda Second Stage */}
          {(complaint.currentStage === "wereda_second" ||
            complaint.currentStage === "kifleketema_first" ||
            complaint.currentStage === "kifleketema_second" ||
            complaint.currentStage === "kentiba" ||
            responsesByStage.wereda_second.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Wereda (Second Stage)</h3>
              {responsesByStage.wereda_second && responsesByStage.wereda_second.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.wereda_second[0].responder
                          ? `${responsesByStage.wereda_second[0].responder.firstName} ${responsesByStage.wereda_second[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.wereda_second[0].responderRole)}
                      </span>
                      <span className="response-date">{formatDate(responsesByStage.wereda_second[0].createdAt)}</span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.wereda_second[0].status)}>
                      {responsesByStage.wereda_second[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.wereda_second[0].response}</p>
                  </div>
                  {complaint.currentStage === "wereda_second" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                      <button onClick={handleEscalate} className="btn btn-escalate">
                        Escalate to Kifleketema
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}

          {/* Kifleketema First Stage */}
          {(complaint.currentStage === "kifleketema_first" ||
            complaint.currentStage === "kifleketema_second" ||
            complaint.currentStage === "kentiba" ||
            responsesByStage.kifleketema_first.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Kifleketema (First Stage)</h3>
              {responsesByStage.kifleketema_first && responsesByStage.kifleketema_first.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.kifleketema_first[0].responder
                          ? `${responsesByStage.kifleketema_first[0].responder.firstName} ${responsesByStage.kifleketema_first[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.kifleketema_first[0].responderRole)}
                      </span>
                      <span className="response-date">
                        {formatDate(responsesByStage.kifleketema_first[0].createdAt)}
                      </span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.kifleketema_first[0].status)}>
                      {responsesByStage.kifleketema_first[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.kifleketema_first[0].response}</p>
                  </div>
                  {complaint.currentStage === "kifleketema_first" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                      <Link
                        to={`/complaint?stage=second&complaintId=${complaint._id}`}
                        className="btn btn-primary"
                        title="Submit a second stage complaint"
                      >
                        Submit Second Stage
                      </Link>
                      {now > new Date(complaint.kifleketemaFirstResponseDue) && complaint.status !== "in_progress" && (
                        <button onClick={handleEscalate} className="btn btn-escalate">
                          Escalate to Next Level
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}

          {/* Kifleketema Second Stage */}
          {(complaint.currentStage === "kifleketema_second" ||
            complaint.currentStage === "kentiba" ||
            responsesByStage.kifleketema_second.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Kifleketema (Second Stage)</h3>
              {responsesByStage.kifleketema_second && responsesByStage.kifleketema_second.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.kifleketema_second[0].responder
                          ? `${responsesByStage.kifleketema_second[0].responder.firstName} ${responsesByStage.kifleketema_second[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.kifleketema_second[0].responderRole)}
                      </span>
                      <span className="response-date">
                        {formatDate(responsesByStage.kifleketema_second[0].createdAt)}
                      </span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.kifleketema_second[0].status)}>
                      {responsesByStage.kifleketema_second[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.kifleketema_second[0].response}</p>
                  </div>
                  {complaint.currentStage === "kifleketema_second" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                      <button onClick={handleEscalate} className="btn btn-escalate">
                        Escalate to Kentiba Biro
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}

          {/* Kentiba Stage */}
          {(complaint.currentStage === "kentiba" || responsesByStage.kentiba.length > 0) && (
            <div className="stage-response-section">
              <h3 className="stage-title">Kentiba Biro</h3>
              {responsesByStage.kentiba && responsesByStage.kentiba.length > 0 ? (
                <div className="response-card">
                  <div className="response-header">
                    <div className="response-info">
                      <span className="response-from">
                        From:{" "}
                        {responsesByStage.kentiba[0].responder
                          ? `${responsesByStage.kentiba[0].responder.firstName} ${responsesByStage.kentiba[0].responder.lastName}`
                          : getHandlerLabel(responsesByStage.kentiba[0].responderRole)}
                      </span>
                      <span className="response-date">{formatDate(responsesByStage.kentiba[0].createdAt)}</span>
                    </div>
                    <span className={getStatusBadgeClass(responsesByStage.kentiba[0].status)}>
                      {responsesByStage.kentiba[0].status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="response-body">
                    <p>{responsesByStage.kentiba[0].response}</p>
                  </div>
                  {complaint.currentStage === "kentiba" && hasResponseForCurrentStage(complaint) && (
                    <div className="response-actions">
                      <button onClick={handleAcceptResponse} className="btn btn-resolve">
                        Resolve Complaint
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-response">No response received yet.</p>
              )}
            </div>
          )}
        </div>

        {complaint.escalationHistory && complaint.escalationHistory.length > 0 && (
          <div className="complaint-detail-section">
            <h2>Escalation History</h2>
            <div className="escalation-list">
              {complaint.escalationHistory.map((escalation, index) => (
                <div key={index} className="escalation-card">
                  <div className="escalation-header">
                    <span className="escalation-date">{formatDate(escalation.date)}</span>
                  </div>
                  <div className="escalation-body">
                    <p>
                      <strong>From:</strong> {getHandlerLabel(escalation.from)}
                    </p>
                    <p>
                      <strong>To:</strong> {getHandlerLabel(escalation.to)}
                    </p>
                    <p>
                      <strong>Reason:</strong> {escalation.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {complaint.resolution && complaint.resolution.resolvedAt && (
          <div className="complaint-detail-section resolution-section">
            <h2>Resolution</h2>
            <div className="resolution-card">
              <div className="resolution-header">
                <span className="resolution-by">
                  Resolved by:{" "}
                  {complaint.resolution.resolvedBy
                    ? `${complaint.resolution.resolvedBy.firstName} ${complaint.resolution.resolvedBy.lastName}`
                    : getHandlerLabel(complaint.resolution.resolverRole)}
                </span>
                <span className="resolution-date">{formatDate(complaint.resolution.resolvedAt)}</span>
              </div>
              <div className="resolution-body">
                <p>{complaint.resolution.resolution}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintDetail
