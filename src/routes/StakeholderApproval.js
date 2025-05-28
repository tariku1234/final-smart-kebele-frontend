"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./StakeholderApproval.css"

const StakeholderApproval = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stakeholders, setStakeholders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("pending")
  const [rejectionData, setRejectionData] = useState({
    isOpen: false,
    stakeholderId: null,
    reason: "",
  })
  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    stakeholderId: null,
    stakeholderName: "",
  })

  // Redirect if not logged in or not Kentiba Biro
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "kentiba_biro") {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch stakeholders
  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/stakeholders`

        if (filter === "pending") {
          url += "?approved=false"
        } else if (filter === "approved") {
          url += "?approved=true"
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setStakeholders(data.stakeholders)
        } else {
          setError(data.message || "Failed to fetch stakeholders")
        }
      } catch (err) {
        console.error("Error fetching stakeholders:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "kentiba_biro") {
      fetchStakeholders()
    }
  }, [user, filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/stakeholders/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Update the stakeholder in the list
        setStakeholders(
          stakeholders.map((stakeholder) =>
            stakeholder._id === id ? { ...stakeholder, isApproved: true } : stakeholder,
          ),
        )
      } else {
        setError(data.message || "Failed to approve stakeholder")
      }
    } catch (err) {
      console.error("Error approving stakeholder:", err)
      setError("Failed to connect to the server")
    }
  }

  const openRejectionModal = (id) => {
    setRejectionData({
      isOpen: true,
      stakeholderId: id,
      reason: "",
    })
  }

  const closeRejectionModal = () => {
    setRejectionData({
      isOpen: false,
      stakeholderId: null,
      reason: "",
    })
  }

  const handleRejectionReasonChange = (e) => {
    setRejectionData({
      ...rejectionData,
      reason: e.target.value,
    })
  }

  const handleReject = async (e) => {
    e.preventDefault()

    if (!rejectionData.reason) {
      setError("Rejection reason is required")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/stakeholders/${rejectionData.stakeholderId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionData.reason }),
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the stakeholder from the list
        setStakeholders(stakeholders.filter((stakeholder) => stakeholder._id !== rejectionData.stakeholderId))
        closeRejectionModal()
      } else {
        setError(data.message || "Failed to reject stakeholder")
      }
    } catch (err) {
      console.error("Error rejecting stakeholder:", err)
      setError("Failed to connect to the server")
    }
  }

  const openDeleteModal = (id, name) => {
    setDeleteData({
      isOpen: true,
      stakeholderId: id,
      stakeholderName: name,
    })
  }

  const closeDeleteModal = () => {
    setDeleteData({
      isOpen: false,
      stakeholderId: null,
      stakeholderName: "",
    })
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/stakeholders/${deleteData.stakeholderId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the deleted stakeholder from the list
        setStakeholders(stakeholders.filter((stakeholder) => stakeholder._id !== deleteData.stakeholderId))
        closeDeleteModal()
      } else {
        setError(data.message || "Failed to delete stakeholder")
      }
    } catch (err) {
      console.error("Error deleting stakeholder:", err)
      setError("Failed to connect to the server")
    }
  }

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="stakeholder-approval-container">
      <h2 className="page-title">Stakeholder Office Approval</h2>

      <div className="filter-container">
        <label htmlFor="filter" className="filter-label">
          Filter:
        </label>
        <select id="filter" value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Stakeholders</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading stakeholders...</p>
      ) : stakeholders.length === 0 ? (
        <p className="no-stakeholders">No stakeholders found.</p>
      ) : (
        <div className="stakeholders-table-container">
          <table className="stakeholders-table">
            <thead>
              <tr>
                <th>Office Name</th>
                <th>Office Type</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((stakeholder) => (
                <tr key={stakeholder._id}>
                  <td>{stakeholder.officeName}</td>
                  <td>{stakeholder.officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</td>
                  <td>{`${stakeholder.firstName} ${stakeholder.lastName}`}</td>
                  <td>{stakeholder.email}</td>
                  <td>{stakeholder.phone}</td>
                  <td>
                    {stakeholder.kifleketema
                      ? stakeholder.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                      : "N/A"}
                    {stakeholder.wereda ? ` - Wereda ${stakeholder.wereda}` : ""}
                  </td>
                  <td>
                    <span className={`status-badge ${stakeholder.isApproved ? "approved" : "pending"}`}>
                      {stakeholder.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!stakeholder.isApproved && (
                        <>
                          <button onClick={() => handleApprove(stakeholder._id)} className="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button onClick={() => openRejectionModal(stakeholder._id)} className="btn btn-danger btn-sm">
                            Reject
                          </button>
                        </>
                      )}
                      {stakeholder.isApproved && (
                        <button
                          onClick={() => openDeleteModal(stakeholder._id, stakeholder.officeName)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionData.isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">Reject Stakeholder Office</h3>
            <form onSubmit={handleReject}>
              <div className="form-group">
                <label htmlFor="rejectionReason" className="form-label">
                  Reason for Rejection
                </label>
                <textarea
                  id="rejectionReason"
                  name="rejectionReason"
                  value={rejectionData.reason}
                  onChange={handleRejectionReasonChange}
                  className="form-textarea"
                  placeholder="Enter the reason for rejection"
                  required
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeRejectionModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteData.isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">Delete Stakeholder Office</h3>
            <p>
              Are you sure you want to permanently delete <strong>{deleteData.stakeholderName}</strong>?
            </p>
            <p className="warning-text">This action cannot be undone and will affect all related complaints.</p>
            <div className="modal-actions">
              <button type="button" onClick={closeDeleteModal} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StakeholderApproval
