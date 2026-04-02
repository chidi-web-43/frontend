import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function Guidelines() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const scrollToContent = () => {
    document
      .getElementById("guidelines-content")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* ================= HERO SECTION ================= */}
      <div className="hero-section text-white d-flex align-items-center justify-content-center text-center">
        <div data-aos="zoom-in">
          <h1 className="fw-bold display-5 mb-3">
            🗳 SUG Election Guidelines
          </h1>

          <p className="lead mb-4">
            Follow the rules for a fair, transparent, and secure voting process
          </p>

          <button className="btn btn-light px-4" onClick={scrollToContent}>
            Read Guidelines ↓
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div id="guidelines-content" className="container py-5">
        <div className="card shadow-sm p-4" data-aos="fade-up">
          <p className="text-muted">
            Please read the following guidelines carefully before participating
            in the Student Union Government (SUG) election. These rules ensure a
            free, fair, and transparent voting process.
          </p>

          <hr />

          {/* RULES */}
          <h5 className="fw-bold mt-3" data-aos="fade-right">
            🗳 Voting Rules
          </h5>
          <ul data-aos="fade-left">
            <li>Each student is allowed to vote only once.</li>
            <li>You must vote for all available positions before submission.</li>
            <li>Once submitted, your vote cannot be changed.</li>
            <li>Do not share your login credentials with anyone.</li>
          </ul>

          {/* ELIGIBILITY */}
          <h5 className="fw-bold mt-4" data-aos="fade-right">
            🎓 Eligibility
          </h5>
          <ul data-aos="fade-left">
            <li>Only registered students can vote.</li>
            <li>Your matric number must be valid.</li>
            <li>You must be logged in to vote.</li>
          </ul>

          {/* SECURITY */}
          <h5 className="fw-bold mt-4" data-aos="fade-right">
            🔐 Security & Integrity
          </h5>
          <ul data-aos="fade-left">
            <li>All votes are securely recorded.</li>
            <li>Duplicate voting is strictly prohibited.</li>
            <li>Any suspicious activity may lead to disqualification.</li>
          </ul>

          {/* VOTING PERIOD */}
          <h5 className="fw-bold mt-4" data-aos="fade-right">
            ⏰ Voting Period
          </h5>
          <ul data-aos="fade-left">
            <li>Voting opens and closes at scheduled times.</li>
            <li>You cannot vote after the deadline.</li>
          </ul>

          {/* RESULTS */}
          <h5 className="fw-bold mt-4" data-aos="fade-right">
            📊 Results
          </h5>
          <ul data-aos="fade-left">
            <li>Results will be published after voting ends.</li>
            <li>Check the results page for updates.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;