import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const studentsKey = `students_${electionYear}`;

  const [step, setStep] = useState(1); // 1 = matric, 2 = otp
  const [matricNumber, setMatricNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  /* ================= GENERATE OTP ================= */
  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  /* ================= SEND OTP ================= */
  const sendOtp = () => {
    setError("");

    if (!matricNumber) {
      setError("Please enter your Matric Number.");
      return;
    }

    const students =
      JSON.parse(localStorage.getItem(studentsKey)) || [];

    const found = students.find(
      (s) => s.matric === matricNumber
    );

    if (!found) {
      setError(
        "❌ You are NOT eligible for this election. Contact the Electoral Committee."
      );
      return;
    }

    /* ❌ BLOCK IF ALREADY VOTED */
    if (found.hasVoted) {
      setError("❌ You have already voted. OTP access denied.");
      return;
    }

    const otpCode = generateOTP();
    const expiry = Date.now() + 1 * 60 * 1000; // 1 minute validity
    /* SAVE OTP INTO STUDENT RECORD */
    const updatedStudents = students.map((s) =>
      s.matric === matricNumber
        ? { ...s, otp: otpCode, otpExpiry: expiry }
        : s
    );

    localStorage.setItem(
      studentsKey,
      JSON.stringify(updatedStudents)
    );

    setStudent(found);
    setStep(2);

    /* 📧 SIMULATED EMAIL */
    alert(
      `📧 OTP SENT TO ${found.email}\n\nOTP: ${otpCode}\nValid for 60 seconds`
    );
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = () => {
    setError("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    const students =
      JSON.parse(localStorage.getItem(studentsKey)) || [];

    const found = students.find(
      (s) => s.matric === matricNumber
    );

    if (!found) {
      setError("Invalid student record.");
      return;
    }

    if (found.hasVoted) {
      setError("❌ Voting already completed.");
      return;
    }

    if (!found.otp || Date.now() > found.otpExpiry) {
      setError("❌ OTP expired. Please resend OTP.");
      return;
    }

    if (otp !== found.otp) {
      setError("❌ Incorrect OTP.");
      return;
    }

    /* CLEAR OTP AFTER SUCCESSFUL LOGIN */
    const updatedStudents = students.map((s) =>
      s.matric === matricNumber
        ? { ...s, otp: null, otpExpiry: null }
        : s
    );

    localStorage.setItem(
      studentsKey,
      JSON.stringify(updatedStudents)
    );

    /* LOGIN SUCCESS */
    localStorage.setItem("studentAuth", "true");
    localStorage.setItem("matricNumber", found.matric);
    localStorage.setItem("studentName", found.name);

    navigate("/dashboard");
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = () => {
    const students =
      JSON.parse(localStorage.getItem(studentsKey)) || [];

    const found = students.find(
      (s) => s.matric === matricNumber
    );

    if (!found || found.hasVoted) {
      setError("❌ OTP regeneration not allowed.");
      return;
    }

    const otpCode = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    const updatedStudents = students.map((s) =>
      s.matric === matricNumber
        ? { ...s, otp: otpCode, otpExpiry: expiry }
        : s
    );

    localStorage.setItem(
      studentsKey,
      JSON.stringify(updatedStudents)
    );

    alert(
      `📧 NEW OTP SENT TO ${found.email}\n\nOTP: ${otpCode}\nValid for 60 seconds`
    );
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#eef2f6" }}
    >
      <div className="card shadow-lg border-0" style={{ width: "460px" }}>
        <div className="card-header bg-success text-white text-center py-4">
          <img src={logo} width="80" className="mb-2" />
          <h5 className="fw-bold mb-0">
            University of Agriculture & Environmental Science
          </h5>
          <small className="opacity-75">
            SUG Voting – {electionYear}
          </small>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger text-center py-2">
              {error}
            </div>
          )}

          {/* STEP 1 – MATRIC */}
          {step === 1 && (
            <>
              <input
                className="form-control form-control-lg mb-4"
                placeholder="Matric Number"
                value={matricNumber}
                onChange={(e) =>
                  setMatricNumber(e.target.value.replace(/\D/g, ""))
                }
              />

              <button
                className="btn btn-success btn-lg w-100"
                onClick={sendOtp}
              >
                Send OTP
              </button>
            </>
          )}

          {/* STEP 2 – OTP */}
          {step === 2 && student && (
            <>
              <p className="text-muted text-center mb-3">
                OTP sent to <strong>{student.email}</strong>
              </p>

              <input
                className="form-control form-control-lg mb-3"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
              />

              <button
                className="btn btn-success btn-lg w-100 mb-2"
                onClick={verifyOtp}
              >
                Verify & Login
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                onClick={resendOtp}
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;