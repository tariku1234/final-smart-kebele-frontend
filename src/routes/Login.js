"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Login.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const { login, error, setError } = useContext(AuthContext)
  const navigate = useNavigate()

  const { email, password } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    const success = await login(email, password)

    setLoading(false)

    if (success) {
      navigate("/")
    }
  }

  return (
    <div className="login-container">
      <div className="form-container login-form">
        <h2 className="form-title">Login to Smart-Kebele</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="form-link">
              Register as Citizen
            </Link>
          </p>
          <p>
            Register as a stakeholder office?{" "}
            <Link to="/stakeholder-register" className="form-link">
              Stakeholder Registration
            </Link>
          </p>
          <p>
            Register as an administrator?{" "}
            <Link to="/admin-register" className="form-link">
              Administrator Registration
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="form-link">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

