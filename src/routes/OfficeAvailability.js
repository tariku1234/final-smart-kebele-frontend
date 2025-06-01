"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import OfficeCard from "../components/OfficeCard"
import { API_URL, OFFICE_STATUS, KIFLEKETEMA_LIST, USER_ROLES, WEREDA_COUNT } from "../config"
import "./OfficeAvailability.css"

const OfficeAvailability = () => {
  const { user } = useContext(AuthContext)
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKifleketema, setSelectedKifleketema] = useState("")
  const [selectedWereda, setSelectedWereda] = useState("")
  const [weredaOptions, setWeredaOptions] = useState([])
  const [officeTypes, setOfficeTypes] = useState([])
  const [selectedOfficeType, setSelectedOfficeType] = useState("")

  // Fetch office types
  useEffect(() => {
    const getOfficeTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/offices/types`)
        const data = await response.json()
        setOfficeTypes(data.officeTypes || [])
      } catch (err) {
        console.error("Error fetching office types:", err)
        setOfficeTypes([])
      }
    }

    getOfficeTypes()
  }, [])

  // Update wereda options when kifleketema changes
  useEffect(() => {
    if (selectedKifleketema) {
      const weredaCount = WEREDA_COUNT[selectedKifleketema] || 10
      const options = Array.from({ length: weredaCount }, (_, i) => ({
        value: i + 1,
        label: `Wereda ${i + 1}`,
      }))
      setWeredaOptions(options)
    } else {
      setWeredaOptions([])
    }
    setSelectedWereda("")
  }, [selectedKifleketema])

  // Fetch offices based on filters
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true)
        let url = `${API_URL}/api/offices?`

        const params = new URLSearchParams()

        if (filter !== "all") {
          params.append("status", filter)
        }

        if (selectedKifleketema) {
          params.append("kifleketema", selectedKifleketema)
        }

        if (selectedWereda) {
          params.append("wereda", selectedWereda)
        }

        if (selectedOfficeType) {
          params.append("officeType", selectedOfficeType)
        }

        url += params.toString()

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok) {
          setOffices(data.offices)
        } else {
          setError(data.message || "Failed to fetch office information")
        }
      } catch (err) {
        console.error("Error fetching offices:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    fetchOffices()
  }, [filter, selectedKifleketema, selectedWereda, selectedOfficeType])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleKifleketemaChange = (e) => {
    setSelectedKifleketema(e.target.value)
  }

  const handleWeredaChange = (e) => {
    setSelectedWereda(e.target.value)
  }

  const handleOfficeTypeChange = (e) => {
    setSelectedOfficeType(e.target.value)
  }

  // Filter offices based on search term
  const filteredOffices = offices.filter(
    (office) =>
      office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="office-availability-container">
      <h2 className="page-title">Office Availability</h2>
      <p className="page-description">Check the availability status of local government offices before visiting.</p>

      <div className="location-filter-section">
        <div className="location-filter">
          <label htmlFor="kifleketema-filter" className="filter-label">
            Kifle Ketema:
          </label>
          <select
            id="kifleketema-filter"
            value={selectedKifleketema}
            onChange={handleKifleketemaChange}
            className="filter-select"
          >
            <option value="">All Kifle Ketemas</option>
            {KIFLEKETEMA_LIST.map((kifleketema) => (
              <option key={kifleketema.value} value={kifleketema.value}>
                {kifleketema.label}
              </option>
            ))}
          </select>
        </div>

        <div className="location-filter">
          <label htmlFor="wereda-filter" className="filter-label">
            Wereda:
          </label>
          <select
            id="wereda-filter"
            value={selectedWereda}
            onChange={handleWeredaChange}
            className="filter-select"
            disabled={!selectedKifleketema}
          >
            <option value="">All Weredas</option>
            {weredaOptions.map((wereda) => (
              <option key={wereda.value} value={wereda.value}>
                {wereda.label}
              </option>
            ))}
          </select>
        </div>

        <div className="location-filter">
          <label htmlFor="office-type-filter" className="filter-label">
            Office Type:
          </label>
          <select
            id="office-type-filter"
            value={selectedOfficeType}
            onChange={handleOfficeTypeChange}
            className="filter-select"
          >
            <option value="">All Office Types</option>
            {officeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search offices..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="status-filter">
          <label htmlFor="status-filter" className="filter-label">
            Filter by Status:
          </label>
          <select id="status-filter" value={filter} onChange={handleFilterChange} className="filter-select">
            <option value="all">All Offices</option>
            <option value={OFFICE_STATUS.OPEN}>Open</option>
            <option value={OFFICE_STATUS.LIMITED}>Limited Service</option>
            <option value={OFFICE_STATUS.CLOSED}>Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading office information...</p>
      ) : filteredOffices.length === 0 ? (
        <p className="no-offices">No offices found matching your criteria.</p>
      ) : (
        <div className="offices-grid">
          {filteredOffices.map((office) => (
            <OfficeCard key={office._id} office={office} />
          ))}
        </div>
      )}

      {user && user.role === USER_ROLES.WEREDA_ANTI_CORRUPTION && (
        <div className="admin-actions">
          <button className="add-office-btn" onClick={() => (window.location.href = "/admin/offices")}>
           
          </button>
        </div>
      )}
    </div>
  )
}

export default OfficeAvailability
