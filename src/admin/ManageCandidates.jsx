import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isElectionLocked } from "../utils/ElectionLock";
import Footer from "../components/Footer";

function ManageCandidates() {
  const navigate = useNavigate();

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const votingStatus =
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed";

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [image, setImage] = useState("");
  const [candidates, setCandidates] = useState([]);

  const storageKey = `candidates_${electionYear}`;

  /* ================= CRITICAL LOCK ================= */
  useEffect(() => {
    if (isElectionLocked(electionYear)) {
      alert("🚫 Voting has started. Candidate management is locked.");
      navigate("/admin-dashboard");
    }
  }, [navigate, electionYear]);

  /* ================= LOAD CANDIDATES ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
    setCandidates(stored);
  }, [storageKey]);

  /* ================= IMAGE HANDLER ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  /* ================= ADD CANDIDATE ================= */
  const addCandidate = () => {
    if (!name || !position || !faculty || !department || !level || !image) {
      alert("All fields including image are required");
      return;
    }

    const updated = [
      ...candidates,
      {
        id: Date.now().toString(),
        name,
        position,
        faculty,
        department,
        level,
        image,
      },
    ];

    setCandidates(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Clear form
    setName("");
    setPosition("");
    setFaculty("");
    setDepartment("");
    setLevel("");
    setImage("");

    alert("✅ Candidate added successfully");
  };

  /* ================= DELETE CANDIDATE ================= */
  const deleteCandidate = (id) => {
    if (votingStatus === "open") {
      alert("❌ Voting has started. Cannot delete candidates.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this candidate?")) {
      const updated = candidates.filter(c => c.id !== id);
      setCandidates(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      alert("🗑 Candidate removed successfully");
    }
  };

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-3">
        Manage Candidates – {electionYear}
      </h3>

      {votingStatus === "open" && (
        <div className="alert alert-warning mt-3">
          🚫 Candidates are locked because voting has started.
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
              disabled={votingStatus === "open"}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Position (e.g., President, Vice President) *"
              value={position}
              disabled={votingStatus === "open"}
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
              disabled={votingStatus === "open"}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control mb-3"
              placeholder="Department (e.g., Computer Science) *"
              value={department}
              disabled={votingStatus === "open"}
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
              disabled={votingStatus === "open"}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="file"
              accept="image/*"
              className="form-control mb-3"
              disabled={votingStatus === "open"}
              onChange={handleImage}
            />
            <small className="text-muted">* All fields are required</small>
          </div>
        </div>

        <button
          className="btn btn-primary w-100"
          disabled={votingStatus === "open"}
          onClick={addCandidate}
        >
          Add Candidate
        </button>
      </div>

      {/* CANDIDATE LIST */}
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
                    src={c.image}
                    alt={c.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "cover" }}
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
                    </div>
                  </div>
                  <div className="card-footer bg-white">
                    <button
                      className="btn btn-danger btn-sm w-100"
                      disabled={votingStatus === "open"}
                      onClick={() => deleteCandidate(c.id)}
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