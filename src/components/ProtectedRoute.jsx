import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, type }) {
  const isStudent = localStorage.getItem("studentAuth");
  const isAdmin = localStorage.getItem("adminAuth");

  if (type === "student" && !isStudent) return <Navigate to="/login" />;
  if (type === "admin" && !isAdmin) return <Navigate to="/admin-login" />;

  return children;
}

// New component to prevent logged-in users from accessing public pages
export function PublicRoute({ children }) {
  const isStudent = localStorage.getItem("studentAuth");
  const isAdmin = localStorage.getItem("adminAuth");

  // If user is logged in, redirect them to their dashboard
  if (isStudent) return <Navigate to="/dashboard" replace />;
  if (isAdmin) return <Navigate to="/admin-dashboard" replace />;

  return children;
}

export default ProtectedRoute;