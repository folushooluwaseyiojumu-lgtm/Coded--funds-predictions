// Update "Last Updated"
const lastUpdated = document.getElementById("lastUpdated");

if (lastUpdated) {
  const now = new Date();

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };

  lastUpdated.textContent = now.toLocaleString("en-GB", options);
}