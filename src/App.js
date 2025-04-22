import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./routes/Home"
import Login from "./routes/Login"
import Register from "./routes/Register"
import AdminRegister from "./routes/AdminRegister"
import StakeholderRegister from "./routes/StakeholderRegister"
import StakeholderApproval from "./routes/StakeholderApproval"
import ComplaintForm from "./routes/ComplaintForm"
import CitizenComplaints from "./routes/CitizenComplaints"
import ComplaintDetail from "./routes/ComplaintDetail"
import AdminDashboard from "./routes/AdminDashboard"
import AdminResponseForm from "./routes/AdminResponseForm"
import DocumentGuidance from "./routes/DocumentGuidance"
import SafetyAlerts from "./routes/SafetyAlerts"
import OfficeAvailability from "./routes/OfficeAvailability"
import NotFound from "./routes/NotFound"
import PrivateRoute from "./components/PrivateRoute"
import ForgotPassword from "./routes/ForgotPassword"
import AdminApproval from "./routes/AdminApproval"
import AdminStatistics from "./routes/AdminStatistics"
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
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/stakeholder-register" element={<StakeholderRegister />} />
              <Route
                path="/admin/stakeholders"
                element={
                  <PrivateRoute allowedRoles={["kentiba_biro"]}>
                    <StakeholderApproval />
                  </PrivateRoute>
                }
              />
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
                path="/complaint-detail/:id"
                element={
                  <PrivateRoute>
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
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
              <Route path="/documents" element={<DocumentGuidance />} />
              <Route path="/alerts" element={<SafetyAlerts />} />
              <Route path="/offices" element={<OfficeAvailability />} />
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

