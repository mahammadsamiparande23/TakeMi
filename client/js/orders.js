document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
});

function fetchOrders() {
  fetch("http://localhost:3000/api/orders") // API call to backend
    .then(response => response.json())
    .then(data => {
      console.log("Fetched orders:", data); // Debug log
      if (Array.isArray(data)) {
        displayOrders(data);
      } else {
        console.error("Unexpected response format:", data);
      }
    })
    .catch(error => {
      console.error("Error fetching orders:", error);
    });
}

function displayOrders(orders) {
  const container = document.getElementById("orders-container");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders found.</p>";
    return;
  }

  orders.forEach(order => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-card";

    const statusHTML = `<p><strong>Status:</strong> ${order.status || "Processing"}</p>`;

    let productsHTML = "";
    if (Array.isArray(order.products)) {
      productsHTML = order.products.map(product => `
        <div class="product-item">
          <img src="/uploads/${product.img || 'placeholder.jpg'}" alt="${product.name}" />
          <div class="product-details">
            <p><strong>${product.name}</strong></p>
            <p>₹${product.price}</p>
          </div>
        </div>
      `).join("");
    }

    orderDiv.innerHTML = `
      <div class="order-info">
        <h3>Order ID: ${order._id}</h3>
        ${statusHTML}
        <div class="order-products">${productsHTML}</div>
        <p><strong>Ordered At:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      </div>
    `;

    container.appendChild(orderDiv);
  });
}
