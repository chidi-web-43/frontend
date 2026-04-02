import { useEffect, useState } from "react";

function AuditLogs() {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const logKey = `auditLogs_${electionYear}`;
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem(logKey)) || [];
    setLogs(stored);
  }, [logKey]);

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">
        Audit Logs – {electionYear}
      </h3>

      {logs.length === 0 ? (
        <p className="text-muted">No logs available.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log.id}>
                <td>{index + 1}</td>
                <td>{log.action}</td>
                <td>{log.details}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AuditLogs;