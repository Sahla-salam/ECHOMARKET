// User Authentication & Display
document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  
  if (!username || !userId) {
    alert('⚠️ Please login first!');
    window.location.href = 'index.html';
    return;
  }
  
  const userGreeting = document.getElementById('user-greeting');
  if (userGreeting) {
    userGreeting.textContent = `Hi, ${username}!`;
  }
});

// Sign out function
function signOut() {
  const confirmed = confirm('Are you sure you want to sign out?');
  if (confirmed) {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    alert('✅ Successfully signed out!');
    window.location.href = 'index.html';
  }
}
window.signOut = signOut;

const incomingContainer = document.getElementById("incoming-container");
const outgoingContainer = document.getElementById("outgoing-container");
let allRequests = []; // Store all requests globally

// Helper function to create a request card
function createRequestCard(req, isOwner, userId) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", req._id);
  
  const requestDate = new Date(req.createdAt).toLocaleString();
  let statusColor = req.status === 'Accepted' ? 'green' : 
                    req.status === 'Declined' ? 'red' : 'orange';

  card.innerHTML = `
    <div style="background: ${isOwner ? '#e8f5e9' : '#e3f2fd'}; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
      <strong style="color: ${isOwner ? '#28a745' : '#2563eb'};">
        ${isOwner ? '📥 INCOMING REQUEST' : '📤 OUTGOING REQUEST'}
      </strong>
    </div>
    <p><strong>Type:</strong> <span style="background: #2563eb; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${req.requestType}</span></p>
    <p><strong>${isOwner ? 'From' : 'To'}:</strong> ${isOwner ? req.requesterName : (req.itemOwnerName || 'Item Owner')}</p>
    <p><strong>Item:</strong> ${req.itemName}</p>
    ${req.offeredItemName ? `<p><strong>Offered in Exchange:</strong> ${req.offeredItemName}</p>` : ''}
    <p><strong>Message:</strong> "${req.message}"</p>
    ${isOwner && req.requesterEmail ? `<p><strong>Contact Email:</strong> ${req.requesterEmail}</p>` : ''}
    <p><strong>Date:</strong> ${requestDate}</p>
    <p class="status"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; font-size: 16px;">${req.status.toUpperCase()}</span></p>
    ${isOwner && req.status === 'Pending' ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee;">
        <p style="margin-bottom: 10px; font-weight: 600;">⚡ Action Required:</p>
        <button class="btn btn-accept" onclick="updateStatus('${req._id}', 'Accepted')">✅ Accept Request</button>
        <button class="btn btn-decline" onclick="updateStatus('${req._id}', 'Declined')">❌ Decline Request</button>
      </div>
    ` : ''}
    ${!isOwner && req.status === 'Pending' ? `<p style="font-size: 13px; color: #666; margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 4px;"><strong>⏳ Status:</strong> Waiting for owner's response...</p>` : ''}
    ${!isOwner && req.status === 'Accepted' ? `<p style="font-size: 13px; color: green; margin-top: 10px; padding: 10px; background: #d4edda; border-radius: 4px;"><strong>🎉 Great news!</strong> Your request was accepted. The owner will contact you soon!</p>` : ''}
    ${!isOwner && req.status === 'Declined' ? `<p style="font-size: 13px; color: #856404; margin-top: 10px; padding: 10px; background: #f8d7da; border-radius: 4px;"><strong>😔 Sorry,</strong> This request was declined by the owner.</p>` : ''}
  `;

  return card;
}

// Switch between tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabName + '-container').classList.add('active');
}

// Render requests for a specific container
function renderRequests(requests, containerElement, isIncoming, userId) {
  containerElement.innerHTML = "";
  
  if (requests.length === 0) {
    containerElement.innerHTML = `
      <div style="padding: 60px; text-align: center; background: white; border-radius: 8px;">
        <h3 style="color: #666; font-size: 24px; margin: 0;">Nothing to see here</h3>
        <p style="color: #999; margin-top: 10px;">${isIncoming ? 'No one has requested your items yet' : "You haven't made any requests yet"}</p>
      </div>
    `;
    return;
  }
  
  requests.forEach((req) => {
    const card = createRequestCard(req, isIncoming, userId);
    containerElement.appendChild(card);
  });
}

// ✅ Fetch and display requests for the logged-in user
async function fetchRequests() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      incomingContainer.innerHTML = "<p>Please login to view exchange requests.</p>";
      outgoingContainer.innerHTML = "<p>Please login to view exchange requests.</p>";
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/exchange-requests?userId=${userId}`);
    const data = await response.json();

    console.log("📊 All requests received:", data);
    console.log("👤 Current userId:", userId);
    
    // Store globally
    allRequests = data;
    
    // Separate requests into two categories
    // Convert ObjectIds to strings for comparison
    const incomingRequests = data.filter(req => {
      const ownerId = typeof req.itemOwnerId === 'object' ? req.itemOwnerId.toString() : req.itemOwnerId;
      return ownerId === userId;
    });
    
    const outgoingRequests = data.filter(req => {
      const requesterId = typeof req.requesterId === 'object' ? req.requesterId.toString() : req.requesterId;
      return requesterId === userId;
    });
    
    console.log("📥 Incoming requests:", incomingRequests.length);
    console.log("📤 Outgoing requests:", outgoingRequests.length);
    
    // Update tab badges
    document.getElementById('incoming-count').textContent = incomingRequests.length;
    document.getElementById('outgoing-count').textContent = outgoingRequests.length;
    
    // Render both tabs
    renderRequests(incomingRequests, incomingContainer, true, userId);
    renderRequests(outgoingRequests, outgoingContainer, false, userId);
    
  } catch (error) {
    console.error("Error fetching requests:", error);
    incomingContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; background: white; border-radius: 8px; color: red;">
        <h3>Error loading requests</h3>
        <p>Please check your connection and try again.</p>
      </div>
    `;
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
      // 🪄 Show confirmation message
      alert(`Request ${newStatus === "Accepted" ? "accepted ✅" : "declined ❌"}`);
      
      // Refresh the requests to update the UI
      fetchRequests();
    } else {
      alert("Failed to update status 😕");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Something went wrong while updating.");
  }
}

// Make functions globally accessible
window.switchTab = switchTab;
window.updateStatus = updateStatus;
window.refreshRequests = function() {
  fetchRequests();
};

// Load the requests when the page opens
fetchRequests();
