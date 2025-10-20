// frontend/listing-form.js (STREAMLINED AND CORRECTED)

// ---------------------------------------------
// Elements (Updated to match streamlined HTML IDs/Names)
// ---------------------------------------------
const form = document.getElementById("listingform");
const title = document.getElementById("title");
const description = document.getElementById("description");
const images = document.getElementById("images"); 
const category = document.getElementById("category");
const itemCondition = document.getElementById("itemCondition"); // 🔥 CORRECTED ID
const listingType = document.getElementById("listingType"); // 🔥 CORRECTED ID
const locationInput = document.getElementById("location"); // 🔥 CORRECTED ID
const pickupOption = document.getElementById("pickupOption"); // 🔥 CORRECTED ID
const community = document.getElementById("community");
const expiryDate = document.getElementById("expiryDate"); // 🔥 CORRECTED ID

const barterwrapper = document.getElementById("barterwrapper");
const barterPreferences = document.getElementById("barterPreferences"); // 🔥 CORRECTED ID

// Assuming imagewrapper is used for image preview/styling
const iwrapper = form.querySelector('.file-upload-container'); 

// ---------------------------------------------
// Conditional Field Logic (Mode/Barter/Images)
// ---------------------------------------------
function updateConditionalFields() {
    const typev = listingType.value;
    
    // 1. Barter Preferences
    if (typev === "Barter") {
        barterwrapper.style.display = 'block';
        barterPreferences.setAttribute('required', 'true');
    } else {
        barterwrapper.style.display = 'none';
        barterPreferences.removeAttribute('required');
        barterPreferences.value = ''; // Clear value when hidden
    }

    // 2. Images (If 'Request' hides images, use this logic)
    if (typev === "Request") {
        if (iwrapper) iwrapper.style.display = "none";
        images.removeAttribute('required');
    } else {
        if (iwrapper) iwrapper.style.display = 'flex'; // Or whatever display style you use
        images.setAttribute('required', 'true');
    }
}

// Attach listener to the correct element ID
if (listingType) {
    listingType.addEventListener("change", updateConditionalFields);
    updateConditionalFields(); // Run on initial load
}


// ---------------------------------------------
// Submit Handler (Corrected for streamlined schema and file upload)
// ---------------------------------------------

form.addEventListener("submit", async function (e) {
    // 🔥 CRITICAL FIX: Prevent the default form submission (which causes the reload)
    e.preventDefault();

    if (!form.checkValidity()) {
        // Allow browser to show native validation errors if any fields are empty
        form.reportValidity();
        return;
    }

    // --- Data Preparation: Use FormData directly for multipart upload ---
    const payload = new FormData();
    
    // A. Append Core Fields (Matching Mongoose Schema keys)
    payload.append("title", title.value);
    payload.append("description", description.value);
    payload.append("category", category.value);
    payload.append("itemCondition", itemCondition.value); 
    payload.append("listingType", listingType.value); 
    
    // B. Append Location and Logistics (Simplified Fields)
    payload.append("location", locationInput.value); 
    payload.append("pickupOption", pickupOption.value);
    payload.append("community", community.value);
    
    // C. Append Date
    payload.append("expiryDate", expiryDate.value); // Use 'expiryDate' schema key
    
    // D. Append Conditional Fields
    if (listingType.value === "Barter") {
        payload.append("barterPreferences", barterPreferences.value);
    }
    
    // E. Append Images (Multer will handle files under the 'images' field name)
    const files = images.files;
    for (let i = 0; i < files.length; i++) {
        payload.append("images", files[i]);
    }
    
    // F. Append TEMP_OWNER_ID 
    const TEMP_OWNER_ID = "60c72b2295d85200155b11d9"; // Replace with real authenticated user ID later
    payload.append("owner", TEMP_OWNER_ID);

    try {
        // Send the POST request
        const response = await fetch("http://localhost:5000/api/items", {
            method: "POST",
            // IMPORTANT: DO NOT set Content-Type header. The browser sets the 
            // correct 'multipart/form-data' boundary automatically for FormData.
            body: payload, 
        });

        const result = await response.json();

        // Handle the response
        if (response.ok) {
            alert("Listing Posted Successfully! 🎉");
            console.log("New Item Created:", result.data);
            
            // Cleanup and Redirect
            form.reset();
            updateConditionalFields();
            localStorage.setItem("newListingPosted", "true");
            window.location.href = "search.html";
        } else {
            console.error("Submission Failed:", result);
            alert(
                `Failed to Post: ${result.error || result.message || JSON.stringify(result)}`
            );
        }
    } catch (error) {
        console.error("Network or Fetch Error:", error);
        alert("Could not connect to the backend server. Is the server running?");
    }
});