import { useEffect, useState } from "react";

function AdminResults() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const storedCandidates =
      JSON.parse(localStorage.getItem(`candidates_${electionYear}`)) || [];
    const storedVotes =
      JSON.parse(localStorage.getItem(`votes_${electionYear}`)) || {};

    setCandidates(storedCandidates);
    setVotes(storedVotes);
  }, [electionYear]);

  // Group candidates by position (case-insensitive and trimmed)
  const grouped = candidates.reduce((acc, c) => {
    const positionKey = c.position.trim();
    if (!acc[positionKey]) acc[positionKey] = [];
    acc[positionKey].push(c);
    return acc;
  }, {});

  // Sort positions alphabetically
  const sortedPositions = Object.keys(grouped).sort();

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
          const positionCandidates = grouped[position];
          
          // Calculate winner for this position
          const winner = positionCandidates.reduce((max, c) => {
            const maxVotes = votes[max.id] || 0;
            const currentVotes = votes[c.id] || 0;
            return currentVotes > maxVotes ? c : max;
          }, positionCandidates[0]);

          const winnerVotes = votes[winner?.id] || 0;
          const totalVotes = positionCandidates.reduce((sum, c) => sum + (votes[c.id] || 0), 0);

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
                  {/* Winner Announcement - Like Senate Card */}
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
                          const candidateVotes = votes[candidate.id] || 0;
                          const votePercentage = totalVotes > 0 
                            ? Math.round((candidateVotes / totalVotes) * 100) 
                            : 0;
                          const isWinner = winner && winner.id === candidate.id;

                          return (
                            <tr key={candidate.id} className={isWinner ? "table-success" : ""}>
                              <td className="text-center fw-bold">{index + 1}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={candidate.image}
                                    alt={candidate.name}
                                    width="35"
                                    height="35"
                                    className="rounded-circle me-2"
                                    style={{ objectFit: "cover" }}
                                  />
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