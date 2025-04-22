"use client"

import { useState, useEffect } from "react"
import { API_URL } from "../config"
import "./DocumentGuidance.css"

const DocumentGuidance = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/documents`)
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
    }

    fetchDocuments()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
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
    <div className="document-guidance-container">
      <h2 className="page-title">Document Guidance</h2>
      <p className="page-description">
        Find information about required documents and procedures for accessing government services.
      </p>

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
          <label htmlFor="category" className="filter-label">
            Filter by Category:
          </label>
          <select id="category" value={selectedCategory} onChange={handleCategoryChange} className="category-select">
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading documents...</p>
      ) : filteredDocuments.length === 0 ? (
        <p className="no-documents">No documents found matching your criteria.</p>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="document-card">
              <div className="document-header">
                <h3 className="document-title">{doc.title}</h3>
                <span className="document-category">{doc.category}</span>
              </div>
              <div className="document-body">
                <p className="document-description">{doc.description}</p>
              </div>
              <div className="document-requirements">
                <h4>Requirements</h4>
                <ul className="requirements-list">
                  {doc.requirements.map((req, index) => (
                    <li key={index} className="requirement-item">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="document-procedure">
                <h4>Procedure</h4>
                <ol className="procedure-list">
                  {doc.procedure.map((step, index) => (
                    <li key={index} className="procedure-item">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              {doc.contactInfo && (
                <div className="document-contact">
                  <h4>Contact Information</h4>
                  <p>{doc.contactInfo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentGuidance

