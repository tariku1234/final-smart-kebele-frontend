import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./routes/Home"
import Login from "./routes/Login"
import Register from "./routes/Register"
import ForgotPassword from "./routes/ForgotPassword"
import DocumentGuidance from "./routes/DocumentGuidance"
import AdminDocumentGuidance from "./routes/AdminDocumentGuidance"
import NotFound from "./routes/NotFound"
import PrivateRoute from "./components/PrivateRoute"
import ComplaintForm from "./routes/ComplaintForm"
import CitizenComplaints from "./routes/CitizenComplaints"
import ComplaintDetail from "./routes/ComplaintDetail"
import AdminDashboard from "./routes/AdminDashboard"
import AdminResponseForm from "./routes/AdminResponseForm"
import StakeholderRegister from "./routes/StakeholderRegister"
import AdminRegister from "./routes/AdminRegister"
import StakeholderApproval from "./routes/StakeholderApproval"
import AdminApproval from "./routes/AdminApproval"
import AdminStatistics from "./routes/AdminStatistics"
import BlogList from "./routes/BlogList"
import BlogDetail from "./routes/BlogDetail"
import BlogCreate from "./routes/BlogCreate"
import BlogEdit from "./routes/BlogEdit"
import OfficeAvailability from "./routes/OfficeAvailability"
import AdminOffices from "./routes/AdminOffices"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/documents" element={<DocumentGuidance />} />
              <Route path="/stakeholder-register" element={<StakeholderRegister />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/offices" element={<OfficeAvailability />} />

              {/* Protected Routes */}
              <Route
                path="/complaint"
                element={
                  <PrivateRoute allowedRoles={["citizen"]}>
                    <ComplaintForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/citizen-complaints"
                element={
                  <PrivateRoute allowedRoles={["citizen"]}>
                    <CitizenComplaints />
                  </PrivateRoute>
                }
              />
              <Route
                path="/complaint/:id"
                element={
                  <PrivateRoute
                    allowedRoles={[
                      "citizen",
                      "stakeholder_office",
                      "wereda_anti_corruption",
                      "kifleketema_anti_corruption",
                      "kentiba_biro",
                    ]}
                  >
                    <ComplaintDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute
                    allowedRoles={[
                      "stakeholder_office",
                      "wereda_anti_corruption",
                      "kifleketema_anti_corruption",
                      "kentiba_biro",
                    ]}
                  >
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/response/:id"
                element={
                  <PrivateRoute
                    allowedRoles={[
                      "stakeholder_office",
                      "wereda_anti_corruption",
                      "kifleketema_anti_corruption",
                      "kentiba_biro",
                    ]}
                  >
                    <AdminResponseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/stakeholders"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <StakeholderApproval />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/approve-admins"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <AdminApproval />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/statistics"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <AdminStatistics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/documents"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <AdminDocumentGuidance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/blog/create"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <BlogCreate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/blog/edit/:id"
                element={
                  <PrivateRoute
                    allowedRoles={["wereda_anti_corruption", "kifleketema_anti_corruption", "kentiba_biro"]}
                  >
                    <BlogEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/offices"
                element={
                  <PrivateRoute allowedRoles={["wereda_anti_corruption"]}>
                    <AdminOffices />
                  </PrivateRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
