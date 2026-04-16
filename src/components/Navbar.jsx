import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import logo from "../assets/logo.png";
import ElectionYearManager from "./ElectionYearManager";

function Navbar() {
  const navigate = useNavigate();
  const navRef = useRef();

  const isStudent = localStorage.getItem("studentAuth");
  const isAdmin = localStorage.getItem("adminAuth");

  const closeNavbar = () => {
    if (navRef.current?.classList.contains("show")) {
      navRef.current.classList.remove("show");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
    closeNavbar();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 sticky-top shadow">
      <div className="container">

        {/* ===== LOGO + SCHOOL NAME ===== */}
        {/* When logged in, clicking logo goes to dashboard instead of home */}
        {isStudent || isAdmin ? (
          <div
            className="navbar-brand d-flex align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (isStudent) navigate("/dashboard");
              if (isAdmin) navigate("/admin-dashboard");
              closeNavbar();
            }}
          >
            <img
              src={logo}
              alt="UAES Logo"
              width="100"
              height="100"
              className="me-2"
            />

            {/* MOBILE NAME */}
            <span className="fw-bold text-white d-block d-md-none">
              UAES UMUAGWO
            </span>

            {/* DESKTOP NAME */}
            <span className="fw-bold text-white d-none d-md-block">
              UNIVERSITY OF AGRICULTURE & <br />
              ENVIRONMENTAL SCIENCE UMUAGWO
            </span>
          </div>
        ) : (
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            onClick={closeNavbar}
          >
            <img
              src={logo}
              alt="UAES Logo"
              width="100"
              height="100"
              className="me-2"
            />

            {/* MOBILE NAME */}
            <span className="fw-bold text-white d-block d-md-none">
              UAES UMUAGWO
            </span>

            {/* DESKTOP NAME */}
            <span className="fw-bold text-white d-none d-md-block">
              UNIVERSITY OF AGRICULTURE & <br />
              ENVIRONMENTAL SCIENCE UMUAGWO
            </span>
          </Link>
        )}

        {/* ===== TOGGLER ===== */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ===== COLLAPSIBLE MENU ===== */}
        <div className="collapse navbar-collapse" id="navbarNav" ref={navRef}>
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {/* ===== HOME LINK - HIDDEN WHEN LOGGED IN ===== */}
            {!isStudent && !isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={closeNavbar}>
                  Home
                </Link>
              </li>
            )}

            {/* ===== RESULTS - ALWAYS VISIBLE ===== */}
            <li className="nav-item">
              <Link className="nav-link" to="/results" onClick={closeNavbar}>
                Results
              </Link>
            </li>

            {/* ===== GUIDELINES - ALWAYS VISIBLE ===== */}
            <li className="nav-item">
              <Link className="nav-link" to="/guidelines" onClick={closeNavbar}>
                Guidelines
              </Link>
            </li>

            {/* ===== ELECTION YEAR MANAGER - ONLY FOR ADMIN ===== */}
            {isAdmin && (
              <li className="nav-item ms-lg-2">
                <ElectionYearManager />
              </li>
            )}

            {/* ===== NOT LOGGED IN ===== */}
            {!isStudent && !isAdmin && (
              <>
                <li className="nav-item mt-2 mt-lg-0 ms-lg-3">
                  <Link
                    className="btn btn-success w-100"
                    to="/login"
                    onClick={closeNavbar}
                  >
                    Student Login
                  </Link>
                </li>

                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <Link
                    className="btn btn-outline-light w-100"
                    to="/admin-login"
                    onClick={closeNavbar}
                  >
                    Admin Login
                  </Link>
                </li>
              </>
            )}

            {/* ===== STUDENT LOGGED IN ===== */}
            {isStudent && (
              <>
                <li className="nav-item mt-2 mt-lg-0 ms-lg-3">
                  <Link
                    className="btn btn-success w-100"
                    to="/dashboard"
                    onClick={closeNavbar}
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <button
                    className="btn btn-danger w-100"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* ===== ADMIN LOGGED IN ===== */}
            {isAdmin && (
              <>
                <li className="nav-item mt-2 mt-lg-0 ms-lg-3">
                  <Link
                    className="btn btn-primary w-100"
                    to="/admin-dashboard"
                    onClick={closeNavbar}
                  >
                    Admin 
                  </Link>
                </li>

                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <button
                    className="btn btn-danger w-100"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;