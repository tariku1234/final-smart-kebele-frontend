"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext)

  // If auth is still loading, show nothing or a loading spinner
  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If specific roles are required and user doesn't have one of them, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  // If user is authenticated and has the required role (if any), render the children
  return children
}

export default PrivateRoute

