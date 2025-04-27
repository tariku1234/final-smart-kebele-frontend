"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_URL, WEREDA_COUNT } from "../config"
import "./AdminRegister.css"

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    address: "",
    role: "wereda_anti_corruption", // Default role
    adminCode: "", // Special code for admin registration
    kifleketema: "",
    wereda: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    idNumber,
    address,
    role,
    adminCode,
    kifleketema,
    wereda,
  } = formData

  // Determine if kifleketema selection should be shown
  const showKifleketemaSelection = role !== "kentiba_biro"

  // Determine if wereda selection should be shown
  const showWeredaSelection = role === "wereda_anti_corruption" && kifleketema

  const handleChange = (e) => {
    const { name, value } = e.target

    // Clear error when user starts typing
    if (error) setError(null)

    if (name === "role") {
      // If changing to kentiba_biro, reset kifleketema and wereda
      if (value === "kentiba_biro") {
        setFormData({
          ...formData,
          role: value,
          kifleketema: "",
          wereda: "",
        })
      }
      // If changing to kifleketema_anti_corruption, just reset wereda
      else if (value === "kifleketema_anti_corruption") {
        setFormData({
          ...formData,
          role: value,
          wereda: "",
        })
      }
      // Otherwise just update the role
      else {
        setFormData({
          ...formData,
          role: value,
        })
      }
    }
    // Reset wereda if kifleketema changes
    else if (name === "kifleketema") {
      setFormData({
        ...formData,
        kifleketema: value,
        wereda: "",
      })
    }
    // For all other fields, just update normally
    else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
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

    if (!adminCode) {
      setError("Admin registration code is required")
      return
    }

    // Kifleketema is required for non-kentiba_biro roles
    if (role !== "kentiba_biro" && !kifleketema) {
      setError("Please select a Kifleketema (sub-city)")
      return
    }

    // Wereda is required for Wereda administrators only
    if (role === "wereda_anti_corruption" && !wereda) {
      setError("Please select a Wereda (district)")
      return
    }

    setLoading(true)

    try {
      // Convert wereda to number if it exists
      const weredaValue = wereda ? Number(wereda) : undefined

      // Create request body based on role
      const requestBody = {
        firstName,
        lastName,
        email,
        phone,
        password,
        idNumber,
        address,
        role,
        adminCode,
      }

      // Only add kifleketema for non-kentiba_biro roles
      if (role !== "kentiba_biro") {
        requestBody.kifleketema = kifleketema
      }

      // Only add wereda for wereda_anti_corruption role
      if (role === "wereda_anti_corruption") {
        requestBody.wereda = weredaValue
      }

      const response = await fetch(`${API_URL}/api/admin/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        // Set success message
        setSuccess(data.message || "Registration successful!")

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          idNumber: "",
          address: "",
          role: "wereda_anti_corruption",
          adminCode: "",
          kifleketema: "",
          wereda: "",
        })

        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  // Generate wereda options based on selected kifleketema
  const getWeredaOptions = () => {
    if (!kifleketema) return []

    const weredaCount = WEREDA_COUNT[kifleketema] || 0
    return Array.from({ length: weredaCount }, (_, i) => i + 1)
  }

  return (
    <div className="admin-register-container">
      <div className="form-container admin-register-form">
        <h2 className="form-title">Register as Administrator</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

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
                disabled={loading || success}
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
                disabled={loading || success}
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
                disabled={loading || success}
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
                disabled={loading || success}
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
              disabled={loading || success}
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
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Administrator Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={handleChange}
              className="form-select"
              required
              disabled={loading || success}
            >
              <option value="wereda_anti_corruption">Wereda Anti-Corruption Officer</option>
              <option value="kifleketema_anti_corruption">Kifleketema Anti-Corruption Officer</option>
              <option value="kentiba_biro">Kentiba Biro</option>
            </select>
          </div>

          {showKifleketemaSelection && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kifleketema" className="form-label">
                  Kifleketema (Sub-City)
                </label>
                <select
                  id="kifleketema"
                  name="kifleketema"
                  value={kifleketema}
                  onChange={handleChange}
                  className="form-select"
                  required={role !== "kentiba_biro"}
                  disabled={loading || success}
                >
                  <option value="">Select Kifleketema</option>
                  <option value="lemi_kura">Lemi Kura</option>
                  <option value="arada">Arada</option>
                  <option value="addis_ketema">Addis Ketema</option>
                  <option value="lideta">Lideta</option>
                  <option value="kirkos">Kirkos</option>
                  <option value="yeka">Yeka</option>
                  <option value="bole">Bole</option>
                  <option value="akaky_kaliti">Akaky Kaliti</option>
                  <option value="nifas_silk_lafto">Nifas Silk-Lafto</option>
                  <option value="kolfe_keranio">Kolfe Keranio</option>
                  <option value="gulele">Gulele</option>
                </select>
              </div>

              {showWeredaSelection && (
                <div className="form-group">
                  <label htmlFor="wereda" className="form-label">
                    Wereda (District)
                  </label>
                  <select
                    id="wereda"
                    name="wereda"
                    value={wereda}
                    onChange={handleChange}
                    className="form-select"
                    required={role === "wereda_anti_corruption"}
                    disabled={!kifleketema || loading || success}
                  >
                    <option value="">Select Wereda</option>
                    {getWeredaOptions().map((num) => (
                      <option key={num} value={num}>
                        Wereda {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

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
                disabled={loading || success}
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
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminCode" className="form-label">
              Administrator Registration Code
            </label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={adminCode}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter the administrator registration code"
              required
              disabled={loading || success}
            />
            <small className="form-text">
              This code is provided by the system administrator to authorize admin registrations.
            </small>
          </div>

          <button type="submit" className="form-button" disabled={loading || success}>
            {loading ? "Registering..." : "Register as Administrator"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="form-link">
              Login
            </Link>
          </p>
          <p>
            Register as a citizen?{" "}
            <Link to="/register" className="form-link">
              Citizen Registration
            </Link>
          </p>
          <p>
            Register as a stakeholder office?{" "}
            <Link to="/stakeholder-register" className="form-link">
              Stakeholder Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister
