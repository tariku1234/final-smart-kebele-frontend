"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL, USER_ROLES } from "../config"
import "./AdminResponseForm.css"
import {
  isBase64DataUrl,
  extractFileInfoFromBase64,
  downloadBase64File,
  openBase64FileInNewTab,
  canViewInBrowser,
  getFileNameFromAttachment,
  formatFileSize,
} from "../utils/fileDownloadHelper"

const AdminResponseForm = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [formData, setFormData] = useState({
    response: "",
    internalComment: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [fullSizeImage, setFullSizeImage] = useState(null)

  const { response, internalComment } = formData

  // Helper function to get the correct image URL
  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null

    // If it's already a full URL, return it
    if (attachment.startsWith("http")) {
      return attachment
    }

    // Otherwise, construct the URL
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

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role === USER_ROLES.CITIZEN) {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch complaint details
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_URL}/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()

        setComplaint(data.complaint)
        setFormData({
          response: "",
          internalComment: "",
        })
      } catch (err) {
        console.error("Error fetching complaint:", err)
        setError(`Failed to fetch complaint details: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== USER_ROLES.CITIZEN) {
      fetchComplaint()
    }
  }, [id, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!response) {
      setError("Please provide a response")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      const responseData = {
        response,
        internalComment,
      }

      const apiResponse = await fetch(`${API_URL}/api/complaints/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(responseData),
      })

      if (!apiResponse.ok) {
        throw new Error(`Server responded with status: ${apiResponse.status}`)
      }

      // Successfully submitted response
      setSuccess(true)

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/admin")
      }, 3000)
    } catch (err) {
      console.error("Error submitting response:", err)
      setError(`Failed to submit response: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Function to open the image modal
  const openImageModal = (imageUrl) => {
    setFullSizeImage(imageUrl)
  }

  // Function to close the image modal
  const closeImageModal = () => {
    setFullSizeImage(null)
  }

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

  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  if (loading) {
    return <p className="loading-text">Loading complaint details...</p>
  }

  if (!complaint) {
    return <p className="error-text">Complaint not found or you don't have permission to view it.</p>
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

  return (
    <div className="admin-response-container">
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

      <div className="complaint-details">
        <h2 className="complaint-title">{complaint.title}</h2>

        <div className="complaint-meta">
          <div className="meta-item">
            <span className="meta-label">Status:</span>
            <span className={`badge badge-${complaint.status}`}>{complaint.status.replace("_", " ")}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Current Stage:</span>
            <span>{getStageLabel(complaint.currentStage)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Submitted:</span>
            <span>{formatDate(complaint.submittedAt || complaint.createdAt)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Location:</span>
            <span>{complaint.location}</span>
          </div>
        </div>

        <div className="complaint-content">
          <h3>Complaint Description</h3>
          <p>{complaint.description}</p>
        </div>

        {complaint.additionalDetails && (
          <div className="complaint-content">
            <h3>Additional Details (Second Stage)</h3>
            <p className="additional-details">{complaint.additionalDetails}</p>
            <div className="second-stage-indicator">
              <span className="stage-badge">Second Stage Submission</span>
            </div>
          </div>
        )}

        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="complaint-attachments">
            <h3>Attachments</h3>
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
                          className="attachment-link"
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

        {complaint.responses && complaint.responses.length > 0 && (
          <div className="previous-responses">
            <h3>Previous Responses</h3>
            {complaint.responses.map((resp, index) => (
              <div key={index} className="response-item">
                <div className="response-header">
                  <span className="response-author">
                    {resp.responder ? `${resp.responder.firstName} ${resp.responder.lastName}` : "Unknown"}
                  </span>
                  <span className="response-date">{formatDate(resp.createdAt)}</span>
                </div>
                <p className="response-text">{resp.response}</p>
                {resp.internalComment && (
                  <div className="internal-comment">
                    <h4>Internal Comment</h4>
                    <p>{resp.internalComment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-container response-form">
        <h2 className="form-title">Respond to Complaint</h2>
        <div className="citizen-decision-notice">
          <p>
            Note: Only citizens can decide to resolve or escalate complaints. Your response will automatically set the
            status to "In Progress" and the citizen will be notified to take action.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Your response has been submitted successfully! You will be redirected shortly.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="response" className="form-label">
              Response
            </label>
            <textarea
              id="response"
              name="response"
              value={response}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter your response to the complaint"
              required
              disabled={submitting || success}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="internalComment" className="form-label">
              Internal Comment (Optional)
            </label>
            <textarea
              id="internalComment"
              name="internalComment"
              value={internalComment}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Add an internal comment (not visible to the citizen)"
              disabled={submitting || success}
            ></textarea>
          </div>

          <button type="submit" className="form-button" disabled={submitting || success}>
            {submitting ? "Submitting..." : "Submit Response"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminResponseForm
