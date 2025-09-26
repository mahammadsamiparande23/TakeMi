document.querySelector(".otp-btn")?.addEventListener("click", () => {
  alert("OTP login functionality is under development.");
});

document.querySelector(".google-btn")?.addEventListener("click", () => {
  alert("Google login will be integrated soon.");
});

document.querySelector("form")?.addEventListener("submit", (e) => {
  const inputs = e.target.querySelectorAll("input");
  const isEmpty = Array.from(inputs).some(input => input.value.trim() === "");
  if (isEmpty) {
    e.preventDefault();
    alert("Please fill all fields.");
    return;
  }

  // Simulate successful vendor login
  localStorage.setItem("userType", "vendor");
  localStorage.setItem("vendor", JSON.stringify({ name: "Vendor", email: inputs[0].value }));
  window.location.href = "vendor-dashboard.html";
});
