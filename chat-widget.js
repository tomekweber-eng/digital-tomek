const chatContainer = document.getElementById("chat-widget-container");

const bubbleBtn = document.createElement("button");
bubbleBtn.innerHTML = "💬";
bubbleBtn.className = "chat-bubble-button";

const chatBox = document.createElement("div");
chatBox.className = "chat-box hidden";
chatBox.innerHTML = `
  <div class="chat-header">Digital Tomek</div>
  <div class="chat-messages" id="chat-messages"></div>
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
  if (!chatBox.classList.contains("hidden") && messagesContainer.children.length === 0) {
    appendMessage("bot", "Cześć, tu Digital Tomek 👋\n\nW czym mogę pomóc? Wybierz jedną z opcji poniżej:");
    showQuickMenu();
  }
});

const sendBtn = chatBox.querySelector("#chat-send");
const inputField = chatBox.querySelector("#chat-input-field");
const messagesContainer = chatBox.querySelector("#chat-messages");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showQuickMenu() {
  const options = [
    "📌 Powiedz mi coś o sobie",
    "📁 Powiedz mi o twoich doświadczeniach i projektach",
    "📄 Przedstaw mi twoje CV",
    "🛠️ Przedstaw mi zakres oferty",
    "📃 Przedstaw mi warunki oferty"
  ];

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "quick-option-button";
    btn.textContent = option;
    btn.onclick = () => {
      appendMessage("user", option);
      inputField.value = option;
      sendBtn.click();
    };
    messagesContainer.appendChild(btn);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const userInput = inputField.value.trim();
  if (!userInput) return;

  appendMessage("user", userInput);
  inputField.value = "";
  appendMessage("bot", "...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    messagesContainer.lastChild.remove();
    appendMessage("bot", data.reply || "Sorry, I couldn’t understand that.");
  } catch (e) {
    messagesContainer.lastChild.remove();
    appendMessage("bot", "Sorry, I couldn’t reach the server.");
  }
});

inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendBtn.click();
});
