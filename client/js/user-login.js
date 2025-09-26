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

    // Save user info
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userType", "user");

    alert("Login successful!");

    // REDIRECT
    window.location.href = "./user-dashboard.html";

  } catch (err) {
    alert("Error: " + err.message);
  }
});
