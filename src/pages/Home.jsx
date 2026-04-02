import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import { useEffect } from "react";
import "../App.css";

function Home() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

 /* ================= HERO IMAGES ================= */
const heroImages = [
  // 🗳️ Voting images (6)
  "https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg",
  "https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg", 
  "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg",
  "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg",
  "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg",
  "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg", 
  "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg", 
  "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg"
];


  /* ================= SLIDER ================= */
  useEffect(() => {
    const carousel = document.querySelector("#heroCarousel");
    const interval = setInterval(() => {
      const active = carousel.querySelector(".carousel-item.active");
      active.classList.remove("active");
      const next =
        active.nextElementSibling ||
        carousel.querySelector(".carousel-item:first-child");
      next.classList.add("active");
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* ================= HERO SLIDER ================= */}
      <div id="heroCarousel" className="carousel slide">
        <div className="carousel-inner">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "92vh",
              }}
            >
              {/* DARK OVERLAY */}
              <div
                className="d-flex align-items-center h-100"
                style={{ background: "rgba(0,0,0,0.65)" }}
              >
                <div className="container">
                  <div className="row">
                    <div className="col-lg-8 text-white">

                      {/* BADGE */}
                      <span className="badge bg-success mb-3 fs-6 fade-up delay-1">
                        🗳️ SUG ELECTION {electionYear}
                      </span>

                      {/* LOGO */}
                      <div className="mb-3 fade-up delay-2">
                        <img
                          src={logo}
                          alt="University Logo"
                          width="90"
                          style={{ opacity: 0.9 }}
                        />
                      </div>

                      {/* HEADLINE */}
                      <h1 className="fw-bold display-5 mb-3 fade-up delay-3">
                        Student Union Government Voting Portal
                      </h1>

                      {/* SUBTEXT */}
                      <p className="lead mb-4 fade-up delay-4">
                        Secure • Transparent • One Student, One Vote
                      </p>


                      {/* BUTTONS */}
                      <div className="mt-4">
                        <Link
                          to="/login"
                          className="btn btn-success btn-lg me-3"
                        >
                          Student Login
                        </Link>

                        <Link
                          to="/results"
                          className="btn btn-outline-light btn-lg"
                        >
                          View Results
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WATERMARK */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "30px",
                    opacity: 0.15,
                  }}
                >
                  <img src={logo} width="120" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= NOTICE ================= */}
      <section className="bg-light py-4 border-bottom">
        <div className="container text-center">
          <p className="mb-0 fw-semibold fs-5">
            ⚠️ Voting is strictly monitored • Multiple voting is prohibited
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Why This Voting System?</h2>
          <p className="text-muted">
            Built to meet university electoral standards
          </p>
        </div>

        <div className="row">
          {[
            {
              title: "Secure Authentication",
              text: "Only uploaded matric numbers can vote.",
            },
            {
              title: "Transparent Results",
              text: "Votes are counted automatically and fairly.",
            },
            {
              title: "Election Integrity",
              text: "Once voting starts, data is locked.",
            },
          ].map((item, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body">
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= OFFICIAL MESSAGE ================= */}
      <section className="bg-success text-white py-5">
        <div className="container text-center">
          <h4 className="fw-bold mb-3">
            Official Statement from Electoral Committee
          </h4>
          <p className="lead">
            This digital voting platform has been approved for conducting
            credible, transparent, and secure SUG elections in accordance
            with university regulations.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;