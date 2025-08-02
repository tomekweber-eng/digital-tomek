'use strict';

(function() {
  function initChatWidget() {
    if (document.querySelector('.digital-tomek-chat-bubble')) return;

    const bubbleBtn = document.createElement("button");
    bubbleBtn.innerHTML = "💬";
    bubbleBtn.className = "digital-tomek-chat-bubble";
    bubbleBtn.setAttribute('aria-label', 'Open chat with Digital Tomek');

    const chatBox = document.createElement("div");
    chatBox.className = "digital-tomek-chat-box hidden";
    chatBox.innerHTML = \`
      <div class="digital-tomek-chat-header">Digital Tomek AI Assistant</div>
      <div class="digital-tomek-chat-messages" id="digital-tomek-chat-messages">
        <div class="digital-tomek-message bot">Hi! I'm Digital Tomek's AI assistant. Ask me anything about Tomek's experience, services, or AI marketing insights.</div>
      </div>
      <div class="digital-tomek-chat-input">
        <input type="text" id="digital-tomek-chat-input-field" placeholder="Type your message..." />
        <button id="digital-tomek-chat-send">Send</button>
      </div>
      <div class="digital-tomek-chat-footer">
        <a href="https://calendly.com/tomek-weber/30min" target="_blank" rel="noopener">📅 Book a meeting</a>
      </div>
    \`;

    document.body.appendChild(bubbleBtn);
    document.body.appendChild(chatBox);

    const sendBtn = chatBox.querySelector("#digital-tomek-chat-send");
    const inputField = chatBox.querySelector("#digital-tomek-chat-input-field");
    const messagesContainer = chatBox.querySelector("#digital-tomek-chat-messages");

    bubbleBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      chatBox.classList.toggle("hidden");
    });

    document.addEventListener("click", function(e) {
      if (!chatBox.contains(e.target) && !bubbleBtn.contains(e.target)) {
        chatBox.classList.add("hidden");
      }
    });

    function appendMessage(sender, text) {
      const msg = document.createElement("div");
      msg.className = \`digital-tomek-message \${sender}\`;
      msg.style.fontSize = "10px";
      msg.innerHTML = text.split('\n\n').map(p => \`<p style="margin: 0 0 8px 0; font-size:10px !important;">\${p.trim()}</p>\`).join('');
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendTypingIndicator() {
      const typing = document.createElement("div");
      typing.className = "digital-tomek-message bot typing";
      typing.style.fontSize = "10px";
      typing.id = "digital-tomek-typing-indicator";
      typing.innerHTML = \`<div class="digital-tomek-typing"><span>●</span><span>●</span><span>●</span></div>\`;
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
      const typing = document.getElementById("digital-tomek-typing-indicator");
      if (typing) typing.remove();
    }

    async function sendMessage(userInput) {
      appendMessage("user", userInput);
      appendTypingIndicator();

      try {
        const response = await fetch("https://digital-tomek.vercel.app/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);

        const data = await response.json();
        removeTypingIndicator();
        appendMessage("bot", data.reply || "Sorry, I couldn't understand that. Please try rephrasing your question.");
      } catch (error) {
        console.error("API Error:", error);
        removeTypingIndicator();
        appendMessage("bot", "I'm having trouble connecting right now. Please try again in a moment or feel free to book a meeting directly with Tomek.");
      }
    }

    sendBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      const userInput = inputField.value.trim();
      if (!userInput) return;
      inputField.value = "";
      await sendMessage(userInput);
    });

    inputField.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }

  setTimeout(initChatWidget, 1000);
})();