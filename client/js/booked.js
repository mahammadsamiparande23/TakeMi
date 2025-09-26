const bookedList = document.getElementById("bookedList");

async function renderBookings() {
  const userId = localStorage.getItem("userId");
  if (!userId) return (bookedList.innerHTML = "<p>Please login to view your bookings.</p>");

  const res = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
  const bookings = await res.json();

  if (!bookings.length) {
    bookedList.innerHTML = "<p>No service bookings found.</p>";
    return;
  }

  bookedList.innerHTML = "";
  bookings.forEach(b => {
    const div = document.createElement("div");
    div.className = "booking-card";
    div.innerHTML = `
      <h3>${b.serviceName}</h3>
      <p>Vendor ID: ${b.vendorId}</p>
      <p>Booked on: ${new Date(b.bookedDate).toLocaleDateString("en-IN")}</p>
      <p>Status: <strong>${b.status}</strong></p>
      <button class="cancel-btn" data-id="${b._id}">Cancel Booking</button>
    `;
    bookedList.appendChild(div);
  });

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Cancel this booking?")) {
        await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: "DELETE"
        });
        renderBookings(); // refresh
      }
    });
  });
}

renderBookings();
