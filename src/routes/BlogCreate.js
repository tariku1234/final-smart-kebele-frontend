"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./BlogForm.css"

const BlogCreate = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "announcement",
    tags: "",
    isPublished: true,
  })
  const [featuredImage, setFeaturedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alertNotification, setAlertNotification] = useState(null)

  // Redirect if not logged in or not Kentiba Biro
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "kentiba_biro") {
      navigate("/blog")
      return
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFeaturedImage(file)

      // Create preview URL - this will be converted to Base64 on the server
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      setError("Title and content are required")
      return
    }

    setLoading(true)
    setError(null)
    setAlertNotification(null)

    try {
      const token = localStorage.getItem("token")

      // Create form data for file upload
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("content", formData.content)
      formDataObj.append("category", formData.category)
      formDataObj.append("tags", formData.tags)
      formDataObj.append("isPublished", formData.isPublished)

      if (featuredImage) {
        formDataObj.append("featuredImage", featuredImage)
      }

      console.log("Submitting blog post:", {
        title: formData.title,
        category: formData.category,
        hasImage: !!featuredImage,
      })

      const response = await fetch(`${API_URL}/api/blog`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Blog post created successfully:", data)

        // Show alert notification message if it's alert news
        if (data.alertNotification) {
          setAlertNotification(data.alertNotification)
        }

        // Redirect to the blog list after a short delay if alert notification
        if (data.alertNotification) {
          setTimeout(() => {
            navigate("/blog")
          }, 3000)
        } else {
          navigate("/blog")
        }
      } else {
        console.error("Failed to create blog post:", data)
        setError(data.message || "Failed to create blog post")
      }
    } catch (err) {
      console.error("Error creating blog post:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="blog-form-container">
      <h2 className="blog-form-title">Create New Blog Post</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {alertNotification && (
        <div className="alert alert-success">
          <strong>🚨 Alert News Created!</strong>
          <br />
          {alertNotification}
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="announcement">Announcement</option>
            <option value="news">News</option>
            <option value="guide">Guide</option>
            <option value="success_story">Success Story</option>
            <option value="alert_news">🚨 Alert News</option>
            <option value="other">Other</option>
          </select>
          {formData.category === "alert_news" && (
            <div className="alert-news-notice">
              <strong>⚠️ Alert News Notice:</strong> This post will be sent as an urgent notification to all citizens via
              email when published.
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. important, update, service"
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage" className="form-label">
            Featured Image
          </label>
          <input
            type="file"
            id="featuredImage"
            name="featuredImage"
            onChange={handleImageChange}
            className="form-input"
            accept="image/jpeg,image/png,image/gif"
          />
          <small className="form-text text-muted">
            Images are stored securely and will be optimized for web delivery.
          </small>
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Write your blog post content here..."
            rows="12"
            required
          ></textarea>
        </div>

        <div className="form-group form-checkbox">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="form-checkbox-input"
          />
          <label htmlFor="isPublished" className="form-checkbox-label">
            Publish immediately
            {formData.category === "alert_news" && (
              <span className="alert-publish-note"> (Will send email alerts to all citizens)</span>
            )}
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/blog")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogCreate
