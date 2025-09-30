// Function to open the Login Modal
function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

// Function to close the Login Modal
function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

// Function to toggle the Profile Dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById("profile-dropdown");
    dropdown.classList.toggle("hidden");
}

// Function to handle Logout
function logout() {
    // NOTE: This should be updated to match the local storage keys used in your admin-login/dashboard (userToken, userId, etc.)
    localStorage.removeItem("user");
    // Ensure you redirect to the correct common login page if one exists, otherwise back to the index
    window.location.href = "index.html"; 
}

// --- Main Event Listeners ---

// Smooth scroll (used for internal #links)
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
        // In a real application, you would send this file to a Vision API for image-based search
        alert(`Image uploaded: ${file.name}. Searching based on image content is a future feature!`);
    }
});

// Smart search redirect logic on Enter key
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = e.target.value.trim().toLowerCase();
        performSmartRedirect(query);
    }
});

/**
 * Directs search query to the correct page based on keywords.
 * IMPORTANT: Uses the file names provided by the user (malkbazar.html, malkservices.html).
 * @param {string} query The search query.
 */
function performSmartRedirect(query) {
    const serviceKeywords = ["electrician", "rikshaw", "barber", "repair", "education", "construction", "vehicle", "transport", "tutor", "parlour", "mechanic", "dj"];

    // Default to the Bazar page
    let target = "malkbazar.html"; 
    
    // Check if any service keyword is present
    if (serviceKeywords.some(k => query.includes(k))) {
        target = "malkservices.html";
    }

    window.location.href = `${target}?q=${encodeURIComponent(query)}`;
}

// Sub-list keyword click triggers search (for .latest-card links)
document.querySelectorAll(".latest-card a").forEach(a => {
    a.addEventListener("click", (e) => {
        e.preventDefault(); // Stop default navigation
        const url = new URL(a.href);
        // Extracts 'search' from Bazar links or 'q' from Service links
        const query = url.searchParams.get("search") || url.searchParams.get("q"); 

        if (query) {
             document.getElementById("searchInput").value = query;
             performSmartRedirect(query.toLowerCase());
        }
    });
});


// Language switching
document.getElementById("languageSelector")?.addEventListener("change", (e) => {
    const lang = e.target.value;
    document.body.setAttribute("lang", lang);
    alert(`Language changed to: ${lang}`);
});

// Login Modal open via header link
document.querySelectorAll('a[href="#login"]').forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        openLoginModal();
    });
});

// Login Modal close via background click or X button
document.getElementById("loginModal").addEventListener("click", (e) => {
    // Only close if the click is directly on the modal backdrop or the close button
    if (e.target.id === "loginModal" || e.target.classList.contains("close-btn")) {
        closeLoginModal();
    }
});

// Check local storage for user state to show profile menu
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    // Assuming 'user' is the object stored upon successful login
    document.getElementById("profile-menu").style.display = 'block'; // Show profile menu
    // Also, hide the standard login button if a user is found
    document.querySelector('.header-login-btn').style.display = 'none';
}
