// user-login.js (UPDATED FOR ROLE-BASED REDIRECTION)

// Helper function to handle redirection based on role
function redirectToDashboard(role, data) {
    let redirectURL = './user-dashboard.html';
    
    // Store necessary data before redirecting
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name || data.user.email);
    localStorage.setItem("userType", role); // Store the determined role

    if (role === 'admin') {
        redirectURL = './admin-dashboard.html';
    } else if (role === 'vendor') {
        redirectURL = './vendor-dashboard.html';
    } 
    
    alert(`${role.toUpperCase()} Login successful! Redirecting...`);
    window.location.href = redirectURL;
}


// --- STANDARD EMAIL/PASSWORD LOGIN ---

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // ✅ NEW: Extract role and redirect
    const userRole = data.user.role || 'user'; // Default to 'user'
    redirectToDashboard(userRole, data); // Call the new handler

  } catch (err) {
    alert("Error: " + err.message);
  }
});


// --- GOOGLE SIGN-IN HANDLER ---

/**
 * This function is called automatically by the Google Sign-In library 
 * after a user successfully signs in with Google.
 */
async function handleGoogleLogin(response) {
  const idToken = response.credential;

  try {
    const res = await fetch("http://localhost:5000/api/users/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Google login failed");
    }

    // ✅ NEW: Extract role and redirect
    const userRole = data.user.role || 'user'; // Default to 'user'
    redirectToDashboard(userRole, data); // Call the new handler

  } catch (err) {
    alert("Error: " + err.message);
  }
}