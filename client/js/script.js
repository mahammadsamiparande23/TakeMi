// Smooth scroll
document.querySelectorAll('a[href^="#"], .cta-buttons button').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href')?.substring(1) || this.getAttribute('data-scroll');
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Voice Input
document.getElementById("voiceBtn").addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";
  recognition.start();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("searchInput").value = transcript;
    performSmartRedirect(transcript);
  };
  recognition.onerror = () => alert("Voice input failed.");
});

// Camera Input
document.getElementById("cameraBtn").addEventListener("click", () => {
  document.getElementById("cameraInput").click();
});
document.getElementById("cameraInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    alert(`Image uploaded: ${file.name}`);
    // Optional: integrate image recognition API here
  }
});

// Smart search redirect logic
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim().toLowerCase();
    performSmartRedirect(query);
  }
});

function performSmartRedirect(query) {
  const productKeywords = ["mobile", "speaker", "sofa", "t-shirt", "dal", "grocery", "fashion", "electronics", "kids"];
  const serviceKeywords = ["electrician", "rikshaw", "barber", "repair", "education", "construction", "vehicle", "transport"];

  let target = "malkbazar.html";
  if (serviceKeywords.some(k => query.includes(k))) {
    target = "malkservices.html";
  }

  window.location.href = `${target}?q=${encodeURIComponent(query)}`;
}

// Sub-list keyword click triggers search
document.querySelectorAll(".sub-list li").forEach(li => {
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    const keyword = li.innerText.trim().toLowerCase();
    document.getElementById("searchInput").value = keyword;
    performSmartRedirect(keyword);
  });
});

// Toggle sublist on grid-item click
document.querySelectorAll(".grid-item").forEach(item => {
  item.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});

// Language switching
document.getElementById("languageSwitcher")?.addEventListener("change", (e) => {
  const lang = e.target.value;
  document.body.setAttribute("lang", lang);
  alert(`Language changed to: ${lang}`);
});

// Login Modal open/close
const loginLinks = document.querySelectorAll('a[href="#login"]');
loginLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginModal").style.display = "flex";
  });
});

document.getElementById("loginModal").addEventListener("click", (e) => {
  if (e.target.id === "loginModal" || e.target.id === "closeModalBtn") {
    document.getElementById("loginModal").style.display = "none";
  }
});

function toggleProfileDropdown() {
  const dropdown = document.getElementById("profile-dropdown");
  dropdown.classList.toggle("hidden");
}

const user = JSON.parse(localStorage.getItem("user"));
if (user) {
  document.getElementById("profile-menu").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
