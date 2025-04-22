import { Link } from "react-router-dom"
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

  return (
    <div className="blog-card">
      <div className="blog-card-header">
        <span className={`blog-category blog-category-${post.category}`}>{getCategoryName(post.category)}</span>
        <span className="blog-date">{formatDate(post.publishedAt)}</span>
      </div>

      {post.featuredImage && (
        <div className="blog-image-container">
          <img src={post.featuredImage || "/placeholder.svg"} alt={post.title} className="blog-featured-image" />
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
