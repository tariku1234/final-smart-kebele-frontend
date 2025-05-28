"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL, WEREDA_COUNT } from "../config"
import "./ComplaintForm.css"

const ComplaintForm = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const locationHook = useLocation()

  // Check if we're in second stage mode
  const isSecondStage = locationHook.search.includes("stage=second")
  const complaintId = new URLSearchParams(locationHook.search).get("complaintId")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    officeType: "", // Changed from stakeholderOfficeId to officeType
    location: "",
    kifleketema: "",
    wereda: "",
    attachments: [],
  })

  const [secondStageData, setSecondStageData] = useState({
    additionalDetails: "",
    attachments: [],
  })

  const [originalComplaint, setOriginalComplaint] = useState(null)
  const [stakeholderOffices, setStakeholderOffices] = useState([])
  const [availableOfficeTypes, setAvailableOfficeTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingOffices, setFetchingOffices] = useState(true)
  const [fetchingOriginalComplaint, setFetchingOriginalComplaint] = useState(isSecondStage)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { title, description, officeType, location, kifleketema, wereda } = formData
  const { additionalDetails } = secondStageData

  // Fetch approved stakeholder offices
  useEffect(() => {
    const fetchStakeholderOffices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stakeholders/approved`)
        const data = await response.json()

        if (response.ok) {
          setStakeholderOffices(data.stakeholders)
        } else {
          setError("Failed to fetch stakeholder offices")
        }
      } catch (err) {
        console.error("Error fetching stakeholder offices:", err)
        setError("Failed to connect to the server")
      } finally {
        setFetchingOffices(false)
      }
    }

    fetchStakeholderOffices()
  }, [])

  // Update available office types based on selected kifleketema and wereda
  useEffect(() => {
    if (stakeholderOffices.length > 0 && kifleketema && wereda) {
      // Filter offices by kifleketema and wereda
      const filteredOffices = stakeholderOffices.filter(
        (office) => office.kifleketema === kifleketema && office.wereda === Number.parseInt(wereda),
      )

      // Extract unique office types
      const officeTypes = [...new Set(filteredOffices.map((office) => office.officeType))]
      setAvailableOfficeTypes(officeTypes)

      // If currently selected office type is not available, reset it
      if (officeType && !officeTypes.includes(officeType)) {
        setFormData((prev) => ({ ...prev, officeType: "" }))
      }
    } else {
      setAvailableOfficeTypes([])
    }
  }, [kifleketema, wereda, stakeholderOffices, officeType])

  // Fetch original complaint if in second stage mode
  useEffect(() => {
    const fetchOriginalComplaint = async () => {
      if (!isSecondStage || !complaintId) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/complaints/${complaintId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          // Check if the complaint has a response and is in the correct stage
          if (
            (data.complaint.currentStage === "stakeholder_first" ||
              data.complaint.currentStage === "wereda_first" ||
              data.complaint.currentStage === "kifleketema_first") &&
            data.complaint.responses &&
            data.complaint.responses.length > 0 &&
            data.complaint.status === "in_progress"
          ) {
            setOriginalComplaint(data.complaint)

            // Get the office type from the stakeholder office
            const officeType = data.complaint.stakeholderOffice.officeType

            // Pre-fill some data from the original complaint
            setFormData((prevData) => ({
              ...prevData,
              title: `Follow-up: ${data.complaint.title}`,
              officeType: officeType,
              location: data.complaint.location,
              kifleketema: data.complaint.kifleketema,
              wereda: data.complaint.wereda.toString(),
            }))
          } else {
            setError(
              "This complaint is not eligible for a second stage submission. It must have a response from the current handler.",
            )
            setTimeout(() => {
              navigate("/citizen-complaints")
            }, 3000)
          }
        } else {
          setError("Failed to fetch original complaint details")
        }
      } catch (err) {
        console.error("Error fetching original complaint:", err)
        setError("Failed to connect to the server")
      } finally {
        setFetchingOriginalComplaint(false)
      }
    }

    fetchOriginalComplaint()
  }, [isSecondStage, complaintId, navigate])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)

    // Reset wereda if kifleketema changes
    if (e.target.name === "kifleketema") {
      setFormData((prev) => ({ ...prev, kifleketema: e.target.value, wereda: "", officeType: "" }))
    }

    // Reset officeType if wereda changes
    if (e.target.name === "wereda") {
      setFormData((prev) => ({ ...prev, wereda: e.target.value, officeType: "" }))
    }
  }

  const handleSecondStageChange = (e) => {
    setSecondStageData({ ...secondStageData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: e.target.files })
  }

  const handleSecondStageFileChange = (e) => {
    setSecondStageData({ ...secondStageData, attachments: e.target.files })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !officeType || !location || !kifleketema || !wereda) {
      setError("Please fill in all required fields")
      return
    }

    // For second stage, also validate additional details
    if (isSecondStage && !additionalDetails) {
      setError("Please provide additional details for the second stage")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      // Create form data for file uploads
      const formDataObj = new FormData()
      formDataObj.append("title", title)
      formDataObj.append("description", description)
      formDataObj.append("officeType", officeType) // Send office type instead of specific office ID
      formDataObj.append("location", location)
      formDataObj.append("kifleketema", kifleketema)
      formDataObj.append("wereda", wereda)

      // If this is a second stage submission, add the original complaint ID
      if (isSecondStage && complaintId) {
        formDataObj.append("originalComplaintId", complaintId)
        formDataObj.append("isSecondStage", "true")
        formDataObj.append("additionalDetails", additionalDetails)
      }

      // Append files if any
      if (formData.attachments.length > 0) {
        for (let i = 0; i < formData.attachments.length; i++) {
          formDataObj.append("attachments", formData.attachments[i])
        }
      }

      // Append second stage files if any
      if (isSecondStage && secondStageData.attachments.length > 0) {
        for (let i = 0; i < secondStageData.attachments.length; i++) {
          formDataObj.append("attachments", secondStageData.attachments[i])
        }
      }

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server responded with status: ${response.status}`)
      }

      await response.json() // eslint-disable-line no-unused-vars

      setSuccess(true)
      // Reset form
      setFormData({
        title: "",
        description: "",
        officeType: "",
        location: "",
        kifleketema: "",
        wereda: "",
        attachments: [],
      })

      setSecondStageData({
        additionalDetails: "",
        attachments: [],
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/citizen-complaints")
      }, 3000)
    } catch (err) {
      console.error("Error submitting complaint:", err)
      setError(err.message || "Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  // Generate wereda options based on selected kifleketema
  const getWeredaOptions = () => {
    if (!kifleketema) return []

    const weredaCount = WEREDA_COUNT[kifleketema] || 0
    return Array.from({ length: weredaCount }, (_, i) => i + 1)
  }

  // Format office type for display
  const formatOfficeType = (type) => {
    if (!type) return ""
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (!user) {
    return null
  }

  const isLoading = fetchingOffices || (isSecondStage && fetchingOriginalComplaint)

  return (
    <div className="complaint-form-container">
      <div className="form-container complaint-form">
        <h2 className="form-title">
          {isSecondStage
            ? `Submit Second Stage Complaint (${
                originalComplaint?.currentStage === "stakeholder_first"
                  ? "Stakeholder"
                  : originalComplaint?.currentStage === "wereda_first"
                    ? "Wereda"
                    : "Kifleketema"
              })`
            : "Report a Complaint"}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Your complaint has been submitted successfully! You will be redirected shortly.
          </div>
        )}

        {isLoading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {isSecondStage && originalComplaint && (
              <div className="original-complaint-summary">
                <h3>Original Complaint Reference</h3>
                <div className="summary-item">
                  <span className="summary-label">Original Complaint:</span>
                  <span className="summary-value">{originalComplaint.title}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Status:</span>
                  <span className="summary-value">{originalComplaint.status.replace("_", " ")}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Submitted:</span>
                  <span className="summary-value">{new Date(originalComplaint.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Office:</span>
                  <span className="summary-value">{originalComplaint.stakeholderOffice.officeName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Location:</span>
                  <span className="summary-value">
                    {originalComplaint.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} - Wereda{" "}
                    {originalComplaint.wereda}
                  </span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Complaint Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter a brief title for your complaint"
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Complaint Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Provide detailed information about your complaint"
                required
                disabled={loading || success}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kifleketema" className="form-label">
                  Kifleketema (Sub-City)
                </label>
                <select
                  id="kifleketema"
                  name="kifleketema"
                  value={kifleketema}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={loading || success || isSecondStage}
                >
                  <option value="">Select Kifleketema</option>
                  <option value="lemi_kura">Lemi Kura</option>
                  <option value="arada">Arada</option>
                  <option value="addis_ketema">Addis Ketema</option>
                  <option value="lideta">Lideta</option>
                  <option value="kirkos">Kirkos</option>
                  <option value="yeka">Yeka</option>
                  <option value="bole">Bole</option>
                  <option value="akaky_kaliti">Akaky Kaliti</option>
                  <option value="nifas_silk_lafto">Nifas Silk-Lafto</option>
                  <option value="kolfe_keranio">Kolfe Keranio</option>
                  <option value="gulele">Gulele</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="wereda" className="form-label">
                  Wereda (District)
                </label>
                <select
                  id="wereda"
                  name="wereda"
                  value={wereda}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={!kifleketema || loading || success || isSecondStage}
                >
                  <option value="">Select Wereda</option>
                  {getWeredaOptions().map((num) => (
                    <option key={num} value={num}>
                      Wereda {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Office Type Selection */}
            <div className="form-group">
              <label htmlFor="officeType" className="form-label">
                Office Type
              </label>
              <select
                id="officeType"
                name="officeType"
                value={officeType}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading || success || isSecondStage || !wereda}
              >
                <option value="">Select Office Type</option>
                {availableOfficeTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatOfficeType(type)}
                  </option>
                ))}
              </select>
              {availableOfficeTypes.length === 0 && kifleketema && wereda && (
                <small className="form-text text-warning">
                  No approved stakeholder offices found in this location. Please select a different location or try
                  again later.
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Specific Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter the specific location related to the complaint (e.g., street address)"
                required
                disabled={loading || success || isSecondStage}
              />
            </div>

            <div className="form-group">
              <label htmlFor="attachments" className="form-label">
                Attachments (Optional)
              </label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                className="form-input"
                multiple
                disabled={loading || success}
              />
              <small className="form-text">
                You can upload images, documents, or other evidence related to your complaint.
              </small>
            </div>

            {isSecondStage && (
              <div className="second-stage-section">
                <h3>Second Stage Information</h3>
                <div className="form-group">
                  <label htmlFor="additionalDetails" className="form-label">
                    Additional Details for Second Stage
                  </label>
                  <textarea
                    id="additionalDetails"
                    name="additionalDetails"
                    value={additionalDetails}
                    onChange={handleSecondStageChange}
                    className="form-textarea"
                    placeholder="Provide additional information for the second stage of your complaint"
                    required
                    disabled={loading || success}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="secondStageAttachments" className="form-label">
                    Additional Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    id="secondStageAttachments"
                    name="secondStageAttachments"
                    onChange={handleSecondStageFileChange}
                    className="form-input"
                    multiple
                    disabled={loading || success}
                  />
                  <small className="form-text">
                    You can upload additional evidence for the second stage of your complaint.
                  </small>
                </div>
              </div>
            )}

            <button type="submit" className="form-button" disabled={loading || success || !officeType}>
              {loading ? "Submitting..." : isSecondStage ? "Submit Second Stage Complaint" : "Submit Complaint"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ComplaintForm
