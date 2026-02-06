// Live Chat System

// Initialize chat
const chatButton = document.getElementById('chat-button');
const chatWidget = document.getElementById('chat-widget');
const closeChat = document.getElementById('close-chat');
const sendChatBtn = document.getElementById('send-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

let currentSessionId = null;

// Toggle chat widget
if (chatButton) {
  chatButton.addEventListener('click', () => {
    chatWidget.classList.toggle('open');
    chatButton.style.display = 'none';
    
    // Initialize session if not exists
    if (!currentSessionId) {
      initializeChatSession();
    }
  });
}

if (closeChat) {
  closeChat.addEventListener('click', () => {
    chatWidget.classList.remove('open');
    chatButton.style.display = 'flex';
  });
}

// Initialize chat session
function initializeChatSession() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser.displayName || 'Guest';
  
  // Create new session
  currentSessionId = 'session_' + Date.now();
  const session = {
    id: currentSessionId,
    userName: userName,
    startTime: new Date().toISOString(),
    status: 'active',
    messages: [
      {
        sender: 'bot',
        text: 'Welcome! How can we help you today?',
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  // Save session
  const sessions = getFromLocalStorage('chatSessions');
  sessions.push(session);
  saveToLocalStorage('chatSessions', sessions);
  
  // Send auto-response if configured
  const autoResponse = localStorage.getItem('chatAutoResponse') || 
    'Thank you for contacting us! An admin will be with you shortly.';
  
  setTimeout(() => {
    addBotMessage(autoResponse);
  }, 1000);
  
  // Notify admins
  notifyAdminsNewChat(session);
}

// Add bot message
function addBotMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot';
  msgDiv.innerHTML = `<p>${escapeHTML(text)}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Save to session
  if (currentSessionId) {
    const sessions = getFromLocalStorage('chatSessions');
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
      session.messages.push({
        sender: 'bot',
        text: text,
        timestamp: new Date().toISOString()
      });
      saveToLocalStorage('chatSessions', sessions);
    }
  }
}

// Add user message
function addUserMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message user';
  msgDiv.innerHTML = `<p>${escapeHTML(text)}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Save to session
  if (currentSessionId) {
    const sessions = getFromLocalStorage('chatSessions');
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
      session.messages.push({
        sender: 'user',
        text: text,
        timestamp: new Date().toISOString()
      });
      saveToLocalStorage('chatSessions', sessions);
    }
  }
}

// Add admin message (from admin panel)
function addAdminMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message admin';
  msgDiv.innerHTML = `<p>${escapeHTML(text)}</p>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  addUserMessage(message);
  chatInput.value = '';
  
  // Check for admin response
  checkForAdminResponse();
}

if (sendChatBtn) {
  sendChatBtn.addEventListener('click', sendMessage);
}

if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Check for admin responses
function checkForAdminResponse() {
  if (!currentSessionId) return;
  
  // Poll for new messages every 2 seconds
  const checkInterval = setInterval(() => {
    const sessions = getFromLocalStorage('chatSessions');
    const session = sessions.find(s => s.id === currentSessionId);
    
    if (!session) {
      clearInterval(checkInterval);
      return;
    }
    
    // Get last message
    const lastMessage = session.messages[session.messages.length - 1];
    
    // Check if there's a new admin message
    if (lastMessage && lastMessage.sender === 'admin') {
      const existingMessages = chatMessages.querySelectorAll('.chat-message');
      const lastDisplayedMessage = existingMessages[existingMessages.length - 1];
      
      // Only add if not already displayed
      if (!lastDisplayedMessage || !lastDisplayedMessage.textContent.includes(lastMessage.text)) {
        addAdminMessage(lastMessage.text);
      }
    }
    
    // Stop checking if session is closed
    if (session.status === 'closed') {
      clearInterval(checkInterval);
    }
  }, 2000);
}

// Notify admins of new chat
function notifyAdminsNewChat(session) {
  const adminEmail = localStorage.getItem('adminEmail') || 'cathleen.roets@gmail.com';
  const emailEnabled = localStorage.getItem('emailNotifications') !== 'false';
  
  if (!emailEnabled) return;
  
  console.log('New chat session notification:', {
    to: adminEmail,
    subject: 'New Chat Session - User Needs Assistance',
    body: `A new chat session has been started by ${session.userName}. Please log in to the admin panel to respond.`
  });
  
  // In production, send actual email here
}

// Load existing messages from session
function loadSessionMessages() {
  if (!currentSessionId) return;
  
  const sessions = getFromLocalStorage('chatSessions');
  const session = sessions.find(s => s.id === currentSessionId);
  
  if (!session) return;
  
  chatMessages.innerHTML = '';
  
  session.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    msgDiv.innerHTML = `<p>${escapeHTML(msg.text)}</p>`;
    chatMessages.appendChild(msgDiv);
  });
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-scroll to bottom on new messages
const observer = new MutationObserver(() => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

if (chatMessages) {
  observer.observe(chatMessages, { childList: true });
}