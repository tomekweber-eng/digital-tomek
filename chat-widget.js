const chatContainer = document.getElementById("chat-widget-container");

const bubbleBtn = document.createElement("button");
bubbleBtn.innerHTML = "💬";
bubbleBtn.className = "chat-bubble-button";

const chatBox = document.createElement("div");
chatBox.className = "chat-box hidden";
chatBox.innerHTML = `
  <div class="chat-header">Digital Tomek</div>
  <div class="chat-messages" id="chat-messages">
    <div class="message bot">Cześć, jestem Digital Tomek, czyli avatar Tomka – zapytaj mnie o moje doświadczenie, projekty, ofertę interimową lub działania z AI.</div>
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

function appendTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.id = "typing-indicator";
  typing.innerHTML = `<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;
  messagesContainer.appendChild(typing);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

async function sendMessage(userInput) {
  appendMessage("user", userInput);
  appendTypingIndicator();

  try {
    const response = await fetch("https://digital-tomek.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    removeTypingIndicator();
    appendMessage("bot", data.reply || "Przepraszam, nie zrozumiałem wiadomości.");
  } catch (e) {
    removeTypingIndicator();
    appendMessage("bot", "Przepraszam, nie udało się połączyć z serwerem.");
  }
}

optionButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const userInput = btn.getAttribute("data-msg");
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
