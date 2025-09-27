// user-login.js (CORRECTED CODE)

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

    // ✅ JWT STORAGE BEST PRACTICE (Assuming your standard login returns data.token)
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id); // Store ID
    localStorage.setItem("userName", data.user.name || data.user.email); // Store Name
    localStorage.setItem("userType", "user"); // Keep this if needed

    alert("Login successful!");

    // REDIRECT
    window.location.href = "./user-dashboard.html";

  } catch (err) {
    alert("Error: " + err.message);
  }
});


// --- GOOGLE SIGN-IN HANDLER ---

/**
 * This function is called automatically by the Google Sign-In library 
 * after a user successfully signs in with Google.
 * @param {object} response - The credential response object from Google.
 */
async function handleGoogleLogin(response) {
  // The 'credential' field contains the secure ID token (JWT)
  const idToken = response.credential;

  try {
    // Send the ID token to your server for validation and login/signup
    const res = await fetch("http://localhost:5000/api/users/google-login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      // Send the token as the payload
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Google login failed");
    }

    // Server successfully validated the token and logged the user in/signed them up
    // ✅ THIS IS THE CRITICAL CHANGE: Store the JWT and user data separately
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name || data.user.email);
    localStorage.setItem("userType", "user"); // Keep this if needed

    alert("Google Login successful!");

    // REDIRECT
    window.location.href = "./user-dashboard.html";

  } catch (err) {
    alert("Error: " + err.message);
  }
}