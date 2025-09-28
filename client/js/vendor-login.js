// js/vendor-login.js (UPDATED FOR JWT AND BACKEND COMMUNICATION)

// Helper function to handle redirection and JWT storage
function redirectToVendorDashboard(data) {
    // Store necessary data using standard JWT keys
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name || data.user.email);
    localStorage.setItem("userType", data.user.role); // 'vendor'
    // Store the specific category for dashboard content logic
    localStorage.setItem("vendorCategory", data.user.category); 

    alert(`Vendor Login successful! Welcome, ${data.user.name || data.user.email}. Redirecting...`);
    window.location.href = 'vendor-dashboard.html';
}

document.querySelector(".otp-btn")?.addEventListener("click", () => {
  alert("OTP login functionality is under development.");
});

document.querySelector(".google-btn")?.addEventListener("click", () => {
  alert("Google login will be integrated soon.");
});

document.getElementById("vendorLoginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  // The name="email" in the HTML is used for email/mobile login
  const email = form.email.value.trim(); 
  const password = form.password.value;
  
  if (!email || !password) {
    alert("Please fill both email/mobile and password fields.");
    return;
  }

  try {
    // Post to the new vendor login endpoint
    const res = await fetch("http://localhost:5000/api/users/vendor-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || 'Login failed. Check your email/password and if you are registered as a vendor.');
    }

    redirectToVendorDashboard(data);

  } catch (err) {
    alert("Error: " + err.message);
  }
});