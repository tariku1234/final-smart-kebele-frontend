"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./AdminApproval.css"

const AdminApproval = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [pendingAdmins, setPendingAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rejectionData, setRejectionData] = useState({
    isOpen: false,
    adminId: null,
    reason: "",
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

  // Fetch pending administrators
  useEffect(() => {
    const fetchPendingAdmins = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/admin/pending-admins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setPendingAdmins(data.pendingAdmins)
        } else {
          setError(data.message || "Failed to fetch pending administrators")
        }
      } catch (err) {
        console.error("Error fetching pending administrators:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "kentiba_biro") {
      fetchPendingAdmins()
    }
  }, [user])

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
        // Remove the approved admin from the list
        setPendingAdmins(pendingAdmins.filter((admin) => admin._id !== id))
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
        setPendingAdmins(pendingAdmins.filter((admin) => admin._id !== rejectionData.adminId))
        closeRejectionModal()
      } else {
        setError(data.message || "Failed to reject administrator")
      }
    } catch (err) {
      console.error("Error rejecting administrator:", err)
      setError("Failed to connect to the server")
    }
  }

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="admin-approval-container">
      <h2 className="page-title">Administrator Approval</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading pending administrators...</p>
      ) : pendingAdmins.length === 0 ? (
        <p className="no-admins">No pending administrator approvals.</p>
      ) : (
        <div className="admins-table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((admin) => (
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
                    <div className="action-buttons">
                      <button onClick={() => handleApprove(admin._id)} className="btn btn-success btn-sm">
                        Approve
                      </button>
                      <button onClick={() => openRejectionModal(admin._id)} className="btn btn-danger btn-sm">
                        Reject
                      </button>
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
    </div>
  )
}

export default AdminApproval

