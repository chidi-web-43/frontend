import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { getDashboard } from "../services/api";
import { initializeSocket, getSocket, disconnectSocket } from "../services/socket";

function Dashboard() {
  const navigate = useNavigate();

  // ================= AUTH DATA =================
  const token = localStorage.getItem("studentToken");
  const matricNumber = localStorage.getItem("matricNumber");
  const studentName = localStorage.getItem("studentName");

  // ================= ELECTION DATA =================
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // ================= LOAD DASHBOARD DATA FROM BACKEND =================
  const loadDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getDashboard(token, electionYear);
      setDashboardData(data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
      setLoading(false);
    }
  };

  // ================= REAL-TIME SOCKET.IO CONNECTION =================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Initialize Socket.IO connection
    const socket = initializeSocket(token, electionYear);
    
    if (socket) {
      socket.on('connect', () => {
        console.log('🔌 Socket.IO connected');
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Socket.IO disconnected');
        setIsConnected(false);
      });
      
      // Listen for vote updates
      socket.on('vote-updated', (data) => {
        console.log('📡 Real-time vote update received:', data);
        loadDashboardData(); // Refresh dashboard instantly
      });
      
      // Listen for election status changes
      socket.on('election-status-changed', (data) => {
        console.log('📡 Election status changed:', data);
        loadDashboardData(); // Refresh dashboard instantly
      });
    }
    
    // Initial data load
    loadDashboardData();
    
    // Fallback: Refresh data every 10 seconds (in case socket disconnects)
    const interval = setInterval(loadDashboardData, 10000);
    
    return () => {
      disconnectSocket();
      clearInterval(interval);
    };
  }, [electionYear, token]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("studentAuth");
    localStorage.removeItem("studentToken");
    localStorage.removeItem("matricNumber");
    localStorage.removeItem("studentName");
    disconnectSocket();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  const hasVoted = dashboardData?.student?.hasVoted || false;
  const votingStatus = dashboardData?.election?.status || "closed";
  const turnoutPercentage = dashboardData?.turnout?.percentage || 0;
  const votedCount = dashboardData?.turnout?.voted || 0;
  const totalStudents = dashboardData?.turnout?.total || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* ================= TOP BAR ================= */}
      <nav className="navbar navbar-dark bg-success px-4 sticky-top">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-speedometer2 me-2"></i>
          SUG Voting Dashboard – {electionYear}
        </span>
        <div className="d-flex align-items-center">
          {isConnected && (
            <span className="badge bg-success me-2">
              <i className="bi bi-wifi"></i> Live
            </span>
          )}
          <button onClick={handleLogout} className="btn btn-light btn-sm">
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </nav>

      <div className="container py-5">

        {/* ================= WELCOME ================= */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="fw-bold mb-1">Welcome, {studentName}</h4>
            <p className="text-muted">
              Matric Number: <strong>{matricNumber}</strong>
            </p>
          </div>
        </div>

        <div className="row">

          {/* ===== VOTING STATUS ===== */}
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100">
              <div className="card-body">
                <h5 className="fw-bold">Your Voting Status</h5>

                {hasVoted ? (
                  <>
                    <h5 className="text-success mt-3 fw-bold">
                      ✅ YOU HAVE VOTED
                    </h5>
                    <span className="badge bg-success mt-2">
                      VERIFIED
                    </span>
                  </>
                ) : (
                  <h5 className="text-danger mt-3 fw-bold">
                    ❌ NOT VOTED
                  </h5>
                )}

                <small className="text-muted d-block mt-2">
                  One student — one vote
                </small>
              </div>
            </div>
          </div>

          {/* ===== ELECTION INFO ===== */}
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100">
              <div className="card-body">
                <h5 className="fw-bold">Election Info</h5>
                <p className="mt-3 fw-semibold">
                  Year: {electionYear}
                </p>
                <p
                  className={`fw-bold ${
                    votingStatus === "open"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  Voting is {votingStatus.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* ===== LIVE TURNOUT ===== */}
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100">
              <div className="card-body">
                <h5 className="fw-bold">Live Turnout</h5>
                <h3 className="text-success mt-3">
                  {turnoutPercentage}%
                </h3>
                <p>
                  {votedCount} of {totalStudents} voted
                </p>
                <small className="text-muted">
                  <i className="bi bi-arrow-repeat me-1"></i> Real-time
                </small>
              </div>
            </div>
          </div>

          {/* ===== ACTION ===== */}
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100">
              <div className="card-body">
                <h5 className="fw-bold">Action</h5>

                <button
                  className={`btn w-100 mt-3 ${
                    hasVoted
                      ? "btn-secondary"
                      : votingStatus !== "open"
                      ? "btn-danger"
                      : "btn-success"
                  }`}
                  disabled={hasVoted || votingStatus !== "open"}
                  onClick={() => navigate("/vote")}
                >
                  {hasVoted
                    ? "✔ VOTE SUBMITTED"
                    : votingStatus !== "open"
                    ? "🚫 Voting Closed"
                    : "🗳️ Proceed to Vote"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ===== REAL-TIME INDICATOR ===== */}
        <div className="text-center mt-4">
          <small className="text-muted">
            {isConnected ? (
              <>
                <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: "8px" }}></i>
                Live updates active - Connected to real-time server
              </>
            ) : (
              <>
                <i className="bi bi-circle-fill text-warning me-1" style={{ fontSize: "8px" }}></i>
                Reconnecting... Data refreshes every 10 seconds
              </>
            )}
          </small>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;