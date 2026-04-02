import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ElectionYearManager() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(
    localStorage.getItem("electionYear") || currentYear.toString()
  );
  const [availableYears, setAvailableYears] = useState([]);
  const [showYearSelector, setShowYearSelector] = useState(false);
  
  const isAdmin = localStorage.getItem("adminAuth") === "true";

  // Load all available election years from localStorage
  useEffect(() => {
    const years = [];
    // Check for existing election data from current year back to 2020
    for (let year = currentYear; year >= 2020; year--) {
      const students = localStorage.getItem(`students_${year}`);
      const candidates = localStorage.getItem(`candidates_${year}`);
      const votes = localStorage.getItem(`votes_${year}`);
      
      if (students || candidates || votes) {
        years.push(year);
      }
    }
    // Always include current year
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
    }
    setAvailableYears(years);
  }, [currentYear]);

  const changeElectionYear = (year) => {
    localStorage.setItem("electionYear", year);
    setSelectedYear(year);
    setShowYearSelector(false);
    
    // Reload the page to refresh all data with new year
    window.location.reload();
  };

  const initializeNewYear = () => {
    const newYear = (parseInt(selectedYear) + 1).toString();
    if (window.confirm(`Are you sure you want to initialize election for ${newYear}? This will create a fresh election year.`)) {
      localStorage.setItem("electionYear", newYear);
      setSelectedYear(newYear);
      window.location.reload();
    }
  };

  // Only show for admin users
  if (!isAdmin) return null;

  return (
    <div className="position-relative">
      <button
        className="btn btn-outline-light btn-sm me-2"
        onClick={() => setShowYearSelector(!showYearSelector)}
      >
        <i className="bi bi-calendar-event me-1"></i>
        Election {selectedYear}
        <i className="bi bi-chevron-down ms-1"></i>
      </button>

      {showYearSelector && (
        <>
          {/* Backdrop */}
          <div 
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040, backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowYearSelector(false)}
          ></div>
          
          {/* Dropdown Menu */}
          <div 
            className="position-absolute bg-white shadow-lg rounded"
            style={{ 
              top: "100%", 
              right: 0, 
              zIndex: 1050, 
              minWidth: "250px",
              marginTop: "8px"
            }}
          >
            <div className="p-2">
              <h6 className="fw-bold mb-2 px-2">Select Election Year</h6>
              <hr className="my-1" />
              
              {availableYears.map(year => (
                <button
                  key={year}
                  className={`dropdown-item w-100 text-start px-3 py-2 ${
                    selectedYear === year.toString() ? "bg-success text-white" : ""
                  }`}
                  onClick={() => changeElectionYear(year)}
                  style={{ borderRadius: "5px" }}
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  {year} Election
                  {selectedYear === year.toString() && (
                    <i className="bi bi-check-circle float-end"></i>
                  )}
                </button>
              ))}
              
              <hr className="my-1" />
              
              <button
                className="dropdown-item w-100 text-start px-3 py-2 text-primary"
                onClick={initializeNewYear}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Initialize {parseInt(selectedYear) + 1} Election
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ElectionYearManager;