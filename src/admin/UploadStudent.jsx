import { useEffect, useState } from "react";
import { logAction } from "../utils/auditLogger";
import Footer from "../components/Footer";

function UploadStudent() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();
  const storageKey = `students_${electionYear}`;
  const votingStatus =
    localStorage.getItem(`votingStatus_${electionYear}`) || "closed";

  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [searchMatric, setSearchMatric] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
    setStudents(stored);
  }, [storageKey]);

  /* ================= SHOW MODAL ================= */
  const showModalAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2500);
  };

  /* ================= ADD STUDENT ================= */
  const addStudent = () => {
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

    if (students.some((s) => s.matric === matric)) {
      showModalAlert("❌ This matric number already exists.");
      return;
    }

    if (students.some((s) => s.email?.toLowerCase() === email.toLowerCase())) {
      showModalAlert("❌ This email is already assigned to another student.");
      return;
    }

    const newStudent = {
      name: name.trim(),
      matric: matric.trim(),
      email: email.trim().toLowerCase(),
      hasVoted: false,
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Log single upload
    logAction("STUDENT_UPLOAD", `Matric: ${matric}, Name: ${name}, Email: ${email}`);

    showModalAlert("✅ Student uploaded successfully");

    setName("");
    setMatric("");
    setEmail("");
  };

  /* ================= BULK CSV UPLOAD ================= */
  const handleCSVUpload = (e) => {
    if (votingStatus === "open") {
      showModalAlert("❌ Voting has started. You cannot upload students.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map((row) => row.trim());
      let updatedStudents = [...students];
      let addedCount = 0;

      rows.forEach((row, index) => {
        if (!row) return;
        if (index === 0 && row.toLowerCase().includes("name")) return;

        const [name, matric, email] = row.split(",");
        if (!name || !matric || !email) return;

        const cleanMatric = matric.replace(/\D/g, "").trim();
        const cleanEmail = email.trim().toLowerCase();

        const matricExists = updatedStudents.some((s) => s.matric === cleanMatric);
        const emailExists = updatedStudents.some((s) => s.email?.toLowerCase() === cleanEmail);

        if (!matricExists && !emailExists) {
          updatedStudents.push({
            name: name.trim(),
            matric: cleanMatric,
            email: cleanEmail,
            hasVoted: false,
          });
          addedCount++;
        }
      });

      setStudents(updatedStudents);
      localStorage.setItem(storageKey, JSON.stringify(updatedStudents));

      if (addedCount > 0) {
        showModalAlert(`✅ ${addedCount} students uploaded successfully`);
        // Log bulk upload
        logAction("BULK_UPLOAD", `${addedCount} students uploaded via CSV`);
      } else {
        showModalAlert("⚠️ No new students were added (duplicates skipped).");
      }
    };

    reader.readAsText(file);
  };

  /* ================= DOWNLOAD CSV TEMPLATE ================= */
  <small className="text-muted">
    csv format: name,matric,email (no duplicates allowed)
  </small>
 

  /* ================= DELETE STUDENT ================= */
  const deleteStudent = (matric) => {
    if (votingStatus === "open") {
      showModalAlert("❌ Voting has started. You cannot modify students.");
      return;
    }

    const updated = students.filter((s) => s.matric !== matric);
    setStudents(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    showModalAlert("🗑 Student removed successfully");
    logAction("STUDENT_DELETE", `Matric: ${matric}`);
  };

  /* ================= SEARCH FILTER ================= */
  const filteredStudents = students.filter((s) =>
    s.matric.includes(searchMatric)
  );

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const changePage = (pageNum) => setCurrentPage(pageNum);

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-3">Upload Students – {electionYear}</h3>

      {votingStatus === "open" && (
        <div className="alert alert-danger text-center">
          🚫 Voting has started. Student upload is locked.
        </div>
      )}

      {/* ADD STUDENT FORM */}
      <div className="card shadow-sm p-4 mb-4">
        <input
          className="form-control mb-3"
          placeholder="Student Full Name"
          value={name}
          disabled={votingStatus === "open"}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="Matric Number"
          value={matric}
          disabled={votingStatus === "open"}
          onChange={(e) => setMatric(e.target.value.replace(/\D/g, ""))}
        />

        <input
          className="form-control mb-3"
          placeholder="Student Email"
          value={email}
          disabled={votingStatus === "open"}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="btn btn-primary w-100"
          disabled={votingStatus === "open"}
          onClick={addStudent}
        >
          Upload Student
        </button>

        <hr />
        <label className="fw-bold mt-3">Bulk Upload </label>
        <input
          type="file"
          accept=".csv"
          className="form-control mt-2"
          disabled={votingStatus === "open"}
          onChange={handleCSVUpload}
        />
        <small className="text-muted">Format: name,matric,email</small>

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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, index) => (
                  <tr key={s.matric}>
                    <td>{index + 1 + (currentPage - 1) * studentsPerPage}</td>
                    <td>{s.name}</td>
                    <td>{s.matric}</td>
                    <td>{s.email}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={votingStatus === "open"}
                        onClick={() => deleteStudent(s.matric)}
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