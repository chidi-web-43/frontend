import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getCandidatesList, addCandidate, deleteCandidate, getAdminDashboard } from "../services/api";

function ManageCandidates() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [votingStatus, setVotingStatus] = useState(
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed"
  );

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = "http://localhost:5000";

  /* ================= SYNC VOTING STATUS FROM BACKEND ================= */
  const syncVotingStatus = async () => {
    if (!token) return;
    try {
      const data = await getAdminDashboard(token, electionYear);
      const status = data.electionStatus;
      setVotingStatus(status);
      localStorage.setItem(`votingStatus_${electionYear}`, status);
    } catch (error) {
      console.error("Error syncing voting status:", error);
    }
  };

  /* ================= LOAD CANDIDATES FROM BACKEND ================= */
  const loadCandidates = async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    
    try {
      const data = await getCandidatesList(token, electionYear);
      setCandidates(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading candidates:", error);
      alert("Failed to load candidates. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    syncVotingStatus();
    loadCandidates();
  }, [electionYear]);

  /* ================= IMAGE HANDLER ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ================= ADD CANDIDATE TO BACKEND ================= */
  const handleAddCandidate = async () => {
    if (votingStatus === "open") {
      alert("🚫 Voting has started. You cannot add candidates.");
      return;
    }

    if (!name || !position || !faculty || !department || !level || !image) {
      alert("All fields including image are required");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("position", position);
      formData.append("faculty", faculty);
      formData.append("department", department);
      formData.append("level", level);
      formData.append("image", image);
      formData.append("electionYear", electionYear);

      await addCandidate(token, formData);
      
      // Clear form
      setName("");
      setPosition("");
      setFaculty("");
      setDepartment("");
      setLevel("");
      setImage(null);
      setImagePreview("");
      
      await loadCandidates();
      
      alert("✅ Candidate added successfully");
    } catch (error) {
      console.error("Error adding candidate:", error);
      alert("Failed to add candidate: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE CANDIDATE ================= */
  const handleDeleteCandidate = async (id) => {
    if (votingStatus === "open") {
      alert("🚫 Voting has started. Cannot delete candidates.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate(token, id);
        await loadCandidates();
        alert("🗑 Candidate removed successfully");
      } catch (error) {
        console.error("Error deleting candidate:", error);
        alert("Failed to delete candidate: " + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading candidates...</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-3">
        Manage Candidates – {electionYear}
      </h3>

      {votingStatus === "open" && (
        <div className="alert alert-danger text-center">
          <i className="bi bi-lock-fill me-2"></i>
          🚫 VOTING IS IN PROGRESS. Candidate management is LOCKED.
        </div>
      )}

      {/* ADD FORM */}
      <div className="card p-4 mt-3 shadow-sm">
        <h5 className="fw-bold mb-3">Add New Candidate</h5>
        
        <div className="row">
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Candidate Full Name *"
              value={name}
              disabled={votingStatus === "open" || submitting}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Position (e.g., President, Vice President) *"
              value={position}
              disabled={votingStatus === "open" || submitting}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Faculty (e.g., Agriculture, Science) *"
              value={faculty}
              disabled={votingStatus === "open" || submitting}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Department (e.g., Computer Science) *"
              value={department}
              disabled={votingStatus === "open" || submitting}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Level (e.g., 300L, 400L) *"
              value={level}
              disabled={votingStatus === "open" || submitting}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="file"
              accept="image/*"
              className="form-control mb-3"
              disabled={votingStatus === "open" || submitting}
              onChange={handleImage}
            />
            {imagePreview && (
              <div className="mt-2 text-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }}
                />
              </div>
            )}
            <small className="text-muted">* All fields are required</small>
          </div>
        </div>

        <button
          className="btn btn-primary w-100"
          disabled={votingStatus === "open" || submitting}
          onClick={handleAddCandidate}
        >
          {submitting ? "Adding Candidate..." : "Add Candidate"}
        </button>
      </div>

      {/* CANDIDATE LIST - WITH FIXED IMAGE URL */}
      <div className="mt-4">
        <h5 className="fw-bold mb-3">Candidate List ({candidates.length})</h5>
        
        {candidates.length === 0 ? (
          <p className="text-muted text-center">No candidates added yet.</p>
        ) : (
          <div className="row">
            {candidates.map((c) => (
              <div className="col-md-6 col-lg-4 mb-4" key={c.id}>
                <div className="card shadow-sm h-100">
                  <img
                    src={c.image?.startsWith('http') ? c.image : `${API_BASE_URL}${c.image}`}
                    alt={c.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
                    }}
                  />
                  <div className="card-body">
                    <h5 className="fw-bold mb-2">{c.name}</h5>
                    <span className="badge bg-primary mb-2">{c.position}</span>
                    
                    <div className="mt-3">
                      <p className="mb-1 small">
                        <strong>Faculty:</strong> {c.faculty}
                      </p>
                      <p className="mb-1 small">
                        <strong>Department:</strong> {c.department}
                      </p>
                      <p className="mb-1 small">
                        <strong>Level:</strong> {c.level}
                      </p>
                      <p className="mb-1 small">
                        <strong>Votes:</strong> <span className="fw-bold text-success">{c.voteCount || 0}</span>
                      </p>
                    </div>
                  </div>
                  <div className="card-footer bg-white">
                    <button
                      className="btn btn-danger btn-sm w-100"
                      disabled={votingStatus === "open"}
                      onClick={() => handleDeleteCandidate(c.id)}
                    >
                      Delete Candidate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ManageCandidates;