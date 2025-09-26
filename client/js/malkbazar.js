// ✅ Fetch and render all products
async function fetchProducts(categoryFilter = null) {
  try {
    const res = await fetch("http://localhost:5000/api/products/all");
    const products = await res.json();

    const container = document.getElementById("productArea");
    container.innerHTML = "";

    const filteredProducts = categoryFilter
      ? products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
      : products;

    if (filteredProducts.length === 0) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    filteredProducts.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="http://localhost:5000/uploads/${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <p>${product.description || ""}</p>
        <div class="card-buttons">
          <button class="order-btn" onclick='placeOrderBackend(${JSON.stringify(product)})'>Order Now</button>
          <button class="cart-btn" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error loading products:", err);
    document.getElementById("productArea").innerHTML = "<p>⚠️ Error loading products</p>";
  }
}

// 📌 Load all products on page load
fetchProducts();

// 📌 Category filter logic
document.querySelectorAll(".categories li").forEach(li => {
  li.addEventListener("click", () => {
    const category = li.getAttribute("data-category");
    fetchProducts(category);
  });
});

// ✅ Add to Cart (localStorage)
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("malkCart")) || [];
  cart.push({
    name: product.name,
    img: `/uploads/${product.image}`, // For frontend display
    price: `₹${product.price}`
  });
  localStorage.setItem("malkCart", JSON.stringify(cart));
  alert("✅ Added to cart");
}

// ✅ Order via Backend (MongoDB)
function placeOrderBackend(product) {
  const userId = "user123"; // 🔐 Replace with real logged-in user ID when ready

  const orderData = {
    userId,
    products: [
      {
        name: product.name,
        img: product.image, // ✅ Use image filename only
        price: product.price // ✅ Use numeric value, not string with ₹
      }
    ]
  };

  console.log("📦 Sending order:", orderData);

  fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Order saved:", data);
    alert("✅ Order placed successfully!");
  })
  .catch(err => {
    console.error("❌ Order failed:", err);
    alert("❌ Failed to place order");
  });
}