// Select the container div from HTML
const container = document.getElementById("requests-container");

// Fetch exchange requests from backend
async function fetchRequests() {
  try {
    const response = await fetch("/api/exchange/requests");
    const requests = await response.json();

    container.innerHTML = ""; // Clear previous content

    // Display each request as a card
    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <p><strong>Requester:</strong> ${req.requester}</p>
        <p><strong>Item:</strong> ${req.item}</p>
        <p><strong>Offered Item:</strong> ${req.offeredItem || "N/A"}</p>
        <p><strong>Message:</strong> ${req.message}</p>
        <p><strong>Status:</strong> ${req.status}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching requests:", err);
  }
}

// Call fetchRequests() when page loads
document.addEventListener("DOMContentLoaded", fetchRequests);
