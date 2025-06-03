// File Download Helper for Base64 attachments
// This utility handles proper downloading and viewing of Base64 files

/**
 * Check if a string is a Base64 data URL
 */
export const isBase64DataUrl = (str) => {
  if (!str || typeof str !== "string") return false
  return str.startsWith("data:")
}

/**
 * Extract file information from Base64 data URL
 */
export const extractFileInfoFromBase64 = (dataUrl) => {
  if (!isBase64DataUrl(dataUrl)) return null

  try {
    const [header, base64Data] = dataUrl.split(",")
    const mimeMatch = header.match(/data:([^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream"

    // Calculate approximate file size (Base64 is ~33% larger than original)
    const size = Math.round((base64Data.length * 3) / 4)

    return {
      mimeType,
      size,
      base64Data,
    }
  } catch (error) {
    console.error("Error extracting file info from Base64:", error)
    return null
  }
}

/**
 * Convert Base64 data URL to Blob
 */
export const base64ToBlob = (dataUrl) => {
  const fileInfo = extractFileInfoFromBase64(dataUrl)
  if (!fileInfo) return null

  try {
    const byteCharacters = atob(fileInfo.base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: fileInfo.mimeType })
  } catch (error) {
    console.error("Error converting Base64 to Blob:", error)
    return null
  }
}

/**
 * Download a Base64 file
 */
export const downloadBase64File = (dataUrl, fileName = "download") => {
  try {
    const blob = base64ToBlob(dataUrl)
    if (!blob) return false

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error downloading Base64 file:", error)
    return false
  }
}

/**
 * Open Base64 file in new tab (for viewable files like PDFs)
 */
export const openBase64FileInNewTab = (dataUrl) => {
  try {
    const blob = base64ToBlob(dataUrl)
    if (!blob) return false

    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, "_blank")

    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)

    return newWindow !== null
  } catch (error) {
    console.error("Error opening Base64 file in new tab:", error)
    return false
  }
}

/**
 * Check if a file type can be viewed in browser
 */
export const canViewInBrowser = (mimeType) => {
  const viewableTypes = [
    "application/pdf",
    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
  ]

  return viewableTypes.includes(mimeType) || mimeType.startsWith("image/")
}

/**
 * Get file name from attachment (Base64 or file path)
 */
export const getFileNameFromAttachment = (attachment, index = 0) => {
  if (!attachment) return `file_${index + 1}`

  if (isBase64DataUrl(attachment)) {
    const fileInfo = extractFileInfoFromBase64(attachment)
    if (fileInfo) {
      const extension = getExtensionFromMimeType(fileInfo.mimeType)
      return `attachment_${index + 1}${extension}`
    }
    return `attachment_${index + 1}`
  }

  // For file paths, extract the filename
  const parts = attachment.split("/")
  const fileName = parts[parts.length - 1]
  return fileName || `attachment_${index + 1}`
}

/**
 * Get file extension from MIME type
 */
export const getExtensionFromMimeType = (mimeType) => {
  const extensions = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "text/html": ".html",
    "text/css": ".css",
    "text/javascript": ".js",
    "application/json": ".json",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/zip": ".zip",
    "application/x-rar-compressed": ".rar",
  }

  return extensions[mimeType] || ""
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
