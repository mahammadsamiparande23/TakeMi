function bookService(service) {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Please login to book this service.");

  fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      serviceId: service._id,
      serviceName: service.name,
      vendorId: service.vendorId || "default-vendor"
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message); // "Service booked successfully"
    window.location.href = "booked.html";
  })
  .catch(err => {
    alert("Booking failed");
    console.error(err);
  });
}
