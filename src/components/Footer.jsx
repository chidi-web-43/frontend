import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaFacebookF, FaXTwitter, FaInstagram, FaEnvelope } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5">
      <div className="container">
        <div className="row">

          {/* SCHOOL INFO */}
          <div className="col-md-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img
                src={logo}
                alt="UAES Logo"
                style={{ width: "50px", height: "50px" }}
                className="me-3"
              />
              <h5 className="fw-bold mb-0">
                University of Agriculture & Environmental Sciences
              </h5>
            </div>

            <p className="small">
              Students’ Union Government (SUG) <br />
              Official Online Voting Portal
            </p>

            <p className="small text-secondary">
              Ensuring credible, transparent, and secure student elections.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">Quick Links</h5>
            <ul className="list-unstyled small">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/login" className="footer-link">Student Login</Link></li>
              <li><Link to="/results" className="footer-link">Election Results</Link></li>
              <li><Link to="/guidelines" className="footer-link">Voting Guidelines</Link></li>
            </ul>
          </div>

          {/* CONTACT & SOCIAL */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold">Contact & Support</h5>
            <p className="small">
              ICT Unit – Students’ Union Government <br /> Email: sug@uaes.edu.ng
            </p>

            <div className="d-flex gap-3 mt-3">
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaXTwitter /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="mailto:sug@uaes.edu.ng" className="social-icon">
                <FaEnvelope />
              </a>
            </div>
          </div>

        </div>

        <hr className="border-secondary" />

        {/* BOTTOM BAR */}
        <div className="row pb-3">
          <div className="col-md-6 text-center text-md-start small">
            &copy; {new Date().getFullYear()} UAES SUG Voting System.
            All Rights Reserved.
          </div>

          <div className="col-md-6 text-center text-md-end small">
            <a href="#" className="footer-link me-3">Privacy Policy</a>
            <a href="#" className="footer-link">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;