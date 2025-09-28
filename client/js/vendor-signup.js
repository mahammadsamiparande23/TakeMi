// js/vendor-signup.js (UPDATED FOR JWT AND BACKEND COMMUNICATION)

// Helper function to handle redirection and JWT storage
function redirectToVendorDashboard(data) {
    // Store necessary data using standard JWT keys
    localStorage.setItem("userToken", data.token); 
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name || data.user.email);
    localStorage.setItem("userType", data.user.role); // 'vendor'
    // Store the specific category for dashboard content logic
    localStorage.setItem("vendorCategory", data.user.category); 

    alert(`Vendor Signup successful! Welcome, ${data.user.name}. Redirecting...`);
    window.location.href = 'vendor-dashboard.html';
}

document.getElementById("vendorSignupForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim(); // Get new email field
  const mobile = document.getElementById("mobile").value.trim();
  const shopName = document.getElementById("shopName").value.trim();
  const category = document.getElementById("categorySelect").value;
  const location = document.getElementById("location").value.trim();
  const password = document.getElementById("password").value.trim();
  // Note: File upload needs separate FormData handling, skipping for now.

  if (!category) {
    alert("Please select vendor type.");
    return;
  }

  const vendorData = { name: fullName, email, mobile, shopName, category, location, password };

  try {
    // Post to the new vendor signup endpoint
    const res = await fetch("http://localhost:5000/api/users/vendor-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || 'Vendor signup failed');
    }

    redirectToVendorDashboard(data);

  } catch (err) {
    alert("Error: " + err.message);
  }
});