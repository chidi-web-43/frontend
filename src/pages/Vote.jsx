import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Vote() {
  const navigate = useNavigate();

  const matricNumber = localStorage.getItem("matricNumber");
  const studentName = localStorage.getItem("studentName");

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const votingStatus =
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed";

  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});

  /* ================= LOAD CANDIDATES ================= */
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem(`candidates_${electionYear}`)) || [];

    setCandidates(stored);

    // Get unique positions and sort them
    const uniquePositions = [...new Set(stored.map(c => c.position.trim()))];
    setPositions(uniquePositions.sort());
  }, [electionYear]);

  /* ================= CHECK ELIGIBILITY ================= */
  useEffect(() => {
    const students =
      JSON.parse(localStorage.getItem(`students_${electionYear}`)) || [];

    const student = students.find(s => s.matric === matricNumber);

    if (!student) {
      alert("❌ You are not eligible to vote.");
      navigate("/dashboard");
      return;
    }

    if (student.hasVoted) {
      alert("❌ You have already voted.");
      navigate("/dashboard");
    }
  }, [electionYear, matricNumber, navigate]);

  /* ================= CHECK VOTING STATUS ================= */
  useEffect(() => {
    if (votingStatus !== "open") {
      alert("Voting is currently closed.");
      navigate("/dashboard");
    }
  }, [navigate, votingStatus]);

  const handleSelect = (position, candidateId) => {
    // This ensures only ONE candidate per position is selected
    setSelectedVotes({ ...selectedVotes, [position]: candidateId });
  };

  /* ================= SUBMIT VOTES ================= */
  const handleSubmitVotes = () => {
    // Check if ALL positions have been voted for
    if (Object.keys(selectedVotes).length !== positions.length) {
      alert(`⚠️ Please vote for ALL positions.\n\nYou have voted for ${Object.keys(selectedVotes).length} out of ${positions.length} positions.`);
      return;
    }

    /* ================= SAVE VOTES ================= */
    const votesKey = `votes_${electionYear}`;
    const votes = JSON.parse(localStorage.getItem(votesKey)) || {};

    Object.values(selectedVotes).forEach(id => {
      votes[id] = (votes[id] || 0) + 1;
    });

    localStorage.setItem(votesKey, JSON.stringify(votes));

    /* ================= MARK STUDENT AS VOTED ================= */
    localStorage.setItem(
      `voted_${electionYear}_${matricNumber}`,
      "true"
    );

    /* ================= UPDATE STUDENT RECORD ================= */
    const studentsKey = `students_${electionYear}`;
    const students =
      JSON.parse(localStorage.getItem(studentsKey)) || [];

    const updatedStudents = students.map(s => {
      if (s.matric === matricNumber) {
        return {
          ...s,
          hasVoted: true,
          otp: null,
          otpExpiry: null,
        };
      }
      return s;
    });

    localStorage.setItem(
      studentsKey,
      JSON.stringify(updatedStudents)
    );

    /* ================= SAVE RECEIPT ================= */
    const receipt = {
      electionYear,
      matricNumber,
      votes: selectedVotes,
      time: new Date().toLocaleString(),
    };

    localStorage.setItem(
      `receipt_${electionYear}_${matricNumber}`,
      JSON.stringify(receipt)
    );

    /* ================= NOTIFY DASHBOARD ================= */
    window.dispatchEvent(new Event("voteUpdated"));

    alert("✅ Vote submitted successfully!");

    navigate("/dashboard");
  };

  // Calculate voting progress
  const votedCount = Object.keys(selectedVotes).length;
  const totalPositions = positions.length;
  const progressPercentage = totalPositions > 0 ? (votedCount / totalPositions) * 100 : 0;

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

      {/* Positions Cards - Like AdminResults */}
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
                            {/* Image at the top */}
                            <div className="text-center pt-4 px-3">
                              <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="rounded-circle"
                                style={{ 
                                  width: "130px", 
                                  height: "130px", 
                                  objectFit: "cover",
                                  border: isSelected ? "3px solid #198754" : "3px solid #dee2e6",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
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
              disabled={votedCount !== totalPositions}
            >
              <i className="bi bi-send-check me-2"></i> Submit All Votes
            </button>
            {votedCount !== totalPositions && (
              <p className="small text-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-1"></i>
                You must vote for ALL {totalPositions} positions before submitting
              </p>
            )}
            {votedCount === totalPositions && (
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