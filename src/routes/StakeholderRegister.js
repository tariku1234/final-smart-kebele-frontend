"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_URL, WEREDA_COUNT } from "../config"
import "./StakeholderRegister.css"

const StakeholderRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    address: "",
    officeName: "",
    officeType: "trade_office",
    officeAddress: "",
    officePhone: "",
    kifleketema: "",
    wereda: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
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
    officeName,
    officeType,
    officeAddress,
    officePhone,
    kifleketema,
    wereda,
  } = formData

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)

    // Reset wereda if kifleketema changes
    if (e.target.name === "kifleketema") {
      setFormData({ ...formData, kifleketema: e.target.value, wereda: "" })
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

    if (!kifleketema) {
      setError("Please select a Kifleketema (sub-city)")
      return
    }

    if (!wereda) {
      setError("Please select a Wereda (district)")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/stakeholders/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          idNumber,
          address,
          officeName,
          officeType,
          officeAddress,
          officePhone,
          kifleketema,
          wereda,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          idNumber: "",
          address: "",
          officeName: "",
          officeType: "trade_office",
          officeAddress: "",
          officePhone: "",
          kifleketema: "",
          wereda: "",
        })

        // Redirect after 5 seconds
        setTimeout(() => {
          navigate("/login")
        }, 5000)
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
    <div className="stakeholder-register-container">
      <div className="form-container stakeholder-register-form">
        <h2 className="form-title">Register as Stakeholder Office</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Your stakeholder office has been registered successfully! Your account will be reviewed and approved by the
            Kentiba Biro. You will be redirected to the login page shortly.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 className="section-title">Personal Information</h3>

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
                disabled={success}
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
                disabled={success}
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
                disabled={success}
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
                disabled={success}
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
              disabled={success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Personal Address
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
              disabled={success}
            />
          </div>

          <h3 className="section-title">Office Information</h3>

          <div className="form-group">
            <label htmlFor="officeName" className="form-label">
              Office Name
            </label>
            <input
              type="text"
              id="officeName"
              name="officeName"
              value={officeName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your office name"
              required
              disabled={success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="officeType" className="form-label">
              Office Type
            </label>
            <select
              id="officeType"
              name="officeType"
              value={officeType}
              onChange={handleChange}
              className="form-select"
              required
              disabled={success}
            >
              <option value="trade_office">Trade Office</option>
              <option value="id_office">ID Office</option>
              <option value="land_office">Land Office</option>
              <option value="tax_office">Tax Office</option>
              <option value="court_office">Court Office</option>
              <option value="police_office">Police Office</option>
              <option value="education_office">Education Office</option>
              <option value="health_office">Health Office</option>
              <option value="transport_office">Transport Office</option>
              <option value="water_office">Water Office</option>
              <option value="electricity_office">Electricity Office</option>
              <option value="telecom_office">Telecom Office</option>
              <option value="immigration_office">Immigration Office</option>
              <option value="social_affairs_office">Social Affairs Office</option>
              <option value="other">Other</option>
            </select>
          </div>

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
                required
                disabled={success}
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
                required
                disabled={!kifleketema || success}
              >
                <option value="">Select Wereda</option>
                {getWeredaOptions().map((num) => (
                  <option key={num} value={num}>
                    Wereda {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="officeAddress" className="form-label">
                Office Address
              </label>
              <input
                type="text"
                id="officeAddress"
                name="officeAddress"
                value={officeAddress}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your office address"
                required
                disabled={success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="officePhone" className="form-label">
                Office Phone
              </label>
              <input
                type="tel"
                id="officePhone"
                name="officePhone"
                value={officePhone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your office phone"
                required
                disabled={success}
              />
            </div>
          </div>

          <h3 className="section-title">Security Information</h3>

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
                disabled={success}
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
                disabled={success}
              />
            </div>
          </div>

          <div className="form-notice">
            <p>
              Note: Your stakeholder office registration will need to be approved by the Kentiba Biro before you can
              access the system.
            </p>
          </div>

          <button type="submit" className="form-button" disabled={loading || success}>
            {loading ? "Registering..." : "Register Stakeholder Office"}
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
        </div>
      </div>
    </div>
  )
}

export default StakeholderRegister
