// Email validation utility to check if email actually exists
class EmailValidator {
    constructor() {
      this.cache = new Map() // Cache results to avoid repeated API calls
      this.cacheExpiry = 5 * 60 * 1000 // 5 minutes cache
    }
  
    // Check if email format is valid
    isValidFormat(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }
  
    // Check if email domain has valid MX records
    async checkDomainMX(domain) {
      try {
        // Use a free DNS lookup service
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`)
        const data = await response.json()
  
        return data.Status === 0 && data.Answer && data.Answer.length > 0
      } catch (error) {
        console.warn("MX record check failed:", error)
        return true // Assume valid if check fails
      }
    }
  
    // Check if email exists using multiple methods
    async validateEmail(email) {
      if (!email || !this.isValidFormat(email)) {
        return {
          isValid: false,
          reason: "Invalid email format",
        }
      }
  
      // Check cache first
      const cacheKey = email.toLowerCase()
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.result
      }
  
      const domain = email.split("@")[1]
  
      // Check common invalid domains
      const invalidDomains = [
        "test.com",
        "example.com",
        "fake.com",
        "invalid.com",
        "temp.com",
        "dummy.com",
        "placeholder.com",
      ]
  
      if (invalidDomains.includes(domain.toLowerCase())) {
        const result = {
          isValid: false,
          reason: "Invalid or test email domain",
        }
        this.cache.set(cacheKey, { result, timestamp: Date.now() })
        return result
      }
  
      try {
        // Method 1: Check MX records
        const hasMX = await this.checkDomainMX(domain)
        if (!hasMX) {
          const result = {
            isValid: false,
            reason: "Email domain does not exist or has no mail servers",
          }
          this.cache.set(cacheKey, { result, timestamp: Date.now() })
          return result
        }
  
        // Method 2: Use free email validation API (optional)
        const apiResult = await this.checkWithAPI(email)
        if (apiResult !== null) {
          this.cache.set(cacheKey, { result: apiResult, timestamp: Date.now() })
          return apiResult
        }
  
        // If all checks pass or are inconclusive, assume valid
        const result = {
          isValid: true,
          reason: "Email appears to be valid",
        }
        this.cache.set(cacheKey, { result, timestamp: Date.now() })
        return result
      } catch (error) {
        console.warn("Email validation error:", error)
        // If validation fails, assume email is valid to avoid blocking legitimate users
        const result = {
          isValid: true,
          reason: "Could not verify email, assuming valid",
        }
        this.cache.set(cacheKey, { result, timestamp: Date.now() })
        return result
      }
    }
  
    // Use free email validation API (Hunter.io, EmailValidator.net, etc.)
    async checkWithAPI(email) {
      try {
        // Using a free email validation service
        // Note: You might need to sign up for a free API key
        const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=free`)
  
        if (!response.ok) {
          return null // API unavailable, skip this check
        }
  
        const data = await response.json()
  
        if (data.data && data.data.result) {
          const isValid = data.data.result === "deliverable"
          return {
            isValid,
            reason: isValid ? "Email verified as deliverable" : `Email validation failed: ${data.data.result}`,
          }
        }
  
        return null // Inconclusive result
      } catch (error) {
        console.warn("API email validation failed:", error)
        return null // API unavailable
      }
    }
  
    // Quick validation for common email providers
    async quickValidate(email) {
      if (!this.isValidFormat(email)) {
        return {
          isValid: false,
          reason: "Invalid email format",
        }
      }
  
      const domain = email.split("@")[1].toLowerCase()
  
      // List of known valid email providers
      const knownProviders = [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
        "aol.com",
        "icloud.com",
        "protonmail.com",
        "zoho.com",
        "mail.com",
        "yandex.com",
        "live.com",
        "msn.com",
      ]
  
      if (knownProviders.includes(domain)) {
        return {
          isValid: true,
          reason: "Known email provider",
        }
      }
  
      // For unknown domains, do full validation
      return await this.validateEmail(email)
    }
  }
  
  // Create singleton instance
  const emailValidator = new EmailValidator()
  
  export default emailValidator
  