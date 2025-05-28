"use client"

import { useState, useCallback } from "react"
import emailValidator from "../utils/emailValidator"

export const useEmailValidation = () => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  const validateEmail = useCallback(async (email) => {
    if (!email) {
      setValidationResult(null)
      return null
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const result = await emailValidator.quickValidate(email)
      setValidationResult(result)
      return result
    } catch (error) {
      console.error("Email validation error:", error)
      const errorResult = {
        isValid: true, // Assume valid on error to avoid blocking users
        reason: "Validation service unavailable",
      }
      setValidationResult(errorResult)
      return errorResult
    } finally {
      setIsValidating(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
    setIsValidating(false)
  }, [])

  return {
    validateEmail,
    clearValidation,
    isValidating,
    validationResult,
    isValid: validationResult?.isValid,
    validationMessage: validationResult?.reason,
  }
}
