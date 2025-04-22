import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Smart-Kebele</h3>
          <p className="footer-description">
            A platform for citizens to interact with local government services, focusing on anti-corruption and
            complaint handling.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/documents">Documents</a>
            </li>
            <li>
              <a href="/alerts">Safety Alerts</a>
            </li>
            <li>
              <a href="/offices">Office Availability</a>
            </li>
            <li>
              <a href="/complaint">Report Complaint</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Contact</h3>
          <p>Email: info@smart-kebele.gov.et</p>
          <p>Phone: +251 11 123 4567</p>
          <p>Address: Addis Ababa, Ethiopia</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Smart-Kebele. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

