import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { getStudents, addStudent, bulkUploadStudents, deleteStudent, getAdminDashboard } from "../services/api";

function UploadStudent() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();
  
  const token = localStorage.getItem("adminToken");
  const [votingStatus, setVotingStatus] = useState(
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed"
  );

  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [searchMatric, setSearchMatric] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const studentsPerPage = 10;

  // ================= SYNC VOTING STATUS FROM BACKEND =================
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

  // ================= LOAD STUDENTS FROM BACKEND =================
  const loadStudents = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getStudents(token, electionYear);
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading students:", error);
      showModalAlert("Failed to load students. Please refresh the page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    syncVotingStatus();
    loadStudents();
  }, [electionYear]);

  // ================= SHOW MODAL =================
  const showModalAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2500);
  };

  // ================= ADD STUDENT TO BACKEND =================
  const addStudentHandler = async () => {
    // CHECK IF VOTING IS OPEN - LOCK
    if (votingStatus === "open") {
      showModalAlert("❌ Voting has started. You cannot upload students.");
      return;
    }

    if (!name || !matric || !email) {
      showModalAlert("⚠️ All fields are required.");
      return;
    }

    if (!/^\d+$/.test(matric)) {
      showModalAlert("⚠️ Matric number must contain digits only.");
      return;
    }

    if (!email.includes("@")) {
      showModalAlert("⚠️ Enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await addStudent(token, {
        name: name.trim(),
        matricNumber: matric.trim(),
        email: email.trim().toLowerCase(),
        electionYear
      });

      await loadStudents();
      showModalAlert("✅ Student uploaded successfully");

      setName("");
      setMatric("");
      setEmail("");
    } catch (error) {
      console.error("Error adding student:", error);
      showModalAlert(error.message || "Failed to add student");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= BULK CSV UPLOAD =================
  const handleCSVUpload = async (e) => {
    // CHECK IF VOTING IS OPEN - LOCK
    if (votingStatus === "open") {
      showModalAlert("❌ Voting has started. You cannot upload students.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map((row) => row.trim());
      const studentsToUpload = [];

      rows.forEach((row, index) => {
        if (!row) return;
        if (index === 0 && row.toLowerCase().includes("name")) return;

        const [name, matric, email] = row.split(",");
        if (!name || !matric || !email) return;

        const cleanMatric = matric.replace(/\D/g, "").trim();
        const cleanEmail = email.trim().toLowerCase();

        studentsToUpload.push({
          name: name.trim(),
          matric: cleanMatric,
          email: cleanEmail,
        });
      });

      if (studentsToUpload.length === 0) {
        showModalAlert("⚠️ No valid students found in CSV.");
        return;
      }

      setSubmitting(true);

      try {
        const result = await bulkUploadStudents(token, studentsToUpload, electionYear);
        await loadStudents();
        showModalAlert(`✅ ${result.added} students uploaded successfully. ${result.duplicates} duplicates skipped.`);
      } catch (error) {
        console.error("Error bulk uploading:", error);
        showModalAlert(error.message || "Failed to upload students");
      } finally {
        setSubmitting(false);
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  // ================= DELETE STUDENT =================
  const deleteStudentHandler = async (studentId) => {
    // CHECK IF VOTING IS OPEN - LOCK
    if (votingStatus === "open") {
      showModalAlert("❌ Voting has started. You cannot modify students.");
      return;
    }

    if (window.confirm("Are you sure you want to remove this student?")) {
      try {
        await deleteStudent(token, studentId);
        await loadStudents();
        showModalAlert("🗑 Student removed successfully");
      } catch (error) {
        console.error("Error deleting student:", error);
        showModalAlert(error.message || "Failed to delete student");
      }
    }
  };

  // ================= SEARCH FILTER =================
  const filteredStudents = students.filter((s) =>
    s.matricNumber?.includes(searchMatric)
  );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const changePage = (pageNum) => setCurrentPage(pageNum);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-3">Upload Students – {electionYear}</h3>

      {/* VOTING LOCK WARNING */}
      {votingStatus === "open" && (
        <div className="alert alert-danger text-center">
          <i className="bi bi-lock-fill me-2"></i>
          🚫 VOTING IS IN PROGRESS. Student upload is LOCKED.
        </div>
      )}

      {/* ADD STUDENT FORM */}
      <div className="card shadow-sm p-4 mb-4">
        <input
          className="form-control mb-3"
          placeholder="Student Full Name"
          value={name}
          disabled={votingStatus === "open" || submitting}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="Matric Number"
          value={matric}
          disabled={votingStatus === "open" || submitting}
          onChange={(e) => setMatric(e.target.value.replace(/\D/g, ""))}
        />

        <input
          className="form-control mb-3"
          placeholder="Student Email"
          value={email}
          disabled={votingStatus === "open" || submitting}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="btn btn-primary w-100"
          disabled={votingStatus === "open" || submitting}
          onClick={addStudentHandler}
        >
          {submitting ? "Uploading..." : "Upload Student"}
        </button>

        <hr />
        <label className="fw-bold mt-3">Bulk Upload</label>
        <input
          type="file"
          accept=".csv"
          className="form-control mt-2"
          disabled={votingStatus === "open" || submitting}
          onChange={handleCSVUpload}
        />
        <small className="text-muted">Format: name,matric,email (no headers)</small>
      </div>

      {/* STUDENT LIST */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Uploaded Students ({students.length})
          </h5>

          <input
            className="form-control mb-3"
            placeholder="🔍 Search by Matric"
            value={searchMatric}
            onChange={(e) =>
              setSearchMatric(e.target.value.replace(/\D/g, ""))
            }
          />

          {currentStudents.length === 0 ? (
            <p className="text-muted text-center">No students found.</p>
          ) : (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Matric</th>
                  <th>Email</th>
                  <th>Voted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1 + (currentPage - 1) * studentsPerPage}</td>
                    <td>{s.name}</td>
                    <td>{s.matricNumber}</td>
                    <td>{s.email}</td>
                    <td>
                      {s.hasVoted ? (
                        <span className="badge bg-success">Yes</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={votingStatus === "open" || submitting}
                        onClick={() => deleteStudentHandler(s.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center mt-3">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => changePage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">{modalMessage}</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default UploadStudent;