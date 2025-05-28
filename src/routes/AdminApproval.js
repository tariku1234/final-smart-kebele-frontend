"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./AdminApproval.css"

const AdminApproval = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("pending")
  const [rejectionData, setRejectionData] = useState({
    isOpen: false,
    adminId: null,
    reason: "",
  })
  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    adminId: null,
    adminName: "",
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

  // Fetch administrators based on filter
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/admin/all-admins`

        if (filter === "pending") {
          url = `${API_URL}/api/admin/pending-admins`
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
          setAdmins(data.admins || data.pendingAdmins || [])
        } else {
          setError(data.message || "Failed to fetch administrators")
        }
      } catch (err) {
        console.error("Error fetching administrators:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "kentiba_biro") {
      fetchAdmins()
    }
  }, [user, filter])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/admin/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the approved admin from the list if we're viewing pending
        if (filter === "pending") {
          setAdmins(admins.filter((admin) => admin._id !== id))
        } else {
          // Update the admin in the list
          setAdmins(admins.map((admin) => (admin._id === id ? { ...admin, isApproved: true } : admin)))
        }
      } else {
        setError(data.message || "Failed to approve administrator")
      }
    } catch (err) {
      console.error("Error approving administrator:", err)
      setError("Failed to connect to the server")
    }
  }

  const openRejectionModal = (id) => {
    setRejectionData({
      isOpen: true,
      adminId: id,
      reason: "",
    })
  }

  const closeRejectionModal = () => {
    setRejectionData({
      isOpen: false,
      adminId: null,
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

      const response = await fetch(`${API_URL}/api/admin/${rejectionData.adminId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionData.reason }),
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the rejected admin from the list
        setAdmins(admins.filter((admin) => admin._id !== rejectionData.adminId))
        closeRejectionModal()
      } else {
        setError(data.message || "Failed to reject administrator")
      }
    } catch (err) {
      console.error("Error rejecting administrator:", err)
      setError("Failed to connect to the server")
    }
  }

  const openDeleteModal = (id, name) => {
    setDeleteData({
      isOpen: true,
      adminId: id,
      adminName: name,
    })
  }

  const closeDeleteModal = () => {
    setDeleteData({
      isOpen: false,
      adminId: null,
      adminName: "",
    })
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/admin/${deleteData.adminId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Remove the deleted admin from the list
        setAdmins(admins.filter((admin) => admin._id !== deleteData.adminId))
        closeDeleteModal()
      } else {
        setError(data.message || "Failed to delete administrator")
      }
    } catch (err) {
      console.error("Error deleting administrator:", err)
      setError("Failed to connect to the server")
    }
  }

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="admin-approval-container">
      <h2 className="page-title">Administrator Approval</h2>

      <div className="filter-container">
        <label htmlFor="filter" className="filter-label">
          Filter:
        </label>
        <select id="filter" value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Administrators</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading administrators...</p>
      ) : admins.length === 0 ? (
        <p className="no-admins">
          {filter === "pending" ? "No pending administrator approvals." : "No administrators found."}
        </p>
      ) : (
        <div className="admins-table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{`${admin.firstName} ${admin.lastName}`}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>
                    {admin.role === "wereda_anti_corruption"
                      ? "Wereda Anti-Corruption Officer"
                      : "Kifleketema Anti-Corruption Officer"}
                  </td>
                  <td>
                    {admin.kifleketema
                      ? admin.kifleketema.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                      : "N/A"}
                    {admin.wereda ? ` - Wereda ${admin.wereda}` : ""}
                  </td>
                  <td>
                    <span className={`status-badge ${admin.isApproved ? "approved" : "pending"}`}>
                      {admin.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!admin.isApproved && (
                        <>
                          <button onClick={() => handleApprove(admin._id)} className="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button onClick={() => openRejectionModal(admin._id)} className="btn btn-danger btn-sm">
                            Reject
                          </button>
                        </>
                      )}
                      {admin.isApproved && (
                        <button
                          onClick={() => openDeleteModal(admin._id, `${admin.firstName} ${admin.lastName}`)}
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
            <h3 className="modal-title">Reject Administrator</h3>
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
            <h3 className="modal-title">Delete Administrator</h3>
            <p>
              Are you sure you want to permanently delete <strong>{deleteData.adminName}</strong>?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
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

export default AdminApproval
