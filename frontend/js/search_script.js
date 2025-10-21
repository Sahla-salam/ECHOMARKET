// ---------------------------------------------
// 1. Elements & Modal Setup
// ---------------------------------------------
const container = document.getElementById("cards");
const myListingsContainer = document.getElementById("myListings");
const countDisplay = document.getElementById("count");

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
    const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
    const result = await res.json();
    if (!res.ok)
      throw new Error(result.error || "Could not fetch item details.");
    const item = result.data; // 1. Populate the Modal Content
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-description").textContent = item.description;
    document.getElementById("modal-condition").textContent = item.itemCondition;
    document.getElementById("modal-type").textContent = item.listingType;
    // 🟢 NEW: Populate the detailed metadata fields
    document.getElementById("modal-category").textContent =
      item.category || "N/A";
    document.getElementById("modal-location").textContent =
      item.location || "N/A";
    document.getElementById("modal-community").textContent =
      item.community || "N/A";
    // Format date, or display N/A if missing
    document.getElementById("modal-expiry").textContent = item.expiryDate
      ? new Date(item.expiryDate).toLocaleDateString()
      : "N/A"; // Handle Barter Preferences visibility (using the new correct ID)
    const barterPrefSection = document.getElementById("modal-barter-section");
    if (item.listingType === "Barter" && item.barterPreferences) {
      document.getElementById("modal-barter-text").textContent =
        item.barterPreferences;
      barterPrefSection.style.display = "block";
    } else {
      barterPrefSection.style.display = "none";
    } // 2. Display Modal Image

    const gallery = document.getElementById("modal-image-gallery");
    gallery.innerHTML =
      item.images && item.images.length
        ? `<img src="${item.images[0]}" alt="${item.title}" style="max-width:100%; height:auto; border-radius: 8px;">`
        : `<p>No image available.</p>`; // 3. Attach item ID to buttons for future action

    document
      .getElementById("contactSellerBtn")
      .setAttribute("data-item-id", itemId);
    document
      .getElementById("requestItemBtn")
      .setAttribute("data-item-id", itemId); // 4. Display the Modal

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
      ? `<div class="card-image-wrapper"><img src="${item.images[0]}" alt="${item.title}" class="card-img"/></div>`
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
  }); // Attach click listeners to all rendered cards for modal functionality

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-item-id");
      showItemModal(itemId);
    });
  });
}

// ---------------------------------------------
// 4. Fetch All Items & My Listings
// ---------------------------------------------
async function fetchAllItems() {
  try {
    const res = await fetch("http://localhost:5000/api/items");
    const data = await res.json();
    if (res.ok) {
      renderCards(data.data || [], container);
      countDisplay.textContent = `${data.data.length} items available`;
    } else {
      console.error("Failed to fetch items:", data.error);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

async function fetchMyListings() {
  try {
    const res = await fetch("http://localhost:5000/api/items/my-listings");
    const data = await res.json();
    if (res.ok) {
      renderCards(data.data || [], myListingsContainer);
    } else {
      console.error("Failed to fetch my listings:", data.error);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

// ---------------------------------------------
// 5. Filter & Search Logic
// ---------------------------------------------
async function handleFilterAndSearch() {
  try {
    const res = await fetch("http://localhost:5000/api/items");
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Server Error");

    let items = result.data || []; // Get filter values

    const searchKeyword = document.getElementById("search").value.toLowerCase();
    const selectedCategory = document.getElementById("category").value;
    const selectedType = document.getElementById("type").value;
    const selectedCondition = document.getElementById("condition").value;
    const searchLocality = document
      .getElementById("pincode")
      .value.toLowerCase();

    const isFreebieCB = document.getElementById("freebie").checked;
    const isBarterCB = document.getElementById("barter").checked;
    const isNewCB = document.getElementById("new").checked;
    const isUsedCB = document.getElementById("used").checked;

    const filtered = items.filter((item) => {
      const matchesKeyword =
        item.title.toLowerCase().includes(searchKeyword) ||
        item.description.toLowerCase().includes(searchKeyword);
      const matchesLocality = (item.location || "")
        .toLowerCase()
        .includes(searchLocality);
      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category === selectedCategory;

      let matchesType;
      if (isFreebieCB || isBarterCB) {
        matchesType =
          (isFreebieCB && item.listingType === "Freebie") ||
          (isBarterCB && item.listingType === "Barter");
      } else {
        matchesType =
          selectedType === "All Types" || item.listingType === selectedType;
      }

      let matchesCondition;
      if (isNewCB || isUsedCB) {
        matchesCondition =
          (isNewCB && item.itemCondition === "New") ||
          (isUsedCB && item.itemCondition === "Used");
      } else {
        matchesCondition =
          selectedCondition === "Any Condition" ||
          item.itemCondition === selectedCondition;
      }

      return (
        matchesKeyword &&
        matchesLocality &&
        matchesCategory &&
        matchesType &&
        matchesCondition
      );
    });

    renderCards(filtered, container);
    countDisplay.textContent = `${filtered.length} items available`;
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
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("freebie").checked = false;
  document.getElementById("barter").checked = false;
  document.getElementById("new").checked = false;
  document.getElementById("used").checked = false;
  document.getElementById("search").value = "";
  document.getElementById("pincode").value = "";
  document.getElementById("category").value = "All Categories";
  document.getElementById("type").value = "All Types";
  document.getElementById("condition").value = "Any Condition";
  renderCards([], container);
  fetchAllItems();
});

// Redirect to listing page when Give/Barter button is clicked
document.querySelector(".give-btn").addEventListener("click", () => {
  window.location.href = "listing.html";
});

// Initial Load
fetchAllItems();
if (localStorage.getItem("newListingPosted") === "true") {
  fetchMyListings(); // Refresh My Listings
  localStorage.removeItem("newListingPosted"); // Clear the flag
} else {
  fetchMyListings(); // Normal load
}
