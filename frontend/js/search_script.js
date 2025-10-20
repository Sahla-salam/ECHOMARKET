// ---------------------------------------------
// Elements & Modal Setup
// ---------------------------------------------
const container = document.getElementById("cards");
const myListingsContainer = document.getElementById("myListings");
const countDisplay = document.getElementById("count");

const itemModal = document.getElementById("itemModal"); // New: Modal element
const closeBtn = document.querySelector(".modal-content .close-button");

// Close modal when X is clicked
if (closeBtn) {
    closeBtn.onclick = function() {
        itemModal.style.display = "none";
    }
}

// Close modal when user clicks outside of it
window.onclick = function(event) {
    if (event.target == itemModal) {
        itemModal.style.display = "none";
    }
}

// ---------------------------------------------
// Helper: Show Item Modal
// ---------------------------------------------
async function showItemModal(itemId) {
    try {
        const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || 'Could not fetch item details.');
        
        const item = result.data;
        
        // 1. Populate the Modal Content
        document.getElementById("modal-title").textContent = item.title;
        document.getElementById("modal-description").textContent = item.description;
        document.getElementById("modal-condition").textContent = item.itemCondition;
        document.getElementById("modal-type").textContent = item.listingType; // Uses new 'listingType'
        
        // Handle Barter Preferences
        const barterPrefElement = document.getElementById("modal-barter-pref");
        if (item.listingType === 'Barter' && item.barterPreferences) {
            document.getElementById("modal-barter-text").textContent = item.barterPreferences;
            barterPrefElement.style.display = 'block';
        } else {
            barterPrefElement.style.display = 'none';
        }

        // 2. Display Modal Image (Loop/set first image - simple example)
        const gallery = document.getElementById("modal-image-gallery");
        gallery.innerHTML = item.images && item.images.length ? 
            `<img src="${item.images[0]}" alt="${item.title}" style="max-width:100%; height:auto; border-radius: 8px;">` : 
            `<p>No image available.</p>`;

        // 3. Attach item ID to buttons for further action
        document.getElementById("contactSellerBtn").setAttribute("data-item-id", itemId);
        document.getElementById("requestItemBtn").setAttribute("data-item-id", itemId);

        // 4. Display the Modal
        itemModal.style.display = "block";

    } catch (error) {
        console.error("Error showing item modal:", error);
        alert("Failed to load item details.");
    }
}


// ---------------------------------------------
// Render Cards Function
// ---------------------------------------------
function renderCards(data, containerElement) {
    containerElement.innerHTML = "";
    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");
        // NEW: Add click listener to show modal and data attribute
        card.setAttribute("data-item-id", item._id); 

        card.innerHTML = `
            ${item.images?.length ? 
                `<div class="card-image-wrapper">
                    <img src="${item.images[0]}" alt="${item.title}" class="card-img"/>
                </div>` 
                : ""}
            <span class="tag ${item.listingType?.toLowerCase() || ''}">${item.listingType}</span>
            <h3>${item.title}</h3>
            <p><b>Category:</b> ${item.category || 'N/A'}</p>
            <p><b>Condition:</b> ${item.itemCondition || 'N/A'}</p>
            <p><b>Location:</b> ${item.location || 'N/A'}</p>
            <p><b>Community:</b> ${item.community || 'N/A'}</p>
        `;
        containerElement.appendChild(card);
    });

    // NEW: Attach click listeners to all rendered cards for modal functionality
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", (e) => {
            const itemId = e.currentTarget.getAttribute("data-item-id");
            showItemModal(itemId); 
        });
    });
}

// ---------------------------------------------
// Fetch All Items from Backend (No changes needed here)
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

// ---------------------------------------------
// Fetch My Listings (No changes needed here)
// ---------------------------------------------
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
// Filter & Search Logic (Updated for new schema fields)
// ---------------------------------------------
async function handleFilterAndSearch() {
    try {
        const res = await fetch("http://localhost:5000/api/items");
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Server Error");

        let items = result.data || [];

        // Get filter values
        const searchKeyword = document.getElementById("search").value.toLowerCase();
        const selectedCategory = document.getElementById("category").value;
        const selectedType = document.getElementById("type").value; // Matches filter ID
        const selectedCondition = document.getElementById("condition").value;
        // Search filter needs to be updated to match the single 'location' field
        const searchLocality = document.getElementById("pincode").value.toLowerCase(); 

        const isFreebieCB = document.getElementById("freebie").checked;
        const isBarterCB = document.getElementById("barter").checked;
        const isNewCB = document.getElementById("new").checked;
        const isUsedCB = document.getElementById("used").checked;

        const filtered = items.filter(item => {
            const matchesKeyword = item.title.toLowerCase().includes(searchKeyword) || item.description.toLowerCase().includes(searchKeyword);
            
            // UPDATED: Filter against the single 'location' field
            const matchesLocality = (item.location || '').toLowerCase().includes(searchLocality);
            
            const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;

            // UPDATED: Check against new 'listingType' field
            let matchesType;
            if (isFreebieCB || isBarterCB) {
                matchesType = (isFreebieCB && item.listingType === "Freebie") || (isBarterCB && item.listingType === "Barter");
            } else {
                matchesType = selectedType === "All Types" || item.listingType === selectedType;
            }

            let matchesCondition;
            if (isNewCB || isUsedCB) {
                matchesCondition = (isNewCB && item.itemCondition === "New") || (isUsedCB && item.itemCondition === "Used");
            } else {
                matchesCondition = selectedCondition === "Any Condition" || item.itemCondition === selectedCondition;
            }

            return matchesKeyword && matchesLocality && matchesCategory && matchesType && matchesCondition;
        });

        renderCards(filtered, container);
        countDisplay.textContent = `${filtered.length} items available`;

    } catch (err) {
        console.error("Filtering error:", err);
    }
}

// ---------------------------------------------
// Event Listeners (No changes needed here)
// ---------------------------------------------
document.getElementById("searchBtn").addEventListener("click", handleFilterAndSearch);
document.getElementById("applyFilters").addEventListener("click", handleFilterAndSearch);
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

// ---------------------------------------------
// Initial Load
// ---------------------------------------------
fetchAllItems();
if (localStorage.getItem("newListingPosted") === "true") {
    fetchMyListings(); // Refresh My Listings
    localStorage.removeItem("newListingPosted"); // Clear the flag
} else {
    fetchMyListings(); // Normal load
}