"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../config"
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Reset code has been sent to your email address.")
        setStep(2)
      } else {
        setError(data.message || "Failed to send reset code.")
      }
    } catch (err) {
      console.error("Forgot password error:", err)
      setError("Failed to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetCodeSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Reset code verified successfully.")
        setStep(3)
      } else {
        setError(data.message || "Invalid reset code.")
      }
    } catch (err) {
      console.error("Verify reset code error:", err)
      setError("Failed to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password has been reset successfully. You can now login with your new password.")
        setStep(4)
      } else {
        setError(data.message || "Failed to reset password.")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError("Failed to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="form-container forgot-password-form">
        <h2 className="form-title">Reset Your Password</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
              <small className="form-text">
                We'll send a reset code to this email address if it's associated with an account.
              </small>
            </div>

            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetCodeSubmit}>
            <div className="form-group">
              <label htmlFor="resetCode" className="form-label">
                Reset Code
              </label>
              <input
                type="text"
                id="resetCode"
                name="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="form-input"
                placeholder="Enter the reset code from your email"
                required
                disabled={loading}
              />
              <small className="form-text">Please check your email for a reset code and enter it here.</small>
            </div>

            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify Reset Code"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset}>
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
              />
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
              />
            </div>

            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="reset-success">
            <p>Your password has been reset successfully!</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        )}

        <div className="form-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="form-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

