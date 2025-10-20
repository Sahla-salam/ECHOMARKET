// index.js
// Switch between forms (Login, Signup, Forgot Password)
function showForm(formId) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.add("hidden");
  document.getElementById(formId).classList.remove("hidden");
}
