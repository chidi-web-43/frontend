import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("All fields are required.");
      return;
    }

    if (!strongPassword.test(password)) {
      setError("Password must be strong.");
      return;
    }

    if (username === "admin" && password === "Admin@123") {
      localStorage.setItem("adminAuth", "true");
      navigate("/admin-dashboard");
    } else {
      setError("Invalid administrator credentials.");
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

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold">
              Login to Admin
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