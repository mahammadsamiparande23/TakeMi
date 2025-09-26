document.getElementById("vendorSignupForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const shopName = document.getElementById("shopName").value.trim();
  const category = document.getElementById("categorySelect").value;
  const location = document.getElementById("location").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!category) {
    alert("Please select vendor type.");
    return;
  }

  const vendorData = { fullName, mobile, shopName, category, location, password };
  const existingVendors = JSON.parse(localStorage.getItem("malkVendors")) || [];
  existingVendors.push(vendorData);
  localStorage.setItem("malkVendors", JSON.stringify(existingVendors));

  localStorage.setItem("userType", "vendor");
  localStorage.setItem("vendor", JSON.stringify(vendorData));

  if (category === "malkbazar") {
    alert("Welcome MalkBazar Vendor!");
    window.location.href = "malkbazar-vendor-panel.html";
  } else if (category === "malkservices") {
    alert("Welcome MalkServices Vendor!");
    window.location.href = "malkservices-vendor-panel.html";
  }
});
