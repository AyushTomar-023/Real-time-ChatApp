const socket = io("http://localhost:5000");
const currentUserId = localStorage.getItem("userId");
socket.emit("registerUser", currentUserId);

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");

const urlParams = new URLSearchParams(window.location.search);
let recipientId = urlParams.get("id");

let lastDateLabel = ""; // Global to track date labels across all messages
let typingTimeout;

// Typing indicator
const typingIndicator = document.createElement("div");
typingIndicator.className = "typing-indicator";
typingIndicator.textContent = "Typing...";
typingIndicator.style.fontStyle = "italic";
typingIndicator.style.margin = "5px 10px";

messageInput.addEventListener("input", () => {
  socket.emit("typing", { senderId: currentUserId, recipientId });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { senderId: currentUserId, recipientId });
  }, 1000);
});

function formatChatDate(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function maybeAddDateLabel(date) {
  const formattedDate = formatChatDate(date);
  if (formattedDate !== lastDateLabel) {
    const dateLabel = document.createElement("div");
    dateLabel.classList.add("date-label");
    dateLabel.textContent = formattedDate;
    messagesContainer.appendChild(dateLabel);
    lastDateLabel = formattedDate;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("chat_token");

  if (!token || !currentUserId || !recipientId) {
    alert("Unauthorized or missing user ID.");
    window.location.href = "user.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/users/${recipientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load user");

    document.getElementById("chatUserName").textContent = `${data.firstName} ${data.lastName}`;
    document.getElementById("chatUserImage").src = `http://localhost:5000/uploads/${data.profile_image}`;
    localStorage.setItem("recipientImage", data.profile_image);

    const messageRes = await fetch(`http://localhost:5000/api/messages/${recipientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const messages = await messageRes.json();
    if (!messageRes.ok) throw new Error(messages.message || "Failed to load messages");

    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at);
      maybeAddDateLabel(msgDate);

      const isSender = msg.sender_id.toString() === currentUserId;
      const timestamp = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const messageElement = document.createElement("div");
      messageElement.classList.add("chat", isSender ? "outgoing" : "incoming");

      messageElement.innerHTML = isSender
        ? `
          <div class="details">
            <p>${msg.message}
              <span class="timestamp">${timestamp}</span>
            </p>
          </div>
        `
        : `
          <img src="http://localhost:5000/uploads/${data.profile_image}" alt="">
          <div class="details">
            <p>${msg.message}
              <span class="timestamp">${timestamp}</span>
            </p>
          </div>
        `;

      messagesContainer.appendChild(messageElement);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

  } catch (err) {
    console.error("Error loading chat data:", err);
    alert("Unable to load chat user or messages.");
    window.location.href = "user.html";
  }
});

messageForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (message === "") return;

  const token = localStorage.getItem("chat_token");
  const now = new Date();

  socket.emit("sendMessage", {
    senderId: currentUserId,
    recipientId: recipientId,
    message: message,
    token: token
  });

  maybeAddDateLabel(now);

  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const messageElement = document.createElement("div");
  messageElement.classList.add("chat", "outgoing");
  messageElement.innerHTML = `
    <div class="details">
      <p>${message}
        <span class="timestamp">${timestamp}</span>
      </p>
    </div>
  `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  messageInput.value = "";
});

socket.on("receiveMessage", function (data) {
  if (data.recipientId === currentUserId) {
    const recipientImage = localStorage.getItem("recipientImage") || "img.jpg";
    const msgDate = new Date(data.created_at || Date.now());

    maybeAddDateLabel(msgDate);

    const timestamp = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageElement = document.createElement("div");
    messageElement.classList.add("chat", "incoming");
    messageElement.innerHTML = `
      <img src="http://localhost:5000/uploads/${recipientImage}" alt="">
      <div class="details">
        <p>${data.message}
          <span class="timestamp">${timestamp}</span>
        </p>
      </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});

// Typing indicator listeners
socket.on("showTyping", (data) => {
  if (data.senderId === recipientId && !document.querySelector(".typing-indicator")) {
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});

socket.on("hideTyping", (data) => {
  if (data.senderId === recipientId) {
    const indicator = document.querySelector(".typing-indicator");
    if (indicator) indicator.remove();
  }
});
