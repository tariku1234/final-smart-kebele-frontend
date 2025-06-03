"use client"

import { Link } from "react-router-dom"
import { useState, useEffect, useContext, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./BlogCard.css"

const BlogCard = ({ post }) => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    commentCount: 0,
  })
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)

  // Fetch only comment count since reactions are for comments, not blog posts
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${post._id}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats({ commentCount: data.commentCount || 0 })
      }
    } catch (err) {
      console.error("Error fetching engagement stats:", err)
    }
  }, [post._id])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate("/login")
      return
    }

    if (!newComment.trim() || isCommenting) return

    try {
      setIsCommenting(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          blogPostId: post._id,
        }),
      })

      if (response.ok) {
        setNewComment("")
        fetchStats() // Refresh stats
      } else {
        console.error("Comment failed:", await response.text())
      }
    } catch (err) {
      console.error("Error posting comment:", err)
    } finally {
      setIsCommenting(false)
    }
  }

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
      alert_news: "🚨 Alert News",
      other: "Other",
    }
    return categories[category] || "Other"
  }

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substr(0, maxLength) + "..."
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"

    // If it's a Base64 data URL, return it directly
    if (imagePath.startsWith("data:")) {
      return imagePath
    }

    if (imagePath.startsWith("http")) {
      return imagePath
    }

    if (imagePath.startsWith("/")) {
      return `${API_URL}${imagePath}`
    }

    return `${API_URL}/uploads/${imagePath}`
  }

  const isVideo = (path) => {
    if (!path) return false

    // Check if it's a Base64 video data URL
    if (path.startsWith("data:video/")) {
      return true
    }

    const videoExtensions = [".mp4", ".webm", ".ogg"]
    return videoExtensions.some((ext) => path.toLowerCase().endsWith(ext))
  }

  return (
    <div className="blog-card">
      <div className="blog-card-header">
        <span className={`blog-category blog-category-${post.category}`}>{getCategoryName(post.category)}</span>
        <span className="blog-date">{formatDate(post.publishedAt)}</span>
      </div>

      {post.featuredImage && (
        <div className="blog-image-container">
          {isVideo(post.featuredImage) ? (
            <video
              src={getImageUrl(post.featuredImage)}
              className="blog-featured-video"
              controls
              preload="metadata"
              onError={(e) => {
                console.error("Video failed to load:", post.featuredImage, e)
                e.target.onerror = null
                e.target.poster = "/placeholder.svg"
              }}
            />
          ) : (
            <img
              src={getImageUrl(post.featuredImage) || "/placeholder.svg"}
              alt={post.title}
              className="blog-featured-image"
              onError={(e) => {
                console.error("Image failed to load:", post.featuredImage)
                e.target.onerror = null
                e.target.src = "/placeholder.svg"
              }}
            />
          )}
        </div>
      )}

      <div className="blog-card-content">
        <h3 className="blog-title">{post.title}</h3>
        <p className="blog-excerpt">{truncateContent(post.content)}</p>
      </div>

      {/* Fixed position engagement section */}
      <div className="blog-engagement-fixed">
        <div className="engagement-stats">
          <div className="comment-stat">
            <span className="comment-icon">💬</span>
            <span className="comment-count">{stats.commentCount} comments</span>
          </div>
        </div>

        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-input"
            disabled={!user || isCommenting}
          />
          <button type="submit" className="comment-submit" disabled={!user || !newComment.trim() || isCommenting}>
            {isCommenting ? "..." : "Send"}
          </button>
        </form>
      </div>

      <div className="blog-card-footer">
        <Link to={`/blog/${post._id}`} className="blog-read-more">
          Read More
        </Link>
        {post.author && (
          <span className="blog-author">
            By: {post.author.firstName} {post.author.lastName}
          </span>
        )}
      </div>
    </div>
  )
}

export default BlogCard
