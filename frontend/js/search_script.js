
const container = document.getElementById("results"); 
const countDisplay = document.getElementById("count");

const itemModal = document.getElementById("itemModal");
const closeBtn = document.querySelector(".modal-content .close-button");


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


async function showItemModal(itemId) {
    try {
        const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
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
                ? `<img src="${item.images[0]}" alt="${item.title}" style="max-width:100%; height:auto; border-radius: 8px;">`
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

        let url = `http://localhost:5000/api/items`; // Start without userId in QS unless necessary

        if (queryString) {
            url += `?${queryString}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        console.log("📦 Received items:", data.data);

        if (res.ok && data.success) {
            // 🟢 FIX 2: Ensure the container is available before rendering
            if (container) {
                 renderCards(data.data || [], container);
            } else {
                 console.error("Card container element not found. Check ID 'results'.");
            }
           
            countDisplay.textContent = `${data.data.length} items available`;
        } else {
            console.error("Failed to fetch items:", data.error || data.message || "Unknown error");
            if (container) container.innerHTML = `<p class="error-message">Failed to load items: ${data.error || data.message || "Server Error"}</p>`;
        }
    } catch (err) {
        console.error("Network error:", err);
         if (container) container.innerHTML = `<p class="error-message">Network connection failed. Is the server running?</p>`;
    }
}

// ---------------------------------------------
// 5. Filter & Search Logic (Consolidated and Simplified)
// ---------------------------------------------
async function handleFilterAndSearch() {
    try {
        const filters = {};

        // a. Text Search & Locality (Backend expects 'location' for pincode/locality)
        const searchKeyword = document.getElementById("search").value.trim();
        if (searchKeyword) filters.search = searchKeyword;

        // 🟢 FIX 3: Change 'locality' to 'location' to match itemController.js
        const searchLocality = document.getElementById("pincode").value.trim();
        if (searchLocality) filters.location = searchLocality; 

        // b. Select Boxes (Category and Community)
        const selectedCategory = document.getElementById("category").value;
        if (selectedCategory && selectedCategory !== "All Categories")
            filters.category = selectedCategory;

        const selectedCommunity = document.getElementById("community").value;
        if (selectedCommunity && selectedCommunity !== "All Communities")
            filters.community = selectedCommunity;

        // c. Checkboxes (Exchange Type) - 🟢 NOTE: Back-end expects 'listingType'
        const typeFilters = [];
        const freebieCheckbox = document.getElementById("freebie");
        const barterCheckbox = document.getElementById("barter");

        if (freebieCheckbox && freebieCheckbox.checked) typeFilters.push("Freebie");
        if (barterCheckbox && barterCheckbox.checked) typeFilters.push("Barter");

        // The itemController only checks for a single 'listingType', 
        // so filtering by multiple types (Freebie OR Barter) requires backend change.
        // For now, we'll only use the first type or you'll need to update your backend.
        // Assuming your backend is NOT set up for multi-value filtering yet:
        if (typeFilters.length > 0) {
            filters.listingType = typeFilters[0]; // Sending only the first one
        }
        
        // d. Checkboxes (Condition) - 🟢 NOTE: Back-end expects 'itemCondition'
        const conditionFilters = [];
        const newCheckbox = document.getElementById("new");
        const usedCheckbox = document.getElementById("used");

        if (newCheckbox && newCheckbox.checked) conditionFilters.push("New");
        if (usedCheckbox && usedCheckbox.checked) conditionFilters.push("Used");
        
        // Similar to types, assuming single filter:
        if (conditionFilters.length > 0) {
            filters.itemCondition = conditionFilters[0];
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
// Both buttons should trigger the consolidated search/filter function
document
    .getElementById("searchBtn")
    .addEventListener("click", handleFilterAndSearch);
document
    .getElementById("applyFilters")
    .addEventListener("click", handleFilterAndSearch);

// 🟢 FIX 4: Simplified Clear Filters logic to reset ALL inputs
document.getElementById("clearFilters").addEventListener("click", () => {
    // Reset all filter inputs on the page
    
    // Checkboxes
    const freebie = document.getElementById("freebie");
    if(freebie) freebie.checked = false;
    const barter = document.getElementById("barter");
    if(barter) barter.checked = false;
    const newCond = document.getElementById("new");
    if(newCond) newCond.checked = false;
    const usedCond = document.getElementById("used");
    if(usedCond) usedCond.checked = false;

    // Text Inputs
    document.getElementById("search").value = "";
    document.getElementById("pincode").value = "";
    
    // Select Boxes (Resetting to first option/default value)
    document.getElementById("category").value = "All Categories";
    document.getElementById("community").value = "All Communities";
    
    // Rerun fetchAllItems with no query string to show all products
    fetchAllItems();
});

// Attach change listeners to select boxes and checkboxes to also trigger the filter immediately
// Ensure these IDs exist in your HTML if you want immediate filtering!
if (document.getElementById("category")) document.getElementById("category").addEventListener("change", handleFilterAndSearch);
if (document.getElementById("community")) document.getElementById("community").addEventListener("change", handleFilterAndSearch);
if (document.getElementById("freebie")) document.getElementById("freebie").addEventListener("change", handleFilterAndSearch);
if (document.getElementById("barter")) document.getElementById("barter").addEventListener("change", handleFilterAndSearch);
if (document.getElementById("new")) document.getElementById("new").addEventListener("change", handleFilterAndSearch);
if (document.getElementById("used")) document.getElementById("used").addEventListener("change", handleFilterAndSearch);

// Redirect to listing page when Give/Barter button is clicked
document.querySelector(".give-btn").addEventListener("click", () => {
    window.location.href = "listing.html";
});

// ---------------------------------------------
// 7. Exchange Request Handlers (Unchanged, as they were correct)
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
            "http://localhost:5000/api/exchange-requests",
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

// Initial Load on page fully loading
document.addEventListener("DOMContentLoaded", fetchAllItems);


// Clear the new listing flag if present (used to trigger refresh on My Listings page)
if (localStorage.getItem("newListingPosted") === "true") {
    localStorage.removeItem("newListingPosted");
}