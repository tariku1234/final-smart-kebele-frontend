"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import "./ResetPassword.css"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setError("Invalid reset link. Please request a new password reset.")
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        setError(data.message || "Failed to reset password.")
        if (data.message?.includes("Invalid or expired")) {
          setTokenValid(false)
        }
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError("Failed to connect to the server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="form-container reset-password-form">
          <h2 className="form-title">Invalid Reset Link</h2>
          <div className="alert alert-danger">This password reset link is invalid or has expired.</div>
          <div className="form-footer">
            <Link to="/forgot-password" className="form-link">
              Request a new password reset
            </Link>
            {" | "}
            <Link to="/login" className="form-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="form-container reset-password-form">
          <h2 className="form-title">Password Reset Successful!</h2>
          <div className="alert alert-success">
            Your password has been reset successfully. You will be redirected to the login page in a few seconds.
          </div>
          <div className="form-footer">
            <Link to="/login" className="btn btn-primary">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-container">
      <div className="form-container reset-password-form">
        <h2 className="form-title">Reset Your Password</h2>
        <p className="form-subtitle">Enter your new password below</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your new password"
              required
              disabled={loading}
              minLength={6}
            />
            <small className="form-text">Password must be at least 6 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Confirm your new password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="form-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
