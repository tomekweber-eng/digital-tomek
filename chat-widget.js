// === chat-widget.js ===
document.addEventListener("DOMContentLoaded", function () {
  // === Create bubble button ===
  const bubbleBtn = document.createElement("button");
  bubbleBtn.innerHTML = "💬";
  bubbleBtn.className = "chat-bubble-button";

  // === Create chat box ===
  const chatBox = document.createElement("div");
  chatBox.className = "chat-box hidden";
  chatBox.innerHTML = `
    <div class="chat-header">Digital Tomek</div>
    <div class="chat-options">
      <button class="chat-option" data-msg="Tell me about your experience and projects">🗺️ Tell me about your experience and projects</button>
      <button class="chat-option" data-msg="Show me your CV">📄 Show me your CV</button>
      <button class="chat-option" data-msg="Show me your scope of services">🛠️ Show me your scope of services</button>
      <button class="chat-option" data-msg="Show me your terms of engagement">📋 Show me your terms of engagement</button>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="message bot">Hi, I'm Digital Tomek – ask me anything about my experience, services or AI marketing insights.</div>
    </div>
    <div class="chat-input">
      <input type="text" id="chat-input-field" placeholder="Type your message..." />
      <button id="chat-send">Send</button>
    </div>
    <div class="chat-footer">
      <a href="https://calendly.com/tomek-weber/30min" target="_blank">Book a meeting ↗</a>
    </div>
  `;

  // === Add to body ===
  document.body.appendChild(bubbleBtn);
  document.body.appendChild(chatBox);

  // === Toggle chat ===
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
      .map(p => `<p>${p.trim()}</p>`)
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
      appendMessage("bot", data.reply || "Sorry, I couldn’t understand that.");
    } catch (e) {
      removeTypingIndicator();
      appendMessage("bot", "Sorry, I couldn’t reach the server.");
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
});
