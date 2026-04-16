import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidates, submitVote } from "../services/api";

function Vote() {
  const navigate = useNavigate();

  const token = localStorage.getItem("studentToken");
  const matricNumber = localStorage.getItem("matricNumber");
  const studentName = localStorage.getItem("studentName");

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000";

  /* ================= LOAD CANDIDATES FROM BACKEND ================= */
  const loadCandidates = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const data = await getCandidates(token, electionYear);
      setCandidates(data);
      
      // Get unique positions and sort them
      const uniquePositions = [...new Set(data.map(c => c.position.trim()))];
      setPositions(uniquePositions.sort());
      setLoading(false);
    } catch (err) {
      console.error("Error loading candidates:", err);
      setError("Failed to load candidates. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [electionYear]);

  /* ================= CHECK VOTING STATUS ================= */
  useEffect(() => {
    const votingStatus = localStorage.getItem(`votingStatus_${electionYear}`) || "closed";
    if (votingStatus !== "open") {
      alert("Voting is currently closed.");
      navigate("/dashboard");
    }
  }, [navigate, electionYear]);

  const handleSelect = (position, candidateId) => {
    // This ensures only ONE candidate per position is selected
    setSelectedVotes({ ...selectedVotes, [position]: candidateId });
  };

  /* ================= SUBMIT VOTES TO BACKEND WITH RECEIPT ================= */
  const handleSubmitVotes = async () => {
    // Check if ALL positions have been voted for
    if (Object.keys(selectedVotes).length !== positions.length) {
      alert(`⚠️ Please vote for ALL positions.\n\nYou have voted for ${Object.keys(selectedVotes).length} out of ${positions.length} positions.`);
      return;
    }

    setSubmitting(true);

    try {
      await submitVote(token, selectedVotes, electionYear);
      
      // ========== CREATE AND SAVE RECEIPT TO LOCALSTORAGE ==========
      const receiptData = {
        receiptId: `RCP-${electionYear}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        electionYear: electionYear,
        matricNumber: matricNumber,
        studentName: studentName,
        timestamp: new Date().toLocaleString(),
        votes: Object.entries(selectedVotes).map(([position, candidateId]) => {
          const candidate = candidates.find(c => c.id === candidateId);
          return {
            position: position,
            candidateName: candidate?.name || "Unknown",
            candidateId: candidateId
          };
        }),
        confirmed: true,
        status: "VERIFIED"
      };
      
      // Save receipt to localStorage
      localStorage.setItem(`receipt_${electionYear}_${matricNumber}`, JSON.stringify(receiptData));
      
      /* ================= NOTIFY DASHBOARD ================= */
      window.dispatchEvent(new Event("voteUpdated"));
      
      alert("✅ Vote submitted successfully!");
      
      // Redirect to receipt page
      navigate("/receipt");
      
    } catch (err) {
      console.error("Error submitting vote:", err);
      alert(err.message || "Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/130x130?text=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  // Calculate voting progress
  const votedCount = Object.keys(selectedVotes).length;
  const totalPositions = positions.length;
  const progressPercentage = totalPositions > 0 ? (votedCount / totalPositions) * 100 : 0;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={loadCandidates}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h4 className="fw-bold mb-2">
          SUG Voting – {electionYear}
        </h4>
        <p className="text-muted mb-2">
          {studentName} ({matricNumber})
        </p>
        <div className="alert alert-info d-inline-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          Select <strong>ONE candidate</strong> for each position
        </div>
      </div>

      {/* Progress Bar */}
      {totalPositions > 0 && (
        <div className="card shadow-sm mb-4 bg-light">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold">Voting Progress</span>
              <span className="fw-bold text-success">{votedCount} / {totalPositions} Positions</span>
            </div>
            <div className="progress" style={{ height: "10px" }}>
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Positions Cards */}
      <div className="row g-4">
        {positions.map((position) => {
          const positionCandidates = candidates.filter(c => c.position.trim() === position);
          
          return (
            <div className="col-12" key={position}>
              <div className="card shadow-sm border-0">
                {/* Card Header */}
                <div className="card-header bg-white py-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-primary">
                      {position}
                    </h5>
                    <span className="badge bg-secondary">
                      Select 1 of {positionCandidates.length}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Candidates Grid */}
                  <div className="row g-4">
                    {positionCandidates.map((candidate) => {
                      const isSelected = selectedVotes[position] === candidate.id;
                      
                      return (
                        <div className="col-md-6 col-lg-4" key={candidate.id}>
                          <div 
                            className={`card h-100 transition-all cursor-pointer ${
                              isSelected 
                                ? "border-success border-3 selected-card" 
                                : "border"
                            }`}
                            style={{ 
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onClick={() => handleSelect(position, candidate.id)}
                          >
                            {/* Image at the top - FIXED URL */}
                            <div className="text-center pt-4 px-3">
                              <img
                                src={getImageUrl(candidate.image)}
                                alt={candidate.name}
                                className="rounded-circle"
                                style={{ 
                                  width: "130px", 
                                  height: "130px", 
                                  objectFit: "cover",
                                  border: isSelected ? "3px solid #198754" : "3px solid #dee2e6",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/130x130?text=No+Image";
                                }}
                              />
                            </div>
                            
                            {/* Selection Indicator */}
                            <div className="position-absolute top-0 end-0 m-3">
                              {isSelected ? (
                                <div 
                                  className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                >
                                  <i className="bi bi-check-lg text-white" style={{ fontSize: "18px" }}></i>
                                </div>
                              ) : (
                                <div 
                                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                >
                                  <i className="bi bi-circle text-secondary"></i>
                                </div>
                              )}
                            </div>
                            
                            {/* Candidate Details */}
                            <div className="card-body text-center">
                              <h5 className="fw-bold mb-2">{candidate.name}</h5>
                              
                              <div className="mt-3">
                                <p className="mb-1 small text-muted">
                                  <i className="bi bi-building me-1"></i> {candidate.faculty}
                                </p>
                                <p className="mb-1 small text-muted">
                                  <i className="bi bi-book me-1"></i> {candidate.department}
                                </p>
                                <p className="mb-0 small text-muted">
                                  <i className="bi bi-mortarboard me-1"></i> Level: {candidate.level}
                                </p>
                              </div>
                            </div>
                            
                            {/* Vote Button */}
                            <div className="card-footer bg-white border-top-0 pb-4">
                              <button
                                className={`btn w-100 ${
                                  isSelected
                                    ? "btn-success"
                                    : "btn-outline-success"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelect(position, candidate.id);
                                }}
                                disabled={submitting}
                              >
                                {isSelected ? (
                                  <>
                                    <i className="bi bi-check-circle me-2"></i> Selected
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-2"></i> Vote
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button Section */}
      {totalPositions > 0 && (
        <div className="card shadow-sm mt-4 bg-success bg-opacity-10">
          <div className="card-body text-center">
            <h6 className="mb-3">Ready to Submit?</h6>
            <button
              className="btn btn-success btn-lg px-5"
              onClick={handleSubmitVotes}
              disabled={votedCount !== totalPositions || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check me-2"></i> Submit All Votes
                </>
              )}
            </button>
            {votedCount !== totalPositions && (
              <p className="small text-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-1"></i>
                You must vote for ALL {totalPositions} positions before submitting
              </p>
            )}
            {votedCount === totalPositions && !submitting && (
              <p className="small text-success mt-3 mb-0">
                <i className="bi bi-check-circle me-1"></i>
                You have voted for all {totalPositions} positions. Ready to submit!
              </p>
            )}
          </div>
        </div>
      )}

      {totalPositions === 0 && (
        <div className="alert alert-warning text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No candidates available for voting yet. Please check back later.
        </div>
      )}
    </div>
  );
}

export default Vote;