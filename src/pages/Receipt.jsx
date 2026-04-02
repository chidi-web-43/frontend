import { useNavigate } from "react-router-dom";

function Receipt() {
  const navigate = useNavigate();

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const matricNumber = localStorage.getItem("matricNumber");

  const receipt = JSON.parse(
    localStorage.getItem(`receipt_${electionYear}_${matricNumber}`)
  );

  if (!receipt) {
    return <p className="text-center mt-5">No receipt found.</p>;
  }

  return (
    <div className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h4 className="fw-bold mb-3">Voting Receipt</h4>

          <p><strong>Election Year:</strong> {receipt.electionYear}</p>
          <p><strong>Matric Number:</strong> {receipt.matricNumber}</p>
          <p><strong>Candidate ID:</strong> {receipt.candidateId}</p>
          <p><strong>Time:</strong> {receipt.time}</p>

          <button
            className="btn btn-success mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receipt;