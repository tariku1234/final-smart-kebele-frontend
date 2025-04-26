"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { API_URL, DISPLAY_NAMES, USER_ROLES } from "../config"
import "./AdminOffices.css"

const AdminOffices = () => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [officeTypes, setOfficeTypes] = useState([])
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form state for creating/editing offices
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    hours: "",
    contact: "",
    status: "open",
    officeType: "",
    morningStatus: "open",
    afternoonStatus: "open",
  })

  // Check if user is authorized
  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== USER_ROLES.WEREDA_ANTI_CORRUPTION) {
      setError("You are not authorized to access this page")
      setLoading(false)
      return
    }

    if (!user.kifleketema || !user.wereda) {
      setError("Your administrator location is not set. Please contact system administrator.")
      setLoading(false)
      return
    }

    // Fetch office types and offices
    fetchOfficeTypes()
    fetchOffices()
  }, [user, authLoading])

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token")
  }

  // Fetch office types
  const fetchOfficeTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/offices/types`)
      const data = await response.json()
      setOfficeTypes(data.officeTypes || [])
    } catch (err) {
      console.error("Error fetching office types:", err)
      setError("Failed to fetch office types")
    }
  }

  // Fetch offices for the admin's wereda
  const fetchOffices = async () => {
    try {
      setLoading(true)
      const url = `${API_URL}/api/offices?kifleketema=${user.kifleketema}&wereda=${user.wereda}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setOffices(data.offices)
      } else {
        setError(data.message || "Failed to fetch office information")
      }
    } catch (err) {
      console.error("Error fetching offices:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle form submission for creating/editing offices
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const token = getToken()
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const method = isCreating ? "POST" : "PUT"
      const url = isCreating ? `${API_URL}/api/offices` : `${API_URL}/api/offices/${selectedOffice._id}`

      const officeData = {
        ...formData,
        kifleketema: user.kifleketema,
        wereda: user.wereda,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(officeData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || `Office ${isCreating ? "created" : "updated"} successfully`)
        fetchOffices()
        resetForm()
      } else {
        setError(data.message || `Failed to ${isCreating ? "create" : "update"} office`)
      }
    } catch (err) {
      console.error(`Error ${isCreating ? "creating" : "updating"} office:`, err)
      setError(`Failed to ${isCreating ? "create" : "update"} office. Please try again.`)
    }
  }

  // Handle updating office availability
  const handleUpdateAvailability = async (officeId, availabilityData) => {
    try {
      setError(null)
      setSuccess(null)

      const token = getToken()
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const response = await fetch(`${API_URL}/api/offices/${officeId}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(availabilityData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "Office availability updated successfully")
        fetchOffices()
      } else {
        setError(data.message || "Failed to update office availability")
      }
    } catch (err) {
      console.error("Error updating office availability:", err)
      setError("Failed to update office availability. Please try again.")
    }
  }

  // Handle deleting an office
  const handleDeleteOffice = async (officeId) => {
    if (!window.confirm("Are you sure you want to delete this office?")) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const token = getToken()
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const response = await fetch(`${API_URL}/api/offices/${officeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Office deleted successfully")
        fetchOffices()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete office")
      }
    } catch (err) {
      console.error("Error deleting office:", err)
      setError("Failed to delete office. Please try again.")
    }
  }

  // Reset form and state
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      hours: "",
      contact: "",
      status: "open",
      officeType: "",
      morningStatus: "open",
      afternoonStatus: "open",
    })
    setSelectedOffice(null)
    setIsEditing(false)
    setIsCreating(false)
  }

  // Start editing an office
  const startEditing = (office) => {
    setSelectedOffice(office)
    setFormData({
      name: office.name,
      description: office.description,
      location: office.location,
      hours: office.hours,
      contact: office.contact,
      status: office.status,
      officeType: office.officeType,
      morningStatus: office.morningStatus || office.status,
      afternoonStatus: office.afternoonStatus || office.status,
    })
    setIsEditing(true)
    setIsCreating(false)
    window.scrollTo(0, 0)
  }

  // Start creating a new office
  const startCreating = () => {
    resetForm()
    setIsCreating(true)
    setIsEditing(false)
    window.scrollTo(0, 0)
  }

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "status-open"
      case "closed":
        return "status-closed"
      case "limited":
        return "status-limited"
      default:
        return ""
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (authLoading) {
    return (
      <div className="admin-offices-container">
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  if (!user || user.role !== USER_ROLES.WEREDA_ANTI_CORRUPTION) {
    return (
      <div className="admin-offices-container">
        <div className="alert alert-danger">You are not authorized to access this page</div>
      </div>
    )
  }

  return (
    <div className="admin-offices-container">
      <h2 className="page-title">Manage Offices</h2>
      <p className="page-description">Manage government offices and their availability status in your wereda.</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Office Form */}
      {(isCreating || isEditing) && (
        <div className="office-form-container">
          <h3 className="form-title">{isCreating ? "Create New Office" : "Edit Office"}</h3>
          <form onSubmit={handleSubmit} className="office-form">
            <div className="form-group">
              <label htmlFor="name">Office Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="officeType">Office Type</label>
              <select
                id="officeType"
                name="officeType"
                value={formData.officeType}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select Office Type</option>
                {officeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hours">Working Hours</label>
                <input
                  type="text"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="e.g., 8:30 AM - 5:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Information</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Phone number, email, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Overall Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited Service</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="morningStatus">Morning Status</label>
                <select
                  id="morningStatus"
                  name="morningStatus"
                  value={formData.morningStatus}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited Service</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="afternoonStatus">Afternoon Status</label>
                <select
                  id="afternoonStatus"
                  name="afternoonStatus"
                  value={formData.afternoonStatus}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited Service</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isCreating ? "Create Office" : "Update Office"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Office Button */}
      {!isCreating && !isEditing && (
        <div className="create-office-container">
          <button className="btn-primary create-office-btn" onClick={startCreating}>
            Create New Office
          </button>
        </div>
      )}

      {/* Offices List */}
      {loading ? (
        <p className="loading-text">Loading offices...</p>
      ) : offices.length === 0 ? (
        <p className="no-offices">No offices found in your wereda. Create one to get started.</p>
      ) : (
        <div className="offices-list">
          <h3 className="list-title">Offices in Your Wereda</h3>
          <div className="offices-table-container">
            <table className="offices-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Morning</th>
                  <th>Afternoon</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => (
                  <tr key={office._id}>
                    <td>{office.name}</td>
                    <td>{DISPLAY_NAMES[office.officeType] || office.officeType}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(office.status)}`}>{office.status}</span>
                    </td>
                    <td>
                      <select
                        value={office.morningStatus || office.status}
                        onChange={(e) =>
                          handleUpdateAvailability(office._id, {
                            morningStatus: e.target.value,
                            afternoonStatus: office.afternoonStatus || office.status,
                          })
                        }
                        className={`status-select ${getStatusClass(office.morningStatus || office.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="limited">Limited</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={office.afternoonStatus || office.status}
                        onChange={(e) =>
                          handleUpdateAvailability(office._id, {
                            morningStatus: office.morningStatus || office.status,
                            afternoonStatus: e.target.value,
                          })
                        }
                        className={`status-select ${getStatusClass(office.afternoonStatus || office.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="limited">Limited</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>{formatDate(office.updatedAt)}</td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => startEditing(office)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteOffice(office._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOffices
