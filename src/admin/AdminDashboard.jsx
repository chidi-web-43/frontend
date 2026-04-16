import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { getAdminDashboard, controlVoting } from "../services/api";
import { initializeSocket, getSocket, disconnectSocket } from "../services/socket";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const electionYear = localStorage.getItem("electionYear") || new Date().getFullYear().toString();

  const [votingStatus, setVotingStatus] = useState("closed");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCandidates: 0,
    totalVotes: 0,
    turnoutPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  /* ================= LOAD DASHBOARD DATA FROM BACKEND ================= */
  const loadDashboardData = async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    
    try {
      const data = await getAdminDashboard(token, electionYear);
      const status = data.electionStatus;
      setVotingStatus(status);
      // SAVE TO LOCALSTORAGE FOR OTHER PAGES TO READ
      localStorage.setItem(`votingStatus_${electionYear}`, status);
      setStats(data.stats);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  /* ================= REAL-TIME SOCKET.IO CONNECTION ================= */
  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    
    // Initial load
    loadDashboardData();
    
    // Initialize Socket.IO connection for real-time updates
    const socket = initializeSocket(token, electionYear);
    
    if (socket) {
      socket.on('connect', () => {
        console.log('🔌 Admin: Socket.IO connected');
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Admin: Socket.IO disconnected');
        setIsConnected(false);
      });
      
      // Listen for vote updates - refresh dashboard instantly
      socket.on('vote-updated', (data) => {
        console.log('📡 Admin: Real-time vote update received', data);
        loadDashboardData(); // Refresh dashboard instantly
      });
      
      // Listen for election status changes
      socket.on('election-status-changed', (data) => {
        console.log('📡 Admin: Election status changed', data);
        loadDashboardData(); // Refresh dashboard instantly
      });
    }
    
    // Fallback: Refresh every 10 seconds (in case socket disconnects)
    const interval = setInterval(loadDashboardData, 10000);
    
    return () => {
      disconnectSocket();
      clearInterval(interval);
    };
  }, [electionYear, token]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminToken");
    disconnectSocket();
    navigate("/admin-login");
  };

  /* ================= VOTING CONTROL ================= */
  const startVoting = async () => {
    try {
      await controlVoting(token, electionYear, "open");
      setVotingStatus("open");
      // SAVE TO LOCALSTORAGE FOR OTHER PAGES
      localStorage.setItem(`votingStatus_${electionYear}`, "open");
      alert("✅ Voting has started");
      // Refresh dashboard to update stats
      loadDashboardData();
    } catch (error) {
      alert("Error starting voting: " + error.message);
    }
  };

  const endVoting = async () => {
    try {
      await controlVoting(token, electionYear, "closed");
      setVotingStatus("closed");
      // SAVE TO LOCALSTORAGE FOR OTHER PAGES
      localStorage.setItem(`votingStatus_${electionYear}`, "closed");
      alert("❌ Voting has ended");
      // Refresh dashboard to update stats
      loadDashboardData();
    } catch (error) {
      alert("Error ending voting: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-dark bg-primary px-4 sticky-top">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-speedometer2 me-2"></i>
          SUG Admin Dashboard – {electionYear}
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-1">Welcome, Administrator</h4>
                <p className="text-muted mb-0">
                  Manage all election processes for the {electionYear} academic session.
                </p>
              </div>
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </small>
            </div>
          </div>
        </div>

        {/* ================= REAL-TIME STATUS INDICATOR ================= */}
        <div className="mb-3 text-end">
          {isConnected ? (
            <span className="badge bg-success">
              <i className="bi bi-circle-fill me-1" style={{ fontSize: "8px" }}></i>
              Live Connection Active
            </span>
          ) : (
            <span className="badge bg-warning">
              <i className="bi bi-circle-fill me-1" style={{ fontSize: "8px" }}></i>
              Reconnecting...
            </span>
          )}
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h3 className="fw-bold text-primary">{stats.totalStudents || 0}</h3>
              <p className="text-muted">Total Students</p>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h3 className="fw-bold text-primary">{stats.totalCandidates || 0}</h3>
              <p className="text-muted">Total Candidates</p>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h3 className="fw-bold text-primary">{stats.totalVotes || 0}</h3>
              <p className="text-muted">Total Votes Cast</p>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h3 className="fw-bold text-primary">{stats.turnoutPercentage || 0}%</h3>
              <p className="text-muted">Voter Turnout</p>
            </div>
          </div>
        </div>

        {/* ================= VOTING STATUS WARNING ================= */}
        {votingStatus === "open" && (
          <div className="alert alert-warning text-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            ⚠️ VOTING IS IN PROGRESS - Student upload and candidate management are LOCKED
          </div>
        )}

        {/* ================= ACTION CARDS ================= */}
        <div className="row">
          {/* UPLOAD STUDENTS */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h5 className="fw-bold">Upload Students</h5>
              <p className="text-muted">
                Register eligible voters for this election.
              </p>
              <button
                className="btn btn-primary w-100"
                onClick={() => navigate("/upload-student")}
              >
                Upload Students
              </button>
              {votingStatus === "open" && (
                <small className="text-danger d-block mt-2">
                  <i className="bi bi-lock-fill me-1"></i> Locked while voting
                </small>
              )}
            </div>
          </div>

          {/* MANAGE CANDIDATES */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h5 className="fw-bold">Manage Candidates</h5>
              <p className="text-muted">
                Add, edit, or remove election candidates.
              </p>
              <button
                className="btn btn-primary w-100"
                onClick={() => navigate("/admin/manage-candidates")}
              >
                Manage Candidates
              </button>
              {votingStatus === "open" && (
                <small className="text-danger d-block mt-2">
                  <i className="bi bi-lock-fill me-1"></i> Locked while voting
                </small>
              )}
            </div>
          </div>

          {/* RESULTS */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h5 className="fw-bold">Election Results</h5>
              <p className="text-muted">
                Monitor votes and declare winners.
              </p>
              <button
                className="btn btn-dark w-100"
                onClick={() => navigate("/admin/results")}
              >
                View Results
              </button>
            </div>
          </div>

          {/* AUDIT LOGS CARD */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm text-center h-100 p-3">
              <h5 className="fw-bold">Audit Logs</h5>
              <p className="text-muted">
                View all admin activities and changes.
              </p>
              <button
                className="btn btn-info w-100 text-white"
                onClick={() => navigate("/admin/audit-logs")}
              >
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* ================= VOTING CONTROL ================= */}
        <div className="card shadow-sm mt-4">
          <div className="card-body text-center">
            <h5 className="fw-bold mb-3">Voting Control Panel</h5>

            <p className="fw-semibold mb-3">
              Current Status:
              <span
                className={`ms-2 ${votingStatus === "open"
                    ? "text-success"
                    : "text-danger"
                  }`}
              >
                {votingStatus.toUpperCase()}
              </span>
            </p>

            <button
              className="btn btn-success me-3"
              disabled={votingStatus === "open"}
              onClick={startVoting}
            >
              <i className="bi bi-play-fill me-1"></i> Start Voting
            </button>

            <button
              className="btn btn-danger"
              disabled={votingStatus === "closed"}
              onClick={endVoting}
            >
              <i className="bi bi-stop-fill me-1"></i> End Voting
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;