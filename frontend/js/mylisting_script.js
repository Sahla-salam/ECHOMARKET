// My Listings Page Script

const myListingsContainer = document.getElementById("myListings");
const countDisplay = document.getElementById("count");

const itemModal = document.getElementById("itemModal");
const closeBtn = document.querySelector(".modal-content .close-button");

// Close modal when X is clicked
if (closeBtn) {
  closeBtn.onclick = function () {
    itemModal.style.display = "none";
  };
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target == itemModal) {
    itemModal.style.display = "none";
  }
};

// ---------------------------------------------
// Show Item Modal
// ---------------------------------------------
async function showItemModal(itemId) {
  try {
    const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.error || "Could not fetch item details.");
    const item = result.data;

    // Populate modal content
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-description").textContent = item.description;
    document.getElementById("modal-condition").textContent = item.itemCondition;
    document.getElementById("modal-type").textContent = item.listingType;
    document.getElementById("modal-category").textContent = item.category || "N/A";
    document.getElementById("modal-location").textContent = item.location || "N/A";
    document.getElementById("modal-community").textContent = item.community || "N/A";
    document.getElementById("modal-expiry").textContent = item.expiryDate
      ? new Date(item.expiryDate).toLocaleDateString()
      : "N/A";

    // Handle Barter Preferences
    const barterPrefSection = document.getElementById("modal-barter-section");
    if (item.listingType === "Barter" && item.barterPreferences) {
      document.getElementById("modal-barter-text").textContent = item.barterPreferences;
      barterPrefSection.style.display = "block";
    } else {
      barterPrefSection.style.display = "none";
    }

    // Display image
    const gallery = document.getElementById("modal-image-gallery");
    gallery.innerHTML =
      item.images && item.images.length
        ? `<img src="${item.images[0]}" alt="${item.title}" style="max-width:100%; height:auto; border-radius: 8px;">`
        : `<p>No image available.</p>`;

    // Attach item ID to action buttons
    document.getElementById("editItemBtn").setAttribute("data-item-id", itemId);
    document.getElementById("deleteItemBtn").setAttribute("data-item-id", itemId);

    // Display the Modal
    itemModal.style.display = "block";
  } catch (error) {
    console.error("Error showing item modal:", error);
    alert("Failed to load item details.");
  }
}

// ---------------------------------------------
// Render Cards
// ---------------------------------------------
function renderCards(data, containerElement) {
  containerElement.innerHTML = "";
  
  if (data.length === 0) {
    containerElement.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #fff;">
        <h3>No listings yet</h3>
        <p>You haven't posted any items yet. Click "+ Give/Barter" to create your first listing!</p>
      </div>
    `;
    return;
  }
  
  data.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-item-id", item._id);

    const imageHtml = item.images?.length
      ? `<div class="card-image-wrapper"><img src="${item.images[0]}" alt="${item.title}" class="card-img"/></div>`
      : "";

    card.innerHTML = `
            ${imageHtml}
            <span class="tag ${item.listingType?.toLowerCase() || ""}">${item.listingType}</span>
            <h3>${item.title}</h3>
            <p><b>Category:</b> ${item.category || "N/A"}</p>
            <p><b>Condition:</b> ${item.itemCondition || "N/A"}</p>
            <p><b>Location:</b> ${item.location || "N/A"}</p>
            <p><b>Community:</b> ${item.community || "N/A"}</p>
            <p><b>Posted:</b> ${new Date(item.createdAt).toLocaleDateString()}</p>
        `;
    containerElement.appendChild(card);
  });

  // Attach click listeners to all rendered cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-item-id");
      showItemModal(itemId);
    });
  });
}

// ---------------------------------------------
// Fetch My Listings
// ---------------------------------------------
async function fetchMyListings() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      myListingsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #fff;">
          <h3>Please login first</h3>
          <p>You need to be logged in to view your listings.</p>
          <button onclick="window.location.href='index.html'" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px;">Go to Login</button>
        </div>
      `;
      countDisplay.textContent = "Not logged in";
      return;
    }

    console.log("📋 Fetching my listings for userId:", userId);

    const res = await fetch(`http://localhost:5000/api/items/my-listings?userId=${userId}`);
    const data = await res.json();
    console.log("✅ My listings:", data.data);

    if (res.ok) {
      renderCards(data.data || [], myListingsContainer);
      countDisplay.textContent = `${data.data.length} item${data.data.length !== 1 ? 's' : ''} listed`;
    } else {
      console.error("Failed to fetch my listings:", data.error);
      myListingsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #fff;">
          <h3>Error loading listings</h3>
          <p>${data.error || "Failed to fetch listings"}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Network error:", err);
    myListingsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #fff;">
        <h3>Connection Error</h3>
        <p>Could not connect to server. Please check if the server is running.</p>
      </div>
    `;
  }
}

// ---------------------------------------------
// Button Handlers (Edit/Delete)
// ---------------------------------------------
document.getElementById("editItemBtn").addEventListener("click", function() {
  const itemId = this.getAttribute("data-item-id");
  alert(`Edit functionality coming soon for item: ${itemId}`);
  // TODO: Implement edit functionality
});

document.getElementById("deleteItemBtn").addEventListener("click", async function() {
  const itemId = this.getAttribute("data-item-id");
  
  if (!confirm("Are you sure you want to delete this listing?")) {
    return;
  }
  
  alert(`Delete functionality coming soon for item: ${itemId}`);
  // TODO: Implement delete functionality
  // After successful deletion, refresh the listings
  // itemModal.style.display = "none";
  // fetchMyListings();
});

// Initial Load
fetchMyListings();

// Show success message if redirected after posting a new listing
if (localStorage.getItem("newListingPosted") === "true") {
  localStorage.removeItem("newListingPosted");
  // The alert is already shown from the listing form, so just refresh
}

