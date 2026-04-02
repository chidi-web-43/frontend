import { useEffect, useState } from "react";
import Footer from "../components/Footer";

function Results() {
  const electionYear =
    localStorage.getItem("electionYear") || new Date().getFullYear().toString();

  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});

  // ================= LOAD DATA =================
  useEffect(() => {
    const storedCandidates =
      JSON.parse(localStorage.getItem(`candidates_${electionYear}`)) || [];

    const storedVotes =
      JSON.parse(localStorage.getItem(`votes_${electionYear}`)) || {};

    setCandidates(storedCandidates);
    setVotes(storedVotes);
  }, [electionYear]);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* ================= NAV ================= */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">
          Election Results – {electionYear}
        </span>
      </nav>

      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-3">Official Results</h4>

            {candidates.length === 0 ? (
              <p className="text-danger text-center">
                No election data available.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Candidate Name</th>
                      <th>Position</th>
                      <th>Total Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => (
                      <tr key={candidate.id}>
                        <td>{index + 1}</td>
                        <td>{candidate.name}</td>
                        <td>{candidate.position}</td>
                        <td className="fw-bold">
                          {votes[candidate.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="alert alert-secondary mt-4 text-center">
          📌 Results displayed are automatically computed from submitted votes.
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Results;