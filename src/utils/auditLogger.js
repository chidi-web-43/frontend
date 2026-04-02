export const logAction = (action, details = "") => {
  const electionYear =
    localStorage.getItem("electionYear") ||
    new Date().getFullYear().toString();

  const logKey = `auditLogs_${electionYear}`;

  const existingLogs =
    JSON.parse(localStorage.getItem(logKey)) || [];

  const newLog = {
    id: Date.now(),
    action,
    details,
    timestamp: new Date().toLocaleString(),
  };

  const updatedLogs = [newLog, ...existingLogs];

  localStorage.setItem(logKey, JSON.stringify(updatedLogs));
};