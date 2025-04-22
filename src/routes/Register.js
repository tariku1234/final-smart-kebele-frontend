"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Register.css"

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    address: "",
  })

  const [loading, setLoading] = useState(false)
  const { register, error, setError } = useContext(AuthContext)
  const navigate = useNavigate()

  const { firstName, lastName, email, phone, password, confirmPassword, idNumber, address } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      idNumber,
      address,
      role: "citizen", // Default role for new registrations
    }

    const result = await register(userData)

    setLoading(false)

    if (result.success) {
      navigate("/login")
    }
  }

  return (
    <div className="register-container">
      <div className="form-container register-form">
        <h2 className="form-title">Register for Smart-Kebele</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-row">
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
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="idNumber" className="form-label">
              ID Number
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={idNumber}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your ID number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your address"
              required
            />
          </div>

          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="form-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

