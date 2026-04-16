import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { sendOTP, verifyOTP } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const [step, setStep] = useState(1); // 1 = matric, 2 = otp
  const [matricNumber, setMatricNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP TO BACKEND ================= */
  const sendOtp = async () => {
    setError("");
    setLoading(true);

    if (!matricNumber) {
      setError("Please enter your Matric Number.");
      setLoading(false);
      return;
    }

    try {
      const response = await sendOTP(matricNumber, electionYear);
      setStudentId(response.studentId);
      setStudentEmail(response.email || "your email");
      setStudentName(response.name || "");
      setStep(2);
      
      // Show OTP in alert for testing - 60 seconds validity
      alert(
        `📧 OTP SENT TO ${response.email || "your email"}\n\nOTP: ${response.otp || "Check server console"}\n⏰ Valid for 60 seconds only!`
      );
    } catch (err) {
      setError(err.message || "❌ Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP WITH BACKEND ================= */
  const verifyOtp = async () => {
    setError("");
    setLoading(true);

    if (!otp) {
      setError("Please enter the OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOTP(studentId, otp);
      
      /* LOGIN SUCCESS - SAVE TO LOCALSTORAGE */
      localStorage.setItem("studentAuth", "true");
      localStorage.setItem("studentToken", response.token);
      localStorage.setItem("matricNumber", response.student.matricNumber);
      localStorage.setItem("studentName", response.student.name);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "❌ Invalid OTP or OTP expired. Please request a new OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    setError("");
    setLoading(true);
    
    try {
      const response = await sendOTP(matricNumber, electionYear);
      setStudentId(response.studentId);
      setStudentEmail(response.email || "your email");
      
      alert(
        `📧 NEW OTP SENT TO ${response.email || "your email"}\n\nOTP: ${response.otp || "Check server console"}\n⏰ Valid for 60 seconds only!`
      );
    } catch (err) {
      setError(err.message || "❌ Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#eef2f6" }}
    >
      <div className="card shadow-lg border-0" style={{ width: "460px" }}>
        <div className="card-header bg-success text-white text-center py-4">
          <img src={logo} width="80" className="mb-2" alt="logo" />
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

          {/* STEP 1 – MATRIC NUMBER */}
          {step === 1 && (
            <>
              <input
                className="form-control form-control-lg mb-4"
                placeholder="Matric Number"
                value={matricNumber}
                onChange={(e) =>
                  setMatricNumber(e.target.value.replace(/\D/g, ""))
                }
                disabled={loading}
              />

              <button
                className="btn btn-success btn-lg w-100"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP 2 – OTP VERIFICATION */}
          {step === 2 && (
            <>
              <p className="text-muted text-center mb-3">
                OTP sent to <strong>{studentEmail}</strong>
                <br />
                <small className="text-danger">⏰ OTP expires in 60 seconds!</small>
              </p>

              <input
                className="form-control form-control-lg mb-3"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                disabled={loading}
              />

              <button
                className="btn btn-success btn-lg w-100 mb-2"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                onClick={resendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="card-footer text-center bg-light small text-muted">
          © {new Date().getFullYear()} UAES SUG Electoral System
        </div>
      </div>
    </div>
  );
}

export default Login;