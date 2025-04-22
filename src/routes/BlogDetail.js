"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./BlogDetail.css"

const BlogDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const response = await fetch(`${API_URL}/api/blog/${id}`, { headers })
        const data = await response.json()

        if (response.ok) {
          setPost(data.blogPost)
        } else {
          setError(data.message || "Failed to fetch blog post")
        }
      } catch (err) {
        console.error("Error fetching blog post:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getCategoryName = (category) => {
    const categories = {
      announcement: "Announcement",
      news: "News",
      guide: "Guide",
      success_story: "Success Story",
      other: "Other",
    }
    return categories[category] || "Other"
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        navigate("/blog")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete blog post")
      }
    } catch (err) {
      console.error("Error deleting blog post:", err)
      setError("Failed to connect to the server")
    }
  }

  if (loading) {
    return <div className="blog-detail-loading">Loading post...</div>
  }

  if (error) {
    return <div className="blog-detail-error">{error}</div>
  }

  if (!post) {
    return <div className="blog-detail-not-found">Blog post not found</div>
  }

  const isKentibaBiro = user && user.role === "kentiba_biro"

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-header">
        <Link to="/blog" className="blog-back-link">
          &larr; Back to Blog
        </Link>

        {isKentibaBiro && (
          <div className="blog-admin-actions">
            <Link to={`/blog/edit/${post._id}`} className="blog-edit-button">
              Edit Post
            </Link>
            <button onClick={handleDelete} className="blog-delete-button">
              Delete Post
            </button>
          </div>
        )}
      </div>

      <article className="blog-detail-content">
        <header className="blog-detail-title-section">
          <div className="blog-detail-meta">
            <span className={`blog-category blog-category-${post.category}`}>{getCategoryName(post.category)}</span>
            <span className="blog-date">{formatDate(post.publishedAt)}</span>
          </div>
          <h1 className="blog-detail-title">{post.title}</h1>
          {post.author && (
            <div className="blog-detail-author">
              By: {post.author.firstName} {post.author.lastName}
            </div>
          )}
        </header>

        {post.featuredImage && (
          <div className="blog-detail-image-container">
            <img src={post.featuredImage || "/placeholder.svg"} alt={post.title} className="blog-detail-image" />
          </div>
        )}

        <div className="blog-detail-body">
          {/* Render content with line breaks */}
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

export default BlogDetail
