import { useEffect, useState } from "react";
import { getPublicResults } from "../services/api";

function AdminResults() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    loadResults();
  }, [electionYear]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await getPublicResults(electionYear);
      setResults(data);
      setError("");
    } catch (err) {
      console.error("Error loading results:", err);
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const grouped = results.results || {};
  const sortedPositions = Object.keys(grouped).sort();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          Election Results – {electionYear}
        </h3>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-2"></i> Print Results
        </button>
      </div>

      {sortedPositions.length === 0 && (
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No results available. Please add candidates first.
        </div>
      )}

      <div className="row g-4">
        {sortedPositions.map((position) => {
          const positionCandidates = grouped[position] || [];
          
          // Calculate winner for this position
          const winner = positionCandidates.length > 0 ? positionCandidates.reduce((max, c) => {
            return (c.votes || 0) > (max.votes || 0) ? c : max;
          }, positionCandidates[0]) : null;

          const winnerVotes = winner?.votes || 0;
          const totalVotes = positionCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);

          return (
            <div className="col-12" key={position}>
              <div className="card shadow-sm border-0">
                {/* Card Header */}
                <div className="card-header bg-white py-3 border-bottom">
                  <h5 className="fw-bold mb-0 text-primary">
                    {position}
                    <span className="badge bg-secondary ms-2">
                      {positionCandidates.length} Candidate{positionCandidates.length !== 1 ? 's' : ''}
                    </span>
                  </h5>
                </div>

                <div className="card-body p-0">
                  {/* Winner Announcement */}
                  {winner && (
                    <div className="bg-success bg-opacity-10 p-3 border-bottom">
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                          <i className="bi bi-trophy-fill text-white fs-5"></i>
                        </div>
                        <div>
                          <span className="badge bg-success mb-1">WINNER</span>
                          <h6 className="fw-bold mb-0">{winner.name}</h6>
                          <p className="mb-0 text-muted small">
                            {winnerVotes} vote{winnerVotes !== 1 ? 's' : ''}
                            {totalVotes > 0 && ` (${Math.round((winnerVotes / totalVotes) * 100)}% of votes)`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Table */}
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "60px" }} className="text-center">#</th>
                          <th>Candidate</th>
                          <th>Faculty</th>
                          <th>Department</th>
                          <th>Level</th>
                          <th style={{ width: "100px" }} className="text-center">Votes</th>
                          <th style={{ width: "100px" }} className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positionCandidates.map((candidate, index) => {
                          const candidateVotes = candidate.votes || 0;
                          const votePercentage = totalVotes > 0 
                            ? Math.round((candidateVotes / totalVotes) * 100) 
                            : 0;
                          const isWinner = winner && winner.id === candidate.id;

                          return (
                            <tr key={candidate.id} className={isWinner ? "table-success" : ""}>
                              <td className="text-center fw-bold">{index + 1}</td>
                              <td>
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
                                  <span className="fw-medium">{candidate.name}</span>
                                </div>
                              </td>
                              <td>{candidate.faculty || "N/A"}</td>
                              <td>{candidate.department || "N/A"}</td>
                              <td>{candidate.level || "N/A"}</td>
                              <td className="text-center">
                                <span className="fw-bold">{candidateVotes}</span>
                                {totalVotes > 0 && (
                                  <small className="text-muted d-block">
                                    ({votePercentage}%)
                                  </small>
                                )}
                              </td>
                              <td className="text-center">
                                {isWinner ? (
                                  <span className="badge bg-success px-3 py-2">
                                    <i className="bi bi-trophy me-1"></i> WINNER
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary px-3 py-2">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="5" className="text-end fw-bold">Total Votes:</td>
                          <td className="text-center fw-bold">{totalVotes}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedPositions.length > 0 && (
        <div className="alert alert-secondary mt-4 text-center">
          <i className="bi bi-info-circle me-2"></i>
          Results are automatically computed from submitted votes.
        </div>
      )}
    </div>
  );
}

export default AdminResults;