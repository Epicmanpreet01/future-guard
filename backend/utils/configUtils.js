export const normalize = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
