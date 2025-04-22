import { Link } from "react-router-dom"
import { API_URL } from "../config"
import "./BlogCard.css"

const BlogCard = ({ post }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get category display name
  const getCategoryName = (category) => {
    const categories = {
      announcement: "Announcement",
      news: "News",
      guide: "Guide",
      success_story: "Success Story",
      other: "Other",
    }
    return categories[category] || "Other"
  }

  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substr(0, maxLength) + "..."
  }

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"

    // If the path already starts with http or https, it's an absolute URL
    if (imagePath.startsWith("http")) {
      return imagePath
    }

    // If the path starts with a slash, it's relative to the domain
    if (imagePath.startsWith("/")) {
      return `${API_URL}${imagePath}`
    }

    // Otherwise, assume it's a relative path and prepend the API URL and /uploads/
    return `${API_URL}/uploads/${imagePath}`
  }

  // Determine if the featured media is a video
  const isVideo = (path) => {
    if (!path) return false
    const videoExtensions = [".mp4", ".webm", ".ogg"]
    return videoExtensions.some((ext) => path.toLowerCase().endsWith(ext))
  }

  return (
    <div className="blog-card">
      <div className="blog-card-header">
        <span className={`blog-category blog-category-${post.category}`}>{getCategoryName(post.category)}</span>
        <span className="blog-date">{formatDate(post.publishedAt)}</span>
      </div>

      {post.featuredImage && (
        <div className="blog-image-container">
          {isVideo(post.featuredImage) ? (
            <video
              src={getImageUrl(post.featuredImage)}
              className="blog-featured-video"
              controls
              preload="metadata"
              onError={(e) => {
                console.error("Video failed to load:", post.featuredImage, e)
                e.target.onerror = null
                e.target.poster = "/placeholder.svg"
              }}
            />
          ) : (
            <img
              src={getImageUrl(post.featuredImage) || "/placeholder.svg"}
              alt={post.title}
              className="blog-featured-image"
              onError={(e) => {
                console.error("Image failed to load:", post.featuredImage)
                e.target.onerror = null
                e.target.src = "/placeholder.svg"
              }}
            />
          )}
        </div>
      )}

      <div className="blog-card-content">
        <h3 className="blog-title">{post.title}</h3>
        <p className="blog-excerpt">{truncateContent(post.content)}</p>
      </div>

      <div className="blog-card-footer">
        <Link to={`/blog/${post._id}`} className="blog-read-more">
          Read More
        </Link>
        {post.author && (
          <span className="blog-author">
            By: {post.author.firstName} {post.author.lastName}
          </span>
        )}
      </div>
    </div>
  )
}

export default BlogCard
