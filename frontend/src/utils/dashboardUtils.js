import { saveAs } from "file-saver";

export const getRiskTotal = (institute) => {
  const risk = institute?.adminId?.aggregations?.risk || {};
  return (risk.high || 0) + (risk.medium || 0) + (risk.low || 0);
};

export const getReadableId = (mongoId) => {
  if (!mongoId) return "";
  return mongoId.toString().slice(-6).toUpperCase();
};

export const getTotalMentor = (admin) => {
  if (!admin) return 0;
  const total =
    admin.aggregations?.mentor?.active + admin.aggregations?.mentor?.inactive;
  return total;
};

export const getSuccessRate = (user) => {
  if (!user) return 0;
  if (user.aggregations.success === 0) return 0;
  const successRate = Math.round(
    (user.aggregations.success / user.aggregations.risk.high) * 100
  );
  return successRate;
};

export const getTotalStudents = (user) => {
  if (!user) return 0;
  const risk = user?.aggregations?.risk || {};
  return (risk.high || 0) + (risk.medium || 0) + (risk.low || 0);
};

export const exportInstituteTableCSV = (tableId, tableName = "data") => {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.querySelectorAll("tr"));
  const csv = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      return cells.map((cell) => `"${cell.innerText}"`).join(",");
    })
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${tableName}.csv`);
};
