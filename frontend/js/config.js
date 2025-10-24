// API Configuration
// This file manages the backend API URL based on environment

const API_CONFIG = {
    // Change this to your deployed backend URL after deployment
    BACKEND_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://echomarket-backend.onrender.com', // Replace with your actual Render URL
    
    // Helper function to get full API URL
    getApiUrl: function(endpoint) {
        return `${this.BACKEND_URL}${endpoint}`;
    }
};

// Make it available globally
window.API_CONFIG = API_CONFIG;

