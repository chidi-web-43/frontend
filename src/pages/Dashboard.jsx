import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

function Dashboard() {
  const navigate = useNavigate();

  // ================= AUTH DATA =================
  const matricNumber = localStorage.getItem("matricNumber");
  const studentName = localStorage.getItem("studentName");

  // ================= ELECTION DATA =================
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [votingStatus, setVotingStatus] = useState(
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed"
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [votedCount, setVotedCount] = useState(0);

  // ================= LOAD ALL DATA =================
  const loadVotingData = () => {
    // Get latest voting status
    const currentStatus = localStorage.getItem(`votingStatus_${electionYear}`) || "closed";
    setVotingStatus(currentStatus);
    
    // Check this student
    const voted = localStorage.getItem(
      `voted_${electionYear}_${matricNumber}`
    );
    setHasVoted(voted === "true");

    // Turnout
    const students =
      JSON.parse(localStorage.getItem(`students_${electionYear}`)) || [];
    setTotalStudents(students.length);

    const votedStudents = students.filter(
      (student) =>
        localStorage.getItem(
          `voted_${electionYear}_${student.matric}`
        ) === "true"
    );
    setVotedCount(votedStudents.length);
  };

  // ================= ON PAGE LOAD WITH REAL-TIME UPDATES =================
  useEffect(() => {
    loadVotingData();
    
    // Set up real-time event listeners
    const handleVoteUpdate = () => loadVotingData();
    const handleDataUpdate = () => loadVotingData();
    
    window.addEventListener("voteUpdated", handleVoteUpdate);
    window.addEventListener("electionDataUpdated", handleDataUpdate);
    
    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(loadVotingData, 5000);
    
    return () => {
      window.removeEventListener("voteUpdated", handleVoteUpdate);
      window.removeEventListener("electionDataUpdated", handleDataUpdate);
      clearInterval(interval);
    };
  }, [electionYear, matricNumber]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("studentAuth");
    localStorage.removeItem("matricNumber");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  const turnoutPercentage =
    totalStudents === 0
      ? 0
      : Math.round((votedCount / totalStudents) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* ================= TOP BAR ================= */}
      <nav className="navbar navbar-dark bg-success px-4 sticky-top">
        <span className="navbar-brand fw-bold">
          SUG Voting Dashboard – {electionYear}
        </span>
        <button onClick={handleLogout} className="btn btn-light btn-sm">
          Logout
        </button>
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
                <small className="text-muted">Updates in real-time</small>
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
            <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: "8px" }}></i>
            Live updates active - Data refreshes automatically
          </small>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;