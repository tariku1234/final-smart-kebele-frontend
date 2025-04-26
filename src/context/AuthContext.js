"use client"

import { createContext, useState, useEffect } from "react"
import { API_URL } from "../config"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userDataReady, setUserDataReady] = useState(false)

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
            console.log("User data loaded:", {
              id: data.user._id,
              role: data.user.role,
              kifleketema: data.user.kifleketema,
              wereda: data.user.wereda,
            })
            setUser(data.user)
            // Set a flag indicating user data is fully loaded
            setUserDataReady(true)
          } else {
            // Token is invalid or expired
            localStorage.removeItem("token")
            setUser(null)
            setUserDataReady(true)
          }
        } else {
          setUserDataReady(true)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking authentication:", err)
        setError("Failed to authenticate user")
        setLoading(false)
        setUserDataReady(true)
      }
    }

    checkLoggedIn()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      setUserDataReady(false)

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

        // After login, fetch the complete user profile
        const profileResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log("Complete user profile loaded after login:", {
            id: profileData.user._id,
            role: profileData.user.role,
            kifleketema: profileData.user.kifleketema,
            wereda: profileData.user.wereda,
          })
          setUser(profileData.user)
        } else {
          setUser(data.user)
        }

        setUserDataReady(true)
        setLoading(false)
        return true
      } else {
        setError(data.message || "Login failed")
        setLoading(false)
        setUserDataReady(true)
        return false
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to connect to the server")
      setLoading(false)
      setUserDataReady(true)
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
    setUserDataReady(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        userDataReady,
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
