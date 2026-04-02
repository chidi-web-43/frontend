import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("adminAuth");

  return isAdmin === "true"
    ? children
    : <Navigate to="/admin-login" replace />;
}

export default AdminRoute;