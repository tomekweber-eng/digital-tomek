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

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  messagesContainer.appendChild(msg);
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