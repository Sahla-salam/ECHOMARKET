// Function to toggle between forms
function showForm(formId) {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("forgotForm").classList.add("hidden");
    document.getElementById(formId).classList.remove("hidden");
}


async function signup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    // Password Regular Expression: Requires 8+ chars, 1 uppercase, 1 lowercase, 1 digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    // 🔴 REGEX VALIDATION ADDED HERE
    if (!passwordRegex.test(password)) {
        alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
        return;
    }

    // Attempt to register the user via the backend API (Recommended for security)
    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Account created successfully! Please log in.");
            showForm("loginForm");
        } else {
            // Handle specific errors like email already exists
            alert(" Sign up failed: " + (result.message || "Please check your server connection."));
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("A network error occurred. Please check if the server is running.");
    }

  } 
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Save token and user ID upon successful login
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", result.data.id);
            localStorage.setItem("userName", result.data.name); 
            
            alert("Welcome, " + result.data.name + "!");
            window.location.href = "search.html";
        } else {
            alert("❌ Invalid email or password. " + (result.message || "Please try again."));
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("A network error occurred. Please check your server connection.");
    }
    
  } 

function resetPassword() {
    const email = document.getElementById("forgotEmail").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email);

    if (user) {
        alert("Your password is: " + user.password); 
    } else {
        alert("No account found with that email.");
    }
}