// Switch between forms
function showForm(formId) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.add("hidden");
  document.getElementById(formId).classList.remove("hidden");
}

// Sign Up
function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(user => user.email === email)) {
    alert("Email already registered!");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully!");
  showForm("loginForm");
}0

// Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.email === email && u.password === password);

  if (user) {
    alert("Welcome, " + user.name + "!");
    window.location.href = "search.html";
  } else {
    alert("Invalid email or password");
  }
}

// Forgot Password
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
