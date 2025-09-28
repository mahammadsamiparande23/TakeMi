// js/user-signup.js (UPDATED FOR JWT AND REDIRECTION)

// Helper function to handle redirection based on role
function redirectToDashboard(data) {
    const role = data.user.role || 'user'; 

    // Store necessary data before redirecting
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name || data.user.email);
    localStorage.setItem("userType", role); 

    let redirectURL = './user-dashboard.html';
    
    if (role === 'admin') {
        redirectURL = './admin-dashboard.html';
    } else if (role === 'vendor') {
        redirectURL = './vendor-dashboard.html';
    } 
    
    alert(`Signup successful! Welcome, ${data.user.name || data.user.email}. Redirecting...`);
    window.location.href = redirectURL;
}

// --- STANDARD EMAIL/PASSWORD SIGNUP ---

document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const mobile = form.mobile.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, mobile, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }
    
    redirectToDashboard(data); // Handle JWT storage and redirection

  } catch (err) {
    alert("Error: " + err.message);
  }
});

document.querySelector(".google-btn")?.addEventListener("click", () => {
  alert("Google Signup functionality uses the same backend endpoint as Google Login. Integration coming soon.");
});