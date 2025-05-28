"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import BlogCard from "../components/BlogCard"
import { API_URL } from "../config"
import "./BlogList.css"

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isKentibaBiro, setIsKentibaBiro] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let url = `${API_URL}/api/blog?page=${currentPage}`

      if (filter !== "all") {
        url += `&category=${filter}`
      }

      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(url, { headers })
      const data = await response.json()

      if (response.ok) {
        setPosts(data.blogPosts)
        setTotalPages(data.pagination.pages)
      } else {
        setError(data.message || "Failed to fetch blog posts")
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }, [filter, currentPage])

  useEffect(() => {
    // Check if user is Kentiba Biro
    const token = localStorage.getItem("token")
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user && data.user.role === "kentiba_biro") {
            setIsKentibaBiro(true)
          }
        })
        .catch((err) => console.error("Error checking user role:", err))
    }

    // Fetch blog posts
    fetchPosts()
  }, [fetchPosts])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h1 className="blog-list-title">Smart-Kebele Blog</h1>
        <p className="blog-list-description">
          Stay updated with the latest news, announcements, and success stories from Smart-Kebele.
        </p>
      </div>

      <div className="blog-list-actions">
        <div className="blog-filter">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select id="category-filter" value={filter} onChange={handleFilterChange} className="blog-filter-select">
            <option value="all">All Categories</option>
            <option value="announcement">Announcements</option>
            <option value="news">News</option>
            <option value="guide">Guides</option>
            <option value="success_story">Success Stories</option>
            <option value="other">Other</option>
          </select>
        </div>

        {isKentibaBiro && (
          <Link to="/blog/create" className="blog-create-button">
            Create New Post
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="blog-loading">Loading blog posts...</div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <p>No blog posts found.</p>
          {isKentibaBiro && (
            <Link to="/blog/create" className="blog-create-button">
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {posts.map((post) => (
              <div key={post._id} className="blog-grid-item">
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="blog-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-page ${currentPage === page ? "active" : ""}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BlogList
