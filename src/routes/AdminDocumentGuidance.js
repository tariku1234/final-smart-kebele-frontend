"use client"

import { useState, useEffect, useCallback } from "react"
import { API_URL } from "../config"
import "./AdminDocumentGuidance.css"

const AdminDocumentGuidance = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    requirements: [""],
    procedure: [""],
    eligibilityCriteria: [""],
    contactInfo: "",
    additionalNotes: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents)
      } else {
        setError(data.message || "Failed to fetch documents")
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleArrayInputChange = (e, index, field) => {
    const newArray = [...formData[field]]
    newArray[index] = e.target.value
    setFormData({
      ...formData,
      [field]: newArray,
    })
  }

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    })
  }

  const removeArrayItem = (index, field) => {
    const newArray = [...formData[field]]
    newArray.splice(index, 1)
    setFormData({
      ...formData,
      [field]: newArray,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      requirements: [""],
      procedure: [""],
      eligibilityCriteria: [""],
      contactInfo: "",
      additionalNotes: "",
    })
    setEditMode(false)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      // Filter out empty array items
      const cleanedFormData = {
        ...formData,
        requirements: formData.requirements.filter((item) => item.trim() !== ""),
        procedure: formData.procedure.filter((item) => item.trim() !== ""),
        eligibilityCriteria: formData.eligibilityCriteria.filter((item) => item.trim() !== ""),
      }

      const url = editMode ? `${API_URL}/api/documents/${editId}` : `${API_URL}/api/documents`

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedFormData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(editMode ? "Document updated successfully" : "Document created successfully")
        resetForm()
        fetchDocuments()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(data.message || "Failed to save document")
      }
    } catch (err) {
      console.error("Error saving document:", err)
      setError("Failed to connect to the server")
    }
  }

  const handleEdit = (document) => {
    setFormData({
      title: document.title,
      description: document.description,
      category: document.category,
      requirements: document.requirements.length > 0 ? document.requirements : [""],
      procedure: document.procedure.length > 0 ? document.procedure : [""],
      eligibilityCriteria:
        document.eligibilityCriteria && document.eligibilityCriteria.length > 0 ? document.eligibilityCriteria : [""],
      contactInfo: document.contactInfo || "",
      additionalNotes: document.additionalNotes || "",
    })
    setEditMode(true)
    setEditId(document._id)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Document deleted successfully")
        fetchDocuments()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete document")
      }
    } catch (err) {
      console.error("Error deleting document:", err)
      setError("Failed to connect to the server")
    }
  }

  // Filter documents based on search term and category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ["all", ...new Set(documents.map((doc) => doc.category))]

  return (
    <div className="admin-document-guidance-container">
      <h2 className="page-title">Manage Document Guidance</h2>
      <p className="page-description">Create and manage document guidance records for citizens.</p>

      {/* Form for adding/editing documents */}
      <div className="document-form-container">
        <h3>{editMode ? "Edit Document" : "Add New Document"}</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="e.g., ID Card, Birth Certificate, etc."
            />
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

          <div className="form-group">
            <label>Eligibility Criteria</label>
            {formData.eligibilityCriteria.map((criterion, index) => (
              <div key={`eligibility-${index}`} className="array-input-group">
                <input
                  type="text"
                  value={criterion}
                  onChange={(e) => handleArrayInputChange(e, index, "eligibilityCriteria")}
                  className="form-control"
                  placeholder="e.g., Must be 18 years or older"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, "eligibilityCriteria")}
                  className="btn-remove"
                  disabled={formData.eligibilityCriteria.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("eligibilityCriteria")} className="btn-add">
              Add Criterion
            </button>
          </div>

          <div className="form-group">
            <label>Required Documents</label>
            {formData.requirements.map((requirement, index) => (
              <div key={`requirement-${index}`} className="array-input-group">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayInputChange(e, index, "requirements")}
                  className="form-control"
                  placeholder="e.g., Valid ID card"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, "requirements")}
                  className="btn-remove"
                  disabled={formData.requirements.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("requirements")} className="btn-add">
              Add Requirement
            </button>
          </div>

          <div className="form-group">
            <label>Procedure Steps</label>
            {formData.procedure.map((step, index) => (
              <div key={`procedure-${index}`} className="array-input-group">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleArrayInputChange(e, index, "procedure")}
                  className="form-control"
                  placeholder="e.g., Submit application at the reception desk"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, "procedure")}
                  className="btn-remove"
                  disabled={formData.procedure.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("procedure")} className="btn-add">
              Add Step
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="contactInfo">Contact Information</label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g., Phone: 123-456-7890, Email: example@gov.et"
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              className="form-control"
              rows="2"
              placeholder="Any additional information citizens should know"
            ></textarea>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editMode ? "Update Document" : "Add Document"}
            </button>
            {editMode && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Document list */}
      <div className="documents-list-container">
        <h3>Existing Documents</h3>

        <div className="filter-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <label htmlFor="category-filter" className="filter-label">
              Filter by Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-select"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="no-documents">No documents found matching your criteria.</p>
        ) : (
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td>{doc.title}</td>
                    <td>{doc.category}</td>
                    <td className="description-cell">{doc.description}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(doc)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(doc._id)} className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDocumentGuidance
