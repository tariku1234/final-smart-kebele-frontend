"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./BlogEngagement.css"

const BlogEngagement = ({ blogPostId, showCommentForm = false }) => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    commentCount: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalReactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [blogPostId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/comments/${blogPostId}/stats`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error("Error fetching engagement stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickComment = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate("/login")
      return
    }

    if (!newComment.trim()) return

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
          blogPostId,
        }),
      })

      if (response.ok) {
        setNewComment("")
        fetchStats() // Refresh stats
      }
    } catch (err) {
      console.error("Error posting comment:", err)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleViewComments = () => {
    navigate(`/blog/${blogPostId}`)
  }

  if (loading) {
    return <div className="engagement-loading">Loading...</div>
  }

  return (
    <div className="blog-engagement">
      {/* Telegram-style reaction bar */}
      <div className="engagement-stats">
        {stats.totalLikes > 0 && <span className="reaction-stat like-stat">👍 {stats.totalLikes}</span>}
        {stats.totalDislikes > 0 && <span className="reaction-stat dislike-stat">👎 {stats.totalDislikes}</span>}
        {stats.commentCount > 0 && (
          <span className="comment-stat" onClick={handleViewComments}>
            💬 {stats.commentCount} comment{stats.commentCount !== 1 ? "s" : ""}
          </span>
        )}
        {stats.totalReactions === 0 && stats.commentCount === 0 && (
          <span className="no-engagement">No reactions yet</span>
        )}
      </div>

      {/* Quick comment form (only show if enabled) */}
      {showCommentForm && (
        <div className="quick-comment-section">
          {user ? (
            <form onSubmit={handleQuickComment} className="quick-comment-form">
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="quick-comment-input"
                  maxLength="1000"
                />
                <button type="submit" className="quick-comment-submit" disabled={!newComment.trim() || isCommenting}>
                  {isCommenting ? "..." : "💬"}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt-small">
              <button onClick={() => navigate("/login")} className="login-link">
                Login to comment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="engagement-actions">
        <button className="engagement-btn view-comments-btn" onClick={handleViewComments}>
          View All Comments
        </button>
      </div>
    </div>
  )
}

export default BlogEngagement
