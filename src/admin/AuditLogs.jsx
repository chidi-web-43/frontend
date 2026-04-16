import { useEffect, useState } from "react";
import { getAuditLogs } from "../services/api";
import { initializeSocket, getSocket, disconnectSocket } from "../services/socket";

function AuditLogs() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const token = localStorage.getItem("adminToken");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLogAlert, setNewLogAlert] = useState(false);

  const loadLogs = async () => {
    if (!token) {
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }
    
    try {
      const data = await getAuditLogs(token, electionYear);
      setLogs(data);
      setError("");
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError("Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time socket connection for live audit logs
  useEffect(() => {
    if (!token) return;
    
    loadLogs();
    
    // Initialize socket for real-time updates
    const socket = initializeSocket(token, electionYear);
    
    if (socket) {
      // Listen for real-time audit log updates
      socket.on('audit-log-updated', (newLog) => {
        console.log('🔔 New audit log received in real-time:', newLog);
        // Add new log to the top of the list
        setLogs(prevLogs => [newLog, ...prevLogs]);
        // Show visual notification
        setNewLogAlert(true);
        setTimeout(() => setNewLogAlert(false), 3000);
      });
      
      // Also listen for vote updates and election status changes
      socket.on('vote-updated', (data) => {
        console.log('📊 Vote update received:', data);
        // Refresh logs when vote is cast
        loadLogs();
      });
      
      socket.on('election-status-changed', (data) => {
        console.log('📢 Election status changed:', data);
        // Refresh logs when election status changes
        loadLogs();
      });
    }
    
    // Refresh logs every 30 seconds as backup
    const interval = setInterval(loadLogs, 30000);
    
    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [electionYear]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <div className="text-center">
          <button className="btn btn-primary" onClick={loadLogs}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Real-time notification banner */}
      {newLogAlert && (
        <div className="alert alert-success alert-dismissible fade show text-center" role="alert">
          <i className="bi bi-bell-fill me-2"></i>
          <strong>New audit log added!</strong> The page has been updated automatically.
          <button type="button" className="btn-close" onClick={() => setNewLogAlert(false)}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Audit Logs – {electionYear}
        </h3>
        <div>
          <button 
            className="btn btn-outline-success btn-sm me-2"
            onClick={loadLogs}
            title="Refresh logs"
          >
            <i className="bi bi-arrow-repeat me-1"></i> Refresh
          </button>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i> Print Logs
          </button>
        </div>
      </div>

      <div className="text-muted small mb-3">
        <i className="bi bi-info-circle me-1"></i>
        Logs auto-refresh every 30 seconds
        <span className="ms-3 text-success">
          <i className="bi bi-broadcast me-1"></i>
          Real-time updates active
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          No audit logs available for {electionYear}.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Action</th>
                <th>Details</th>
                <th style={{ width: "180px" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} className={index === 0 && newLogAlert ? "table-success" : ""}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <span className={`badge ${
                      log.action === 'ADMIN_LOGIN' ? 'bg-info' :
                      log.action === 'VOTING_START' ? 'bg-success' :
                      log.action === 'VOTING_END' ? 'bg-danger' :
                      log.action === 'STUDENT_UPLOAD' ? 'bg-primary' :
                      log.action === 'BULK_UPLOAD' ? 'bg-primary' :
                      log.action === 'STUDENT_DELETE' ? 'bg-danger' :
                      log.action === 'CANDIDATE_ADD' ? 'bg-warning' :
                      log.action === 'CANDIDATE_DELETE' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {log.action}
                    </span>
                    {index === 0 && newLogAlert && (
                      <span className="badge bg-success ms-2">
                        <i className="bi bi-star-fill me-1"></i>NEW
                      </span>
                    )}
                  </td>
                  <td>{log.details}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;