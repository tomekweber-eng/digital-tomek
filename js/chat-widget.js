const chatContainer = document.getElementById("chat-widget-container");

const bubbleBtn = document.createElement("button");
bubbleBtn.innerHTML = "💬";
bubbleBtn.className = "chat-bubble-button";

const chatBox = document.createElement("div");
chatBox.className = "chat-box hidden";
chatBox.innerHTML = `
  <div class="chat-header">
    Digital Tomek
    <div class="github-auth" id="github-auth">
      <button id="github-login" style="background: #24292e; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Login
      </button>
      <div id="github-user" style="display: none; font-size: 11px; color: #666;">
        <span id="github-username"></span>
        <button id="github-logout" style="background: none; border: none; color: #999; font-size: 10px; cursor: pointer; margin-left: 5px;">Logout</button>
      </div>
    </div>
  </div>
  <div class="chat-messages" id="chat-messages">
    <div class="message bot">Hi, I'm Digital Tomek – ask me anything about my experience, services or AI marketing insights.</div>
  </div>
  <div class="chat-options">
    <button class="chat-option" data-msg="🧭 Powiedz mi o twoich doświadczeniach i projektach">🧭 Powiedz mi o twoich doświadczeniach i projektach</button>
    <button class="chat-option" data-msg="📄 Przedstaw mi twoje CV">📄 Przedstaw mi twoje CV</button>
    <button class="chat-option" data-msg="🛠️ Przedstaw mi zakres oferty">🛠️ Przedstaw mi zakres oferty</button>
    <button class="chat-option" data-msg="📑 Przedstaw mi warunki oferty">📑 Przedstaw mi warunki oferty</button>
  </div>
  <div class="chat-input">
    <input type="text" id="chat-input-field" placeholder="Type your message..." />
    <button id="chat-send">Send</button>
  </div>
  <div class="chat-footer">
    <a href="https://forms.gle/Hkk2qZidLYmdkoYBA" target="_blank">Leave feedback ↗</a>
  </div>
`;

chatContainer.appendChild(bubbleBtn);
chatContainer.appendChild(chatBox);

bubbleBtn.addEventListener("click", () => {
  chatBox.classList.toggle("hidden");
});

const sendBtn = chatBox.querySelector("#chat-send");
const inputField = chatBox.querySelector("#chat-input-field");
const messagesContainer = chatBox.querySelector("#chat-messages");
const optionButtons = chatBox.querySelectorAll(".chat-option");

// GitHub authentication elements
const githubLoginBtn = chatBox.querySelector("#github-login");
const githubLogoutBtn = chatBox.querySelector("#github-logout");
const githubUserDiv = chatBox.querySelector("#github-user");
const githubUsernameSpan = chatBox.querySelector("#github-username");

// GitHub authentication state
let currentGithubUser = null;

// Check for existing GitHub session
function checkGithubSession() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('github_auth') === 'success') {
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Check cookies for user info (in production, use proper session management)
    loadGithubUser();
  }
}

function loadGithubUser() {
  // In a real implementation, you'd call your backend to get the current user
  // For now, we'll simulate this
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('github_session='));
  
  if (sessionCookie) {
    try {
      const sessionData = sessionCookie.split('=')[1];
      currentGithubUser = JSON.parse(atob(sessionData));
      updateGithubUI();
    } catch (e) {
      console.error('Error parsing GitHub session:', e);
    }
  }
}

function updateGithubUI() {
  if (currentGithubUser) {
    githubLoginBtn.style.display = 'none';
    githubUserDiv.style.display = 'block';
    githubUsernameSpan.textContent = currentGithubUser.login;
    
    // Add admin indicator for the repository owner
    if (currentGithubUser.isAdmin) {
      githubUsernameSpan.textContent += ' (Admin)';
      githubUsernameSpan.style.color = '#d73a49';
    }
  } else {
    githubLoginBtn.style.display = 'block';
    githubUserDiv.style.display = 'none';
  }
}

// GitHub authentication event listeners
githubLoginBtn.addEventListener("click", () => {
  window.location.href = "/api/github-auth?action=login";
});

githubLogoutBtn.addEventListener("click", () => {
  // Clear session
  document.cookie = 'github_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  currentGithubUser = null;
  updateGithubUI();
  appendMessage("bot", "You have been logged out from GitHub.");
});

// Initialize GitHub session check
checkGithubSession();
loadGithubUser();
updateGithubUI();

// Auto-open chat after 5 seconds
let autoOpenTimer;
let hasUserInteracted = false;

function startAutoOpenTimer() {
  autoOpenTimer = setTimeout(() => {
    if (!hasUserInteracted && chatBox.classList.contains("hidden")) {
      chatBox.classList.remove("hidden");
      // Add a subtle animation to draw attention
      chatBox.style.animation = "pulse 2s ease-in-out";
      
      // Add a welcome message indicating auto-open
      setTimeout(() => {
        appendMessage("bot", "👋 Hi there! I noticed you've been browsing for a moment. I'm Digital Tomek - feel free to ask me anything about Tomasz's experience, projects, or services!");
      }, 500);
      
      // Remove animation after it completes
      setTimeout(() => {
        chatBox.style.animation = "";
      }, 2000);
    }
  }, 5000); // 5 seconds
}

// Track user interaction to prevent auto-open if they've already interacted
function trackUserInteraction() {
  hasUserInteracted = true;
  if (autoOpenTimer) {
    clearTimeout(autoOpenTimer);
  }
}

// Start the auto-open timer when the page loads
startAutoOpenTimer();

// Cancel auto-open if user interacts with the bubble manually
bubbleBtn.addEventListener("click", trackUserInteraction);

// Also track other interactions like scrolling or clicking
document.addEventListener("scroll", trackUserInteraction, { once: true });
document.addEventListener("click", trackUserInteraction, { once: true });

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = text
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('');
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage(userInput) {
  appendMessage("user", userInput);

  // ⏳ animacja typing
  const typingMsg = document.createElement("div");
  typingMsg.className = "message bot typing";
  messagesContainer.appendChild(typingMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const headers = { "Content-Type": "application/json" };
    
    // Add GitHub user info if authenticated
    if (currentGithubUser) {
      headers["X-GitHub-User"] = currentGithubUser.login;
    }
    
    const response = await fetch("https://digital-tomek.vercel.app/api/chat", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    messagesContainer.removeChild(typingMsg);
    appendMessage("bot", data.reply || "Sorry, I couldn’t understand that.");
  } catch (e) {
    messagesContainer.removeChild(typingMsg);
    appendMessage("bot", "Sorry, I couldn’t reach the server.");
  }
}

optionButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const userInput = btn.getAttribute("data-msg");

    // 🔥 Ukryj przyciski opcji po kliknięciu
    chatBox.querySelector(".chat-options").style.display = "none";

    sendMessage(userInput);
  });
});

sendBtn.addEventListener("click", async () => {
  const userInput = inputField.value.trim();
  if (!userInput) return;
  inputField.value = "";
  sendMessage(userInput);
});

inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendBtn.click();
});