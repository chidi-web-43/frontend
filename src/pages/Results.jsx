import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { getPublicResults } from "../services/api";
import { initializeSocket, getSocket, disconnectSocket } from "../services/socket";

function Results() {
  const electionYear =
    localStorage.getItem("electionYear") || new Date().getFullYear().toString();

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const API_BASE_URL = "http://localhost:5000";

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  // ================= LOAD DATA FROM BACKEND =================
  const loadResults = async () => {
    try {
      const data = await getPublicResults(electionYear);
      setResults(data);
      setError("");
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error loading results:", err);
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= REAL-TIME SOCKET.IO CONNECTION =================
  useEffect(() => {
    // Initial load
    loadResults();
    
    // Initialize Socket.IO connection for real-time updates
    const socket = initializeSocket(null, electionYear);
    
    if (socket) {
      socket.on('connect', () => {
        console.log('🔌 Results: Socket.IO connected');
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Results: Socket.IO disconnected');
        setIsConnected(false);
      });
      
      // Listen for vote updates - refresh results instantly
      socket.on('vote-updated', (data) => {
        console.log('📡 Results: Real-time vote update received', data);
        loadResults(); // Refresh results instantly
      });
      
      // Listen for election status changes
      socket.on('election-status-changed', (data) => {
        console.log('📡 Results: Election status changed', data);
        loadResults(); // Refresh results instantly
      });
    }
    
    // Fallback: Refresh every 10 seconds (in case socket disconnects)
    const interval = setInterval(() => {
      loadResults();
    }, 10000);
    
    return () => {
      disconnectSocket();
      clearInterval(interval);
    };
  }, [electionYear]);

  // Flatten candidates from grouped results
  const getAllCandidates = () => {
    const allCandidates = [];
    const groupedResults = results.results || {};
    
    Object.keys(groupedResults).forEach(position => {
      groupedResults[position].forEach(candidate => {
        allCandidates.push({
          ...candidate,
          position: position
        });
      });
    });
    
    return allCandidates;
  };

  const candidates = getAllCandidates();

  if (loading && candidates.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
        <nav className="navbar navbar-dark bg-dark px-4">
          <span className="navbar-brand fw-bold">
            Election Results – {electionYear}
          </span>
        </nav>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading election results...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
        <nav className="navbar navbar-dark bg-dark px-4">
          <span className="navbar-brand fw-bold">
            Election Results – {electionYear}
          </span>
        </nav>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
          <div className="text-center">
            <button className="btn btn-primary" onClick={loadResults}>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* ================= NAV ================= */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-bar-chart-steps me-2"></i>
          Election Results – {electionYear}
        </span>
        <div className="d-flex align-items-center">
          {isConnected && (
            <span className="badge bg-success me-2">
              <i className="bi bi-wifi"></i> Live
            </span>
          )}
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={loadResults}
            title="Refresh results"
          >
            <i className="bi bi-arrow-repeat"></i> Refresh
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">Official Results</h4>
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </small>
            </div>
            <p className="text-muted small mb-3">
              {isConnected ? (
                <span className="text-success">
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: "8px" }}></i>
                  Live updates active - Results update instantly when votes are cast
                </span>
              ) : (
                <span className="text-warning">
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: "8px" }}></i>
                  Reconnecting... Results refresh every 10 seconds
                </span>
              )}
            </p>

            {candidates.length === 0 ? (
              <p className="text-danger text-center">
                No election data available. Please check back later.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Candidate Name</th>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th>Level</th>
                      <th>Position</th>
                      <th>Total Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => (
                      <tr key={candidate.id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="text-start">
                          <div className="d-flex align-items-center">
                            {candidate.image && (
                              <img
                                src={getImageUrl(candidate.image)}
                                alt={candidate.name}
                                width="35"
                                height="35"
                                className="rounded-circle me-2"
                                style={{ objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/35x35?text=No+Image";
                                }}
                              />
                            )}
                            {candidate.name}
                          </div>
                        </td>
                        <td>{candidate.faculty || "N/A"}</td>
                        <td>{candidate.department || "N/A"}</td>
                        <td>{candidate.level || "N/A"}</td>
                        <td>
                          <span className="badge bg-secondary">{candidate.position}</span>
                        </td>
                        <td className="fw-bold text-success fs-5">
                          {candidate.votes || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="6" className="text-end fw-bold">Total Votes Cast:</td>
                      <td className="fw-bold">
                        {candidates.reduce((sum, c) => sum + (c.votes || 0), 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="alert alert-secondary mt-4 text-center">
          <i className="bi bi-graph-up me-2"></i>
          📌 Results displayed are automatically computed from submitted votes.
          {isConnected ? " Updates appear instantly!" : " Page refreshes every 10 seconds."}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Results;