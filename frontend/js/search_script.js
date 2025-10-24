// ---------------------------------------------
// 0. User Authentication & Display
// ---------------------------------------------
// Display username and check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  
  // Check if user is logged in
  if (!username || !userId) {
    alert('⚠️ Please login first!');
    window.location.href = 'index.html';
    return;
  }
  
  // Display username in greeting
  const userGreeting = document.getElementById('user-greeting');
  if (userGreeting) {
    userGreeting.textContent = `Hi, ${username}!`;
  }
});

// Sign out function
function signOut() {
  const confirmed = confirm('Are you sure you want to sign out?');
  if (confirmed) {
    // Clear all stored data
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
    // Show success message
    alert('✅ Successfully signed out!');
    
    // Redirect to login page
    window.location.href = 'index.html';
  }
}

// Make signOut available globally
window.signOut = signOut;

// ---------------------------------------------
// 1. Elements & Modal Setup
// ---------------------------------------------
const container = document.getElementById("results");
const countDisplay = document.getElementById("count");

// Helper function to get full image URL
function getFullImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // If already a full URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, construct full URL with current server
  // This handles old relative paths from database
  return `http://localhost:5000${imagePath}`;
}

const itemModal = document.getElementById("itemModal");
const closeBtn = document.querySelector(".modal-content .close-button");

// Close modal when X is clicked and outside
if (closeBtn) {
  closeBtn.onclick = function () {
    itemModal.style.display = "none";
  };
}
window.onclick = function (event) {
  if (event.target == itemModal) {
    itemModal.style.display = "none";
  }
};

// ---------------------------------------------
// 2. Helper: Show Item Modal (ENHANCED for full data)
// ---------------------------------------------
async function showItemModal(itemId) {
  try {
    const res = await fetch(`https://echomarket-8ipi.onrender.com/api/items/${itemId}`);
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.error || "Could not fetch item details.");
    const item = result.data;

    // 1. Populate the Modal Content
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-description").textContent = item.description;
    document.getElementById("modal-condition").textContent = item.itemCondition;
    document.getElementById("modal-type").textContent = item.listingType;

    document.getElementById("modal-category").textContent =
      item.category || "N/A";
    document.getElementById("modal-location").textContent =
      item.location || "N/A";
    document.getElementById("modal-community").textContent =
      item.community || "N/A";

    document.getElementById("modal-expiry").textContent = item.expiryDate
      ? new Date(item.expiryDate).toLocaleDateString()
      : "N/A";

    // Handle Barter Preferences visibility
    const barterPrefSection = document.getElementById("modal-barter-section");
    if (item.listingType === "Barter" && item.barterPreferences) {
      document.getElementById("modal-barter-text").textContent =
        item.barterPreferences;
      barterPrefSection.style.display = "block";
    } else {
      barterPrefSection.style.display = "none";
    }

    // 2. Display Modal Image
    const gallery = document.getElementById("modal-image-gallery");
    gallery.innerHTML =
      item.images && item.images.length
        ? `<img src="${getFullImageUrl(item.images[0])}" alt="${item.title}" style="max-width:100%; height:auto; border-radius: 8px;">`
        : `<p>No image available.</p>`;

    // 3. Attach item ID to buttons for future action
    document
      .getElementById("contactSellerBtn")
      .setAttribute("data-item-id", itemId);
    document
      .getElementById("contactSellerBtn")
      .setAttribute("data-item-owner-id", item.owner);
    document
      .getElementById("contactSellerBtn")
      .setAttribute("data-item-name", item.title);

    document
      .getElementById("requestItemBtn")
      .setAttribute("data-item-id", itemId);
    document
      .getElementById("requestItemBtn")
      .setAttribute("data-item-owner-id", item.owner);
    document
      .getElementById("requestItemBtn")
      .setAttribute("data-item-name", item.title);

    // 4. Display the Modal
    itemModal.style.display = "block";
  } catch (error) {
    console.error("Error showing item modal:", error);
    alert("Failed to load item details.");
  }
}

// ---------------------------------------------
// 3. Render Cards Function (Includes Modal Click Handler)
// ---------------------------------------------
function renderCards(data, containerElement) {
  containerElement.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-item-id", item._id);

    const imageHtml = item.images?.length
      ? `<div class="card-image-wrapper"><img src="${getFullImageUrl(item.images[0])}" alt="${item.title}" class="card-img"/></div>`
      : "";

    card.innerHTML = `
            ${imageHtml}
            <span class="tag ${item.listingType?.toLowerCase() || ""}">${
      item.listingType
    }</span>
            <h3>${item.title}</h3>
            <p><b>Category:</b> ${item.category || "N/A"}</p>
            <p><b>Condition:</b> ${item.itemCondition || "N/A"}</p>
            <p><b>Location:</b> ${item.location || "N/A"}</p>
            <p><b>Community:</b> ${item.community || "N/A"}</p>
        `;
    containerElement.appendChild(card);
  });

  // Attach click listeners to all rendered cards for modal functionality
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-item-id");
      showItemModal(itemId);
    });
  });
}

// ---------------------------------------------
// 4. Fetch All Items (Base function for API calls)
// ---------------------------------------------
async function fetchAllItems(queryString = "") {
  try {
    const userId = localStorage.getItem("userId");
    console.log("🔍 Fetching all items. Current userId:", userId);

    let url = `https://echomarket-8ipi.onrender.com/api/items?userId=${userId}`;

    if (queryString) {
      url += `&${queryString}`;
    }

    console.log("🌐 Fetching from URL:", url);
    const res = await fetch(url);
    console.log("📡 Response status:", res.status, res.statusText);
    
    const data = await res.json();
    console.log("📦 Received data:", data);
    console.log("📦 Items array:", data.data);
    console.log("📦 Number of items:", data.data ? data.data.length : 0);

    if (res.ok) {
      renderCards(data.data || [], container);
      countDisplay.textContent = `${data.data ? data.data.length : 0} items available`;
    } else {
      console.error("Failed to fetch items:", data.error);
      alert("Error loading items: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Network error:", err);
    alert("Network error: " + err.message);
  }
}

// ---------------------------------------------
// 5. Filter & Search Logic (Consolidated and Simplified)
// ---------------------------------------------
async function handleFilterAndSearch() {
  try {
    const filters = {};

    // a. Text Search & Locality
    const searchKeyword = document.getElementById("search").value;
    if (searchKeyword) filters.search = searchKeyword;

    const searchLocality = document.getElementById("pincode").value;
    if (searchLocality) filters.locality = searchLocality;

    // b. Select Boxes (Category and Community)
    const selectedCategory = document.getElementById("category").value;
    if (selectedCategory && selectedCategory !== "All Categories")
      filters.category = selectedCategory;

    const selectedCommunity = document.getElementById("community").value;
    if (selectedCommunity && selectedCommunity !== "All Communities")
      filters.community = selectedCommunity;

    // c. Checkboxes (Exchange Type) - Now the only source for 'type' filter
    const typeFilters = [];
    if (document.getElementById("freebie").checked) typeFilters.push("Freebie");
    if (document.getElementById("barter").checked) typeFilters.push("Barter");

    if (typeFilters.length > 0) {
      filters.type = typeFilters.join(",");
    }

    // d. Checkboxes (Condition) - Now the only source for 'condition' filter
    const conditionFilters = [];
    if (document.getElementById("new").checked) conditionFilters.push("New");
    if (document.getElementById("used").checked) conditionFilters.push("Used");

    if (conditionFilters.length > 0) {
      filters.condition = conditionFilters.join(",");
    }

    // --- 2. Construct Query String ---
    const queryString = new URLSearchParams(filters).toString();

    // --- 3. Fetch Filtered Items from Backend ---
    await fetchAllItems(queryString);
  } catch (err) {
    console.error("Filtering error:", err);
  }
}

// ---------------------------------------------
// 6. Event Listeners & Initial Load
// ---------------------------------------------
document
  .getElementById("searchBtn")
  .addEventListener("click", handleFilterAndSearch);
document
  .getElementById("applyFilters")
  .addEventListener("click", handleFilterAndSearch);

// Simplified Clear Filters logic
document.getElementById("clearFilters").addEventListener("click", () => {
  // Reset all filter inputs on the page
  document.getElementById("freebie").checked = false;
  document.getElementById("barter").checked = false;
  document.getElementById("new").checked = false;
  document.getElementById("used").checked = false;
  document.getElementById("search").value = "";
  document.getElementById("pincode").value = "";
  document.getElementById("category").value = "All Categories";
  // NOTE: Removed references to the deleted 'type' and 'condition' select boxes
  document.getElementById("community").value = "All Communities";

  // Rerun fetchAllItems with no query string
  fetchAllItems();
});

// Attach change listeners to select boxes and checkboxes to also trigger the filter immediately
document
  .getElementById("category")
  .addEventListener("change", handleFilterAndSearch);
document
  .getElementById("community")
  .addEventListener("change", handleFilterAndSearch);
document
  .getElementById("freebie")
  .addEventListener("change", handleFilterAndSearch);
document
  .getElementById("barter")
  .addEventListener("change", handleFilterAndSearch);
document
  .getElementById("new")
  .addEventListener("change", handleFilterAndSearch);
document
  .getElementById("used")
  .addEventListener("change", handleFilterAndSearch);

// Redirect to listing page when Give/Barter button is clicked
document.querySelector(".give-btn").addEventListener("click", () => {
  window.location.href = "listing.html";
});

// ---------------------------------------------
// 7. Exchange Request Handlers
// ---------------------------------------------
async function createExchangeRequest(
  itemId,
  itemName,
  itemOwnerId,
  requestType
) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login to make a request");
    window.location.href = "index.html";
    return;
  }

  // Check if trying to request own item
  if (userId === itemOwnerId) {
    alert("You cannot request your own item!");
    return;
  }

  // Get message from user
  const message = prompt(
    requestType === "Claim"
      ? "Enter your message to claim this item:"
      : "Enter your message to contact the seller:",
    "Hi, I'm interested in this item."
  );

  if (!message || message.trim() === "") {
    alert("Message is required!");
    return;
  }

  // For barter items, ask if they want to offer something
  let offeredItemName = null;
  const shouldAskOffer = confirm(
    "Would you like to offer something in exchange? (Click Cancel if not)"
  );
  if (shouldAskOffer) {
    offeredItemName = prompt("What would you like to offer in exchange?");
  }

  try {
    const response = await fetch(
      "https://echomarket-8ipi.onrender.com/api/exchange-requests",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: userId,
          itemId: itemId,
          itemName: itemName,
          itemOwnerId: itemOwnerId,
          requestType: requestType,
          message: message.trim(),
          offeredItemName: offeredItemName ? offeredItemName.trim() : null,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("✅ " + result.message);
      itemModal.style.display = "none"; // Close modal
    } else {
      alert("❌ " + result.message);
    }
  } catch (error) {
    console.error("Error creating exchange request:", error);
    alert("Failed to send request. Please check your connection.");
  }
}

// Attach event listeners to modal buttons
document
  .getElementById("requestItemBtn")
  .addEventListener("click", function () {
    const itemId = this.getAttribute("data-item-id");
    const itemName = this.getAttribute("data-item-name");
    const itemOwnerId = this.getAttribute("data-item-owner-id");
    createExchangeRequest(itemId, itemName, itemOwnerId, "Claim");
  });

document
  .getElementById("contactSellerBtn")
  .addEventListener("click", function () {
    const itemId = this.getAttribute("data-item-id");
    const itemName = this.getAttribute("data-item-name");
    const itemOwnerId = this.getAttribute("data-item-owner-id");
    createExchangeRequest(itemId, itemName, itemOwnerId, "Contact");
  });

// Initial Load
fetchAllItems();

// Clear the new listing flag if present (used to trigger refresh on My Listings page)
if (localStorage.getItem("newListingPosted") === "true") {
  localStorage.removeItem("newListingPosted");
}
