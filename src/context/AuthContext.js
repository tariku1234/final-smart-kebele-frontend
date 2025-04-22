"use client"

import { createContext, useState, useEffect } from "react"
import { API_URL } from "../config"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Token is invalid or expired
            localStorage.removeItem("token")
            setUser(null)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking authentication:", err)
        setError("Failed to authenticate user")
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setError(null)

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return true
      } else {
        setError(data.message || "Login failed")
        return false
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to connect to the server")
      return false
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setError(null)

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        setError(data.message || "Registration failed")
        return { success: false, message: data.message }
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to connect to the server")
      return { success: false, message: "Failed to connect to the server" }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
//new
