"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./CommentSection.css"

const CommentSection = ({ blogPostId }) => {
  const { user } = useContext(AuthContext)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [blogPostId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/comments/${blogPostId}`)
      const data = await response.json()

      if (response.ok) {
        setComments(data.comments)
      } else {
        setError(data.message || "Failed to fetch comments")
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user) {
      setError("Please login to comment")
      return
    }

    if (!newComment.trim()) return

    try {
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

      const data = await response.json()

      if (response.ok) {
        setComments([data.comment, ...comments])
        setNewComment("")
      } else {
        setError(data.message || "Failed to post comment")
      }
    } catch (err) {
      console.error("Error posting comment:", err)
      setError("Failed to connect to the server")
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!user || !replyContent.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent,
          blogPostId,
          parentCommentId: replyTo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Add reply to the parent comment
        setComments(
          comments.map((comment) =>
            comment._id === replyTo ? { ...comment, replies: [...comment.replies, data.comment] } : comment,
          ),
        )
        setReplyContent("")
        setReplyTo(null)
      } else {
        setError(data.message || "Failed to post reply")
      }
    } catch (err) {
      console.error("Error posting reply:", err)
      setError("Failed to connect to the server")
    }
  }

  const handleLike = async (commentId) => {
    if (!user) {
      setError("Please login to like comments")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                  hasLiked: data.hasLiked,
                  hasDisliked: data.hasDisliked,
                }
              : comment,
          ),
        )
      }
    } catch (err) {
      console.error("Error liking comment:", err)
    }
  }

  const handleDislike = async (commentId) => {
    if (!user) {
      setError("Please login to dislike comments")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments/${commentId}/dislike`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                  hasLiked: data.hasLiked,
                  hasDisliked: data.hasDisliked,
                }
              : comment,
          ),
        )
      }
    } catch (err) {
      console.error("Error disliking comment:", err)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      })

      const data = await response.json()

      if (response.ok) {
        setComments(comments.map((comment) => (comment._id === commentId ? data.comment : comment)))
        setEditingComment(null)
        setEditContent("")
      } else {
        setError(data.message || "Failed to edit comment")
      }
    } catch (err) {
      console.error("Error editing comment:", err)
      setError("Failed to connect to the server")
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId))
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete comment")
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
      setError("Failed to connect to the server")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getUserDisplayName = (author) => {
    return `${author.firstName} ${author.lastName}`
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      citizen: "Citizen",
      wereda: "Wereda",
      kifleketema: "Kifleketema",
      stakeholder: "Stakeholder",
      kentiba_biro: "Kentiba Biro",
    }
    return roleNames[role] || role
  }

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>
  }

  return (
    <div className="comment-section">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      {error && <div className="comment-error">{error}</div>}

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <div className="comment-form-header">
            <span className="comment-author">
              {getUserDisplayName(user)} ({getRoleDisplayName(user.role)})
            </span>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
            rows="3"
            maxLength="1000"
          />
          <div className="comment-form-footer">
            <span className="character-count">{newComment.length}/1000</span>
            <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">Please login to post comments.</div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <span className="comment-author">
                {getUserDisplayName(comment.author)} ({getRoleDisplayName(comment.author.role)})
              </span>
              <span className="comment-date">
                {formatDate(comment.createdAt)}
                {comment.isEdited && <span className="edited-indicator"> (edited)</span>}
              </span>
            </div>

            <div className="comment-content">
              {editingComment === comment._id ? (
                <div className="edit-comment-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-textarea"
                    rows="3"
                    maxLength="1000"
                  />
                  <div className="edit-form-buttons">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="save-edit-btn"
                      disabled={!editContent.trim()}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null)
                        setEditContent("")
                      }}
                      className="cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{comment.content}</p>
              )}
            </div>

            <div className="comment-actions">
              <button
                onClick={() => handleLike(comment._id)}
                className={`action-btn like-btn ${comment.hasLiked ? "active" : ""}`}
              >
                👍 {comment.likesCount || 0}
              </button>
              <button
                onClick={() => handleDislike(comment._id)}
                className={`action-btn dislike-btn ${comment.hasDisliked ? "active" : ""}`}
              >
                👎 {comment.dislikesCount || 0}
              </button>
              <button
                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                className="action-btn reply-btn"
              >
                Reply
              </button>
              {user && user.id === comment.author._id && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment._id)
                      setEditContent(comment.content)
                    }}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteComment(comment._id)} className="action-btn delete-btn">
                    Delete
                  </button>
                </>
              )}
              {user && user.role === "kentiba_biro" && user.id !== comment.author._id && (
                <button onClick={() => handleDeleteComment(comment._id)} className="action-btn delete-btn admin-delete">
                  Delete
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === comment._id && user && (
              <form onSubmit={handleSubmitReply} className="reply-form">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${getUserDisplayName(comment.author)}...`}
                  className="reply-textarea"
                  rows="2"
                  maxLength="1000"
                />
                <div className="reply-form-buttons">
                  <button type="submit" className="reply-submit-btn" disabled={!replyContent.trim()}>
                    Post Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null)
                      setReplyContent("")
                    }}
                    className="reply-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="reply">
                    <div className="reply-header">
                      <span className="reply-author">
                        {getUserDisplayName(reply.author)} ({getRoleDisplayName(reply.author.role)})
                      </span>
                      <span className="reply-date">
                        {formatDate(reply.createdAt)}
                        {reply.isEdited && <span className="edited-indicator"> (edited)</span>}
                      </span>
                    </div>
                    <div className="reply-content">
                      <p>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && !loading && (
        <div className="no-comments">No comments yet. Be the first to comment!</div>
      )}
    </div>
  )
}

export default CommentSection
