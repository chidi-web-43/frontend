import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";

/* PAGES */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Receipt from "./pages/Receipt";
import Guidelines from "./pages/Guidelines";

/* ADMIN */
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import UploadStudent from "./admin/UploadStudent";
import ManageCandidates from "./admin/ManageCandidates";
import AdminResults from "./admin/AdminResults";
import AuditLogs from "./admin/AuditLogs";

/* ROUTE GUARDS */
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  // Set up real-time event listeners for data changes across tabs
  useEffect(() => {
    // Listen for storage changes (when localStorage is updated from another tab)
    const handleStorageChange = (e) => {
      if (e.key?.includes("votingStatus_") || 
          e.key?.includes("votes_") || 
          e.key?.includes("candidates_") ||
          e.key?.includes("students_")) {
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event("electionDataUpdated"));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC PAGES - Redirect if logged in ================= */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/admin-login" 
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } 
        />

        {/* ================= RESULTS - Always accessible ================= */}
        <Route path="/results" element={<Results />} />
        <Route path="/guidelines" element={<Guidelines />} />

        {/* ================= STUDENT PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute type="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vote"
          element={
            <ProtectedRoute type="student">
              <Vote />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipt"
          element={
            <ProtectedRoute type="student">
              <Receipt />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN PROTECTED ROUTES ================= */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/upload-student"
          element={
            <AdminRoute>
              <UploadStudent />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/manage-candidates"
          element={
            <AdminRoute>
              <ManageCandidates />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <AdminResults />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AuditLogs />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;