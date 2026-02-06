// Admin Panel JavaScript

// Check if user is authenticated as admin
function checkAdminAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const adminUsers = getFromLocalStorage('adminUsers');
  
  // Initialize admin users if not exists (for demo, add default admin)
  if (adminUsers.length === 0) {
    adminUsers.push({
      email: 'cathleen.roets@gmail.com',
      password: 'Viper6334', 
      role: 'admin'
    });
    saveToLocalStorage('adminUsers', adminUsers);
  }
  
  const isAdmin = adminUsers.some(admin => admin.email === currentUser.email);
  
  if (isAdmin) {
    document.getElementById('admin-auth-check').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadPendingApprovals();
    loadApprovedPosts();
    loadChatSessions();
  } else {
    document.getElementById('admin-auth-check').innerHTML = `
      <p>You must be logged in as an administrator to access this panel.</p>
      <p>If you are an admin, please <a href="signin.html">sign in</a> with your admin credentials.</p>
    `;
  }
}

// Tab switching
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab
    this.classList.add('active');
    const tabName = this.getAttribute('data-tab');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Load pending approvals
function loadPendingApprovals(filter = 'all') {
  const pending = getFromLocalStorage('pendingApprovals');
  const container = document.getElementById('pending-items');
  
  const filteredPending = filter === 'all' 
    ? pending 
    : pending.filter(item => item.type === filter);
  
  if (filteredPending.length === 0) {
    container.innerHTML = '<p>No pending approvals.</p>';
    return;
  }
  
  container.innerHTML = '';
  
  filteredPending.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'admin-item pending';
    
    let content = `
      <div class="admin-item-header">
        <span class="item-type">${item.type.toUpperCase()}</span>
        <span class="item-date">${new Date(item.date).toLocaleString()}</span>
      </div>
      <div class="admin-item-content">
    `;
    
    if (item.type === 'announcement') {
      content += `
        <h4>${item.title}</h4>
        <p>${item.body}</p>
        ${item.image ? `<img src="${item.image}" alt="Announcement" style="max-width: 200px;">` : ''}
        <p><small>Submitted by: ${item.submittedBy}</small></p>
      `;
    } else if (item.type === 'prayer') {
      content += `
        <p><strong>${item.name}</strong></p>
        <p>${item.msg}</p>
        ${item.image && item.image !== DEFAULT_PRAYER_IMAGE ? `<img src="${item.image}" alt="Prayer" style="max-width: 200px;">` : ''}
      `;
    } else if (item.type === 'need') {
      content += `
        <p><strong>${item.needType ? item.needType.toUpperCase() : 'ITEM'} - ${item.name}</strong></p>
        <p>${item.details}</p>
        ${item.image && item.image !== DEFAULT_NEED_IMAGE ? `<img src="${item.image}" alt="Need" style="max-width: 200px;">` : ''}
      `;
    } else if (item.type === 'event') {
      content += `
        <h4>${item.title}</h4>
        <p>Event Date: ${new Date(item.date).toLocaleString()}</p>
        ${item.link ? `<p>Link: <a href="${item.link}" target="_blank">${item.link}</a></p>` : ''}
        ${item.image ? `<img src="${item.image}" alt="Event" style="max-width: 200px;">` : ''}
      `;
    }
    
    content += `
      </div>
      <div class="admin-item-actions">
        <button class="approve-btn" onclick="approveItem(${item.id})">
          <i class="fas fa-check"></i> Approve
        </button>
        <button class="reject-btn" onclick="rejectItem(${item.id})">
          <i class="fas fa-times"></i> Reject
        </button>
        <button class="edit-btn" onclick="editItem(${item.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    `;
    
    itemDiv.innerHTML = content;
    container.appendChild(itemDiv);
  });
  
  // Update badge count
  document.getElementById('pending-count').textContent = pending.length;
}

// Load approved posts
function loadApprovedPosts(filter = 'all') {
  const container = document.getElementById('approved-items');
  let approved = [];
  
  // Collect all approved items from different categories
  if (filter === 'all' || filter === 'announcements') {
    const announcements = getFromLocalStorage('announcements').filter(item => item.status === 'approved');
    approved = approved.concat(announcements.map(item => ({...item, type: 'announcement'})));
  }
  if (filter === 'all' || filter === 'prayers') {
    const prayers = getFromLocalStorage('prayers').filter(item => item.status === 'approved');
    approved = approved.concat(prayers.map(item => ({...item, type: 'prayer'})));
  }
  if (filter === 'all' || filter === 'needs') {
    const needs = getFromLocalStorage('needs').filter(item => item.status === 'approved');
    approved = approved.concat(needs.map(item => ({...item, type: 'need'})));
  }
  if (filter === 'all' || filter === 'events') {
    const events = getFromLocalStorage('events').filter(item => item.status === 'approved');
    approved = approved.concat(events.map(item => ({...item, type: 'event'})));
  }
  
  if (approved.length === 0) {
    container.innerHTML = '<p>No approved posts.</p>';
    return;
  }
  
  container.innerHTML = '';
  
  approved.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'admin-item approved';
    
    let content = `
      <div class="admin-item-header">
        <span class="item-type">${item.type.toUpperCase()}</span>
        <span class="item-date">${new Date(item.date).toLocaleString()}</span>
      </div>
      <div class="admin-item-content">
    `;
    
    if (item.type === 'announcement') {
      content += `<h4>${item.title}</h4><p>${item.body}</p>`;
    } else if (item.type === 'prayer') {
      content += `<p><strong>${item.name}</strong>: ${item.msg}</p>`;
    } else if (item.type === 'need') {
      content += `<p><strong>${item.name}</strong>: ${item.details}</p>`;
    } else if (item.type === 'event') {
      content += `<h4>${item.title}</h4><p>${new Date(item.date).toLocaleString()}</p>`;
    }
    
    content += `
      </div>
      <div class="admin-item-actions">
        <button class="hide-btn" onclick="hideItem('${item.type}', ${item.id})">
          <i class="fas fa-eye-slash"></i> Hide
        </button>
        <button class="delete-btn" onclick="deleteItem('${item.type}', ${item.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    itemDiv.innerHTML = content;
    container.appendChild(itemDiv);
  });
}

// Approve item
function approveItem(id) {
  const pending = getFromLocalStorage('pendingApprovals');
  const itemIndex = pending.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return;
  
  const item = pending[itemIndex];
  item.status = 'approved';
  
  // Move to appropriate storage based on type
  if (item.type === 'announcement') {
    const announcements = getFromLocalStorage('announcements');
    announcements.push(item);
    saveToLocalStorage('announcements', announcements);
  } else if (item.type === 'prayer') {
    const prayers = getFromLocalStorage('prayers');
    prayers.push(item);
    saveToLocalStorage('prayers', prayers);
  } else if (item.type === 'need') {
    const needs = getFromLocalStorage('needs');
    needs.push(item);
    saveToLocalStorage('needs', needs);
  } else if (item.type === 'event') {
    const events = getFromLocalStorage('events');
    events.push(item);
    saveToLocalStorage('events', events);
  }
  
  // Remove from pending
  pending.splice(itemIndex, 1);
  saveToLocalStorage('pendingApprovals', pending);
  
  // Reload displays
  loadPendingApprovals();
  loadApprovedPosts();
  
  alert('Item approved successfully!');
}

// Reject item
function rejectItem(id) {
  if (!confirm('Are you sure you want to reject this item? It will be permanently deleted.')) {
    return;
  }
  
  const pending = getFromLocalStorage('pendingApprovals');
  const itemIndex = pending.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return;
  
  pending.splice(itemIndex, 1);
  saveToLocalStorage('pendingApprovals', pending);
  
  loadPendingApprovals();
  
  alert('Item rejected and deleted.');
}

// Edit item
function editItem(id) {
  const pending = getFromLocalStorage('pendingApprovals');
  const item = pending.find(item => item.id === id);
  
  if (!item) return;
  
  // Create modal for editing
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Edit ${item.type}</h3>
      <div id="edit-form"></div>
      <button onclick="saveEdit(${id})">Save</button>
      <button onclick="closeModal()">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'block';
  
  // Populate edit form based on type
  const form = document.getElementById('edit-form');
  if (item.type === 'announcement') {
    form.innerHTML = `
      <input type="text" id="edit-title" value="${item.title}">
      <textarea id="edit-body">${item.body}</textarea>
      <input type="url" id="edit-image" value="${item.image || ''}">
    `;
  } else if (item.type === 'prayer') {
    form.innerHTML = `
      <input type="text" id="edit-name" value="${item.name}">
      <textarea id="edit-msg">${item.msg}</textarea>
      <input type="url" id="edit-image" value="${item.image || ''}">
    `;
  } else if (item.type === 'need') {
    form.innerHTML = `
      <input type="text" id="edit-name" value="${item.name}">
      <textarea id="edit-details">${item.details}</textarea>
      <input type="url" id="edit-image" value="${item.image || ''}">
    `;
  } else if (item.type === 'event') {
    form.innerHTML = `
      <input type="text" id="edit-title" value="${item.title}">
      <input type="datetime-local" id="edit-date" value="${item.date}">
      <input type="url" id="edit-image" value="${item.image || ''}">
      <input type="url" id="edit-link" value="${item.link || ''}">
    `;
  }
}

function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) modal.remove();
}

// Hide approved item
function hideItem(type, id) {
  const storageKey = type === 'announcement' ? 'announcements' : type === 'prayer' ? 'prayers' : type === 'need' ? 'needs' : 'events';
  const items = getFromLocalStorage(storageKey);
  const item = items.find(i => i.id === id);
  
  if (item) {
    item.status = 'hidden';
    saveToLocalStorage(storageKey, items);
    loadApprovedPosts();
    alert('Item hidden from public view.');
  }
}

// Delete item
function deleteItem(type, id) {
  if (!confirm('Are you sure you want to delete this item permanently?')) {
    return;
  }
  
  const storageKey = type === 'announcement' ? 'announcements' : type === 'prayer' ? 'prayers' : type === 'need' ? 'needs' : 'events';
  let items = getFromLocalStorage(storageKey);
  items = items.filter(i => i.id !== id);
  saveToLocalStorage(storageKey, items);
  
  loadApprovedPosts();
  alert('Item deleted successfully.');
}

// Load chat sessions
function loadChatSessions() {
  const sessions = getFromLocalStorage('chatSessions');
  const container = document.getElementById('chat-sessions');
  
  if (sessions.length === 0) {
    container.innerHTML = '<p>No active chat sessions.</p>';
    document.getElementById('chat-count').textContent = '0';
    return;
  }
  
  document.getElementById('chat-count').textContent = sessions.length;
  container.innerHTML = '';
  
  sessions.forEach(session => {
    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'chat-session-item';
    sessionDiv.innerHTML = `
      <div class="session-info">
        <strong>${session.userName}</strong>
        <span>${session.messages.length} messages</span>
      </div>
      <button onclick="openChatSession('${session.id}')">Open Chat</button>
    `;
    container.appendChild(sessionDiv);
  });
}

// Open chat session
function openChatSession(sessionId) {
  const sessions = getFromLocalStorage('chatSessions');
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return;
  
  document.getElementById('chat-sessions').style.display = 'none';
  document.getElementById('active-chat-window').style.display = 'block';
  document.getElementById('active-chat-user').textContent = session.userName;
  
  // Load messages
  const messagesContainer = document.getElementById('admin-chat-messages');
  messagesContainer.innerHTML = '';
  
  session.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    msgDiv.innerHTML = `<p>${msg.text}</p><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>`;
    messagesContainer.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Set up send button
  document.getElementById('admin-send-chat').onclick = () => sendAdminMessage(sessionId);
  document.getElementById('admin-chat-input').onkeypress = (e) => {
    if (e.key === 'Enter') sendAdminMessage(sessionId);
  };
}

// Send admin message
function sendAdminMessage(sessionId) {
  const input = document.getElementById('admin-chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  const sessions = getFromLocalStorage('chatSessions');
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return;
  
  const msg = {
    sender: 'admin',
    text: message,
    timestamp: new Date().toISOString()
  };
  
  session.messages.push(msg);
  saveToLocalStorage('chatSessions', sessions);
  
  // Add to display
  const messagesContainer = document.getElementById('admin-chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message admin';
  msgDiv.innerHTML = `<p>${msg.text}</p><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>`;
  messagesContainer.appendChild(msgDiv);
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  input.value = '';
}

// Save settings
function saveSettings() {
  const emailNotifications = document.getElementById('email-notifications').checked;
  const adminEmail = document.getElementById('admin-email').value;
  const chatAutoResponse = document.getElementById('chat-auto-response').value;
  
  localStorage.setItem('emailNotifications', emailNotifications);
  localStorage.setItem('adminEmail', adminEmail);
  localStorage.setItem('chatAutoResponse', chatAutoResponse);
  
  alert('Settings saved successfully!');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const parent = this.parentElement;
    parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const filter = this.getAttribute('data-filter');
    const activeTab = document.querySelector('.admin-tab.active').getAttribute('data-tab');
    
    if (activeTab === 'pending') {
      loadPendingApprovals(filter);
    } else if (activeTab === 'approved') {
      loadApprovedPosts(filter);
    }
  });
});

// Initialize admin panel
if (document.getElementById('admin-panel')) {
  checkAdminAuth();
}

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const auth = getAuth();

const adminEmails = ["cathleen.roets@gmail.com"];

onAuthStateChanged(auth, (user) => {
  if (!user || !adminEmails.includes(user.email)) {
    alert("❌ Access denied. Admins only.");
    window.location.href = "index.html";
  }
});
