import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

function Receipt() {
  const navigate = useNavigate();
  const electionYear = localStorage.getItem("electionYear") || new Date().getFullYear().toString();
  const matricNumber = localStorage.getItem("matricNumber");
  const studentName = localStorage.getItem("studentName");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load receipt from localStorage
    const storedReceipt = localStorage.getItem(`receipt_${electionYear}_${matricNumber}`);
    if (storedReceipt) {
      setReceipt(JSON.parse(storedReceipt));
    }
    setLoading(false);
  }, [electionYear, matricNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voting Receipt - ${matricNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 2px solid #28a745; border-radius: 10px; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #28a745; margin: 0; }
          .receipt-id { background: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #28a745; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .votes-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .votes-table th, .votes-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .votes-table th { background: #f4f4f4; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .confirmed { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>🗳️ SUG VOTING RECEIPT</h1>
            <p>University of Agriculture & Environmental Sciences</p>
          </div>
          
          <div class="receipt-id">
            <strong>Receipt ID:</strong> ${receipt?.receiptId || 'N/A'}
          </div>
          
          <div class="section">
            <h3>VOTER INFORMATION</h3>
            <table style="width:100%">
              <tr><td width="40%"><strong>Election Year:</strong></td><td>${receipt?.electionYear || electionYear}</td></tr>
              <tr><td><strong>Matric Number:</strong></td><td>${receipt?.matricNumber || matricNumber}</td></tr>
              <tr><td><strong>Student Name:</strong></td><td>${receipt?.studentName || studentName}</td></tr>
              <tr><td><strong>Date & Time:</strong></td><td>${receipt?.timestamp || new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>YOUR VOTES</h3>
            <table class="votes-table">
              <thead><tr><th>Position</th><th>Candidate</th></tr></thead>
              <tbody>
                ${receipt?.votes?.map(vote => `<tr><td>${vote.position}</td><td>${vote.candidateName}</td></tr>`).join('') || '<tr><td colspan="2">No votes recorded</td></tr>'}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <p class="confirmed">✅ CONFIRMED: Your vote has been securely recorded.</p>
            <p>🔒 Your vote is secure and cannot be changed.</p>
          </div>
          
          <div class="footer">
            <p>This is an official receipt from the SUG Electoral Committee.</p>
            <p>Please keep this for your records.</p>
            <p>© ${new Date().getFullYear()} UAES SUG Voting System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voting_receipt_${matricNumber}_${electionYear}.html`;
    a.click();
    URL.revokeObjectURL(url);
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

  if (!receipt) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No receipt found. Please vote first.
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-success px-4 sticky-top">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-receipt me-2"></i>
          Voting Receipt – {electionYear}
        </span>
        <button className="btn btn-light btn-sm" onClick={() => navigate("/dashboard")}>
          <i className="bi bi-house me-1"></i> Dashboard
        </button>
      </nav>

      <div className="container py-4">
        <div className="card shadow-lg border-0" style={{ maxWidth: "650px", margin: "0 auto" }}>
          
          {/* Header */}
          <div className="card-header bg-success text-white text-center py-3">
            <i className="bi bi-check-circle-fill fs-1"></i>
            <h3 className="fw-bold mb-0 mt-2">VOTING RECEIPT</h3>
            <small>Official Confirmation of Vote</small>
          </div>

          <div className="card-body p-4">
            
            {/* Receipt ID Banner */}
            <div className="text-center mb-4">
              <div className="border rounded p-2 bg-light">
                <p className="mb-0"><strong>Receipt ID:</strong></p>
                <code className="fw-bold fs-6">{receipt.receiptId}</code>
              </div>
            </div>

            {/* Voter Information */}
            <div className="mb-4">
              <h6 className="fw-bold text-success mb-3">
                <i className="bi bi-person-vcard me-2"></i>VOTER INFORMATION
              </h6>
              <div className="border rounded p-3 bg-white">
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Election Year:</div>
                  <div className="col-7">{receipt.electionYear}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Matric Number:</div>
                  <div className="col-7">{receipt.matricNumber}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-5 fw-bold">Student Name:</div>
                  <div className="col-7">{receipt.studentName}</div>
                </div>
                <div className="row">
                  <div className="col-5 fw-bold">Date & Time:</div>
                  <div className="col-7">{receipt.timestamp}</div>
                </div>
              </div>
            </div>

            {/* Votes Summary */}
            <div className="mb-4">
              <h6 className="fw-bold text-success mb-3">
                <i className="bi bi-check2-square me-2"></i>YOUR VOTES
              </h6>
              <div className="border rounded overflow-hidden">
                <table className="table table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Position</th>
                      <th>Candidate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.votes && receipt.votes.length > 0 ? (
                      receipt.votes.map((vote, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{vote.position}</td>
                          <td>{vote.candidateName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted">No votes recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirmation Messages */}
            <div className="alert alert-success text-center py-2 mb-3">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>CONFIRMED:</strong> Your vote has been securely recorded.
            </div>

            <div className="alert alert-secondary text-center py-2 small">
              <i className="bi bi-shield-lock-fill me-2"></i>
              Your vote is secure and cannot be changed.
            </div>
          </div>

          {/* Action Buttons - TXT download removed */}
          <div className="card-footer bg-white text-center py-3 border-top-0">
            <button className="btn btn-outline-primary me-2 mb-2" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i> Print
            </button>
            <button className="btn btn-outline-secondary mb-2" onClick={handleDownloadPDF}>
              <i className="bi bi-filetype-pdf me-1"></i> Download Receipt
            </button>
            <button className="btn btn-success mt-2 w-100" onClick={() => navigate("/dashboard")}>
              <i className="bi bi-house me-1"></i> Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4">
          <small className="text-muted">
            <i className="bi bi-shield-check me-1"></i>
            This is an official receipt from the SUG Electoral Committee.
            Please keep for your records.
          </small>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Receipt;