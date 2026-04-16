import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Direct fetch to backend
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and auth state
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminToken", data.token);
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "#eef2f6" }}>
      <div className="card shadow-lg border-0" style={{ width: "460px" }}>

        {/* HEADER */}
        <div className="card-header bg-primary text-white text-center py-4">
          <img src={logo} alt="UAES Logo" width="80" className="mb-2" />
          <h5 className="fw-bold mb-0">University of Agriculture & Environmental Science</h5>
          <small className="opacity-75">SUG Electoral Management System</small>
        </div>

        {/* BODY */}
        <div className="card-body p-4">
          <h4 className="text-center fw-bold mb-2">Administrator Login</h4>
          <p className="text-center text-muted mb-4">Authorized access only</p>

          {error && <div className="alert alert-danger text-center py-2">{error}</div>}

          <form onSubmit={handleLogin}>

            {/* USERNAME */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Admin Username</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* PASSWORD WITH EYE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Admin Password</label>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password required"
                  disabled={loading}
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold" disabled={loading}>
              {loading ? "Logging in..." : "Login to Admin"}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="card-footer text-center bg-light small text-muted">
          © {new Date().getFullYear()} UAES SUG Electoral System
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;