const container = document.getElementById("requests-container");

// ✅ Fetch and display requests for the logged-in user
async function fetchRequests() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      container.innerHTML = "<p>Please login to view exchange requests.</p>";
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/exchange-requests?userId=${userId}`);
    const data = await response.json();

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; background: white; border-radius: 8px;">
          <h3>No exchange requests yet</h3>
          <p>When someone requests your items or you request others' items, they will appear here.</p>
        </div>
      `;
      return;
    }
    
    data.forEach((req) => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-id", req._id); // Store ID on the card
      
      const userId = localStorage.getItem("userId");
      const isOwner = req.itemOwnerId === userId; // Check if current user is the item owner
      const requestDate = new Date(req.createdAt).toLocaleString();
      
      let statusColor = req.status === 'Accepted' ? 'green' : 
                        req.status === 'Declined' ? 'red' : 'orange';

      card.innerHTML = `
        <p><strong>Type:</strong> <span style="background: #2563eb; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${req.requestType}</span></p>
        <p><strong>${isOwner ? 'Requester' : 'Your Request To'}:</strong> ${req.requesterName} ${isOwner ? '' : '(You)'}</p>
        <p><strong>Item:</strong> ${req.itemName}</p>
        ${req.offeredItemName ? `<p><strong>Offered Item:</strong> ${req.offeredItemName}</p>` : ''}
        <p><strong>Message:</strong> ${req.message}</p>
        ${req.requesterEmail ? `<p><strong>Contact:</strong> ${req.requesterEmail}</p>` : ''}
        <p><strong>Date:</strong> ${requestDate}</p>
        <p class="status"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${req.status}</span></p>
        ${isOwner && req.status === 'Pending' ? `
          <div style="margin-top: 10px;">
            <button class="btn btn-accept" onclick="updateStatus('${req._id}', 'Accepted')">Accept</button>
            <button class="btn btn-decline" onclick="updateStatus('${req._id}', 'Declined')">Decline</button>
          </div>
        ` : ''}
        ${!isOwner ? `<p style="font-size: 12px; color: #666; margin-top: 10px;"><em>Waiting for response from owner...</em></p>` : ''}
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
}

// ✅ Update the status both in DB and on screen
async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`http://localhost:5000/api/exchange-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      const card = document.querySelector(`[data-id='${id}']`);
      const statusSpan = card.querySelector(".status span");

      // 🟢 Update UI immediately
      statusSpan.textContent = newStatus;
      statusSpan.style.color = newStatus === "Accepted" ? "green" : "red";

      // 🪄 Show confirmation message
      alert(`Request ${newStatus === "Accepted" ? "accepted ✅" : "declined ❌"}`);

    } else {
      alert("Failed to update status 😕");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Something went wrong while updating.");
  }
}

// Refresh requests function (called by the refresh button)
function refreshRequests() {
  fetchRequests();
}

// Load the requests when the page opens
fetchRequests();
