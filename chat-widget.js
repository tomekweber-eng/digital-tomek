const chatContainer = document.getElementById("chat-widget-container");

const bubbleBtn = document.createElement("button");
bubbleBtn.innerHTML = "💬";
bubbleBtn.className = "chat-bubble-button";

const chatBox = document.createElement("div");
chatBox.className = "chat-box hidden";
chatBox.innerHTML = `
  <div class="chat-header">Digital Tomek</div>
  <div class="chat-messages" id="chat-messages">
    <div class="message bot">Hi, I’m Digital Tomek – ask me anything about my experience, services or AI marketing insights.</div>
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
    const response = await fetch("https://digital-tomek.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
