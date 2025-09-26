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

    // Store data locally (optional)
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userType", "user");

    alert("Signup successful!");
    window.location.href = "user-dashboard.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
});

document.querySelector(".google-btn")?.addEventListener("click", () => {
  alert("Google Signup coming soon!");
});
