// Default images
const DEFAULT_PRAYER_IMAGE = 'https://images.unsplash.com/photo-1517486430290-6979eb1ebb64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
const DEFAULT_NEED_IMAGE = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

// LOCALSTORAGE HELPERS
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data || []));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

function getFromLocalStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error getting from localStorage:', e);
    return [];
  }
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Email notification function (uses EmailJS or similar service)
async function sendEmailNotification(type, content) {
  const adminEmail = localStorage.getItem('adminEmail') || 'cathleen.roets@gmail.com';
  const emailEnabled = localStorage.getItem('emailNotifications') !== 'false';
  
  if (!emailEnabled) return;

  // Construct email body
  const subject = `New ${type} Submission - Pending Approval`;
  const body = `
    New ${type} submission requires your approval:
    
    ${JSON.stringify(content, null, 2)}
    
    Please log in to the admin panel to review and approve this submission.
    ${window.location.origin}/admin.html
  `;

  // In a real implementation, you would use EmailJS, SendGrid, or a backend API
  // For demo purposes, we'll show a console log
  console.log('Email Notification:', { to: adminEmail, subject, body });
  
  // Example EmailJS implementation (requires setup):
  /*
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    to_email: adminEmail,
    subject: subject,
    message: body,
  }).then(function(response) {
    console.log('Email sent successfully!', response);
  }, function(error) {
    console.log('Email send failed:', error);
  });
  */
}

// Hamburger Menu
const menuBtn = document.getElementById('menu-button');
const navLinks = document.getElementById('nav-links');
const overlay = document.getElementById('menu-overlay');

if (menuBtn && navLinks && overlay) {
  menuBtn.addEventListener('click', () => {
    const isActive = menuBtn.classList.toggle('is-active');
    navLinks.classList.toggle('open', isActive);
    overlay.classList.toggle('active', isActive);
    menuBtn.setAttribute('aria-expanded', isActive);
    navLinks.setAttribute('aria-hidden', !isActive);
  });

  overlay.addEventListener('click', () => {
    menuBtn.classList.remove('is-active');
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    navLinks.setAttribute('aria-hidden', 'true');
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && menuBtn.classList.contains('is-active')) {
      menuBtn.classList.remove('is-active');
      navLinks.classList.remove('open');
      overlay.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      navLinks.setAttribute('aria-hidden', 'true');
    }
  });
}

// ANNOUNCEMENTS
function addAnnouncement() {
  const titleEl = document.getElementById('ann-title');
  const bodyEl = document.getElementById('ann-body');
  const imageEl = document.getElementById('ann-image');
  const submitBtn = document.querySelector('.announcement-form button');

  if (!titleEl || !bodyEl) return;

  const title = escapeHTML(titleEl.value.trim());
  const body = escapeHTML(bodyEl.value.trim());
  let image = imageEl ? imageEl.value.trim() : '';

  if (!title || !body) {
    alert('Please fill in the title and body.');
    return;
  }

  if (image && !/^https?:\/\/.+/.test(image)) {
    alert('Invalid image URL. It must start with http:// or https://.');
    return;
  }

  submitBtn.disabled = true;
  
  // Get current user from auth
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser.displayName || 'Anonymous';
  
  const announcement = {
    id: Date.now(),
    title,
    body,
    image,
    date: new Date().toISOString(),
    status: 'pending',
    type: 'announcement',
    submittedBy: userName
  };

  // Save to pending queue
  const pending = getFromLocalStorage('pendingApprovals');
  pending.push(announcement);
  saveToLocalStorage('pendingApprovals', pending);

  // Send email notification
  sendEmailNotification('Announcement', announcement);

  titleEl.value = '';
  bodyEl.value = '';
  if (imageEl) imageEl.value = '';
  submitBtn.disabled = false;

  alert('Announcement submitted! It will be visible after admin approval.');
}

function renderAnnouncements() {
  const list = document.getElementById('ann-list');
  if (!list) return;

  list.innerHTML = '';
  
  // Only show approved announcements
  const announcements = getFromLocalStorage('announcements')
    .filter(item => item.status === 'approved')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (announcements.length === 0) {
    list.innerHTML = '<li>No announcements yet.</li>';
    return;
  }

  announcements.forEach(item => {
    const li = document.createElement('li');
    let content = `<strong>${item.title}</strong> (${new Date(item.date).toLocaleString()}): ${item.body}`;
    if (item.image) content += `<br><img src="${item.image}" alt="Announcement image" loading="lazy" style="max-width: 100%; height: auto;">`;
    li.innerHTML = content;
    list.appendChild(li);
  });
}

// PRAYERS
function submitPrayer() {
  const nameEl = document.getElementById('prayer-name');
  const msgEl = document.getElementById('prayer-msg');
  const imageEl = document.getElementById('prayer-image');
  const submitBtn = document.querySelector('.prayer-form button');

  if (!msgEl) return;

  const name = escapeHTML((nameEl ? nameEl.value.trim() : '') || 'Anonymous');
  const msg = escapeHTML(msgEl.value.trim());
  let image = (imageEl ? imageEl.value.trim() : '') || DEFAULT_PRAYER_IMAGE;

  if (!msg) {
    alert('Please describe your prayer request.');
    return;
  }

  if (image && image !== DEFAULT_PRAYER_IMAGE && !/^https?:\/\/.+/.test(image)) {
    alert('Invalid image URL.');
    return;
  }

  submitBtn.disabled = true;
  
  const prayer = {
    id: Date.now(),
    name,
    msg,
    image,
    date: new Date().toISOString(),
    status: 'pending',
    type: 'prayer'
  };

  const pending = getFromLocalStorage('pendingApprovals');
  pending.push(prayer);
  saveToLocalStorage('pendingApprovals', pending);

  sendEmailNotification('Prayer Request', prayer);

  if (nameEl) nameEl.value = '';
  msgEl.value = '';
  if (imageEl) imageEl.value = '';
  submitBtn.disabled = false;

  alert('Prayer request submitted! It will be visible after admin approval.');
}

function renderPrayers() {
  const list = document.getElementById('prayer-list');
  if (!list) return;

  list.innerHTML = '';
  
  const prayers = getFromLocalStorage('prayers')
    .filter(item => item.status === 'approved' && !item.private)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (prayers.length === 0) {
    list.innerHTML = '<li>No prayer requests yet.</li>';
    return;
  }

  prayers.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.name}</strong> (${new Date(item.date).toLocaleString()}): ${item.msg}`;
    if (item.image && item.image !== DEFAULT_PRAYER_IMAGE) {
      li.innerHTML += `<br><img src="${item.image}" alt="Prayer request image" loading="lazy" style="max-width: 100%; height: auto;">`;
    }
    list.appendChild(li);
  });
}

// NEEDS & OFFERS
function submitNeed() {
  const typeEls = document.querySelectorAll('input[name="need-type"]');
  const nameEl = document.getElementById('need-name');
  const detailsEl = document.getElementById('need-details');
  const imageEl = document.getElementById('need-image');
  const submitBtn = document.querySelector('.needs-form button');

  if (!detailsEl) return;

  const type = Array.from(typeEls).find(el => el.checked)?.value;
  const name = escapeHTML((nameEl ? nameEl.value.trim() : '') || 'Anonymous');
  const details = escapeHTML(detailsEl.value.trim());
  let image = (imageEl ? imageEl.value.trim() : '') || DEFAULT_NEED_IMAGE;

  if (!type || !details) {
    alert('Please select a type and describe your need or offer.');
    return;
  }

  if (image && image !== DEFAULT_NEED_IMAGE && !/^https?:\/\/.+/.test(image)) {
    alert('Invalid image URL.');
    return;
  }

  submitBtn.disabled = true;
  
  const need = {
    id: Date.now(),
    type,
    name,
    details,
    image,
    date: new Date().toISOString(),
    status: 'pending',
    type: 'need'
  };

  const pending = getFromLocalStorage('pendingApprovals');
  pending.push(need);
  saveToLocalStorage('pendingApprovals', pending);

  sendEmailNotification('Need/Offer', need);

  if (nameEl) nameEl.value = '';
  detailsEl.value = '';
  if (imageEl) imageEl.value = '';
  typeEls[0].checked = true;
  submitBtn.disabled = false;

  alert('Your submission has been received! It will be visible after admin approval.');
}

function renderNeeds() {
  const list = document.getElementById('needs-list');
  if (!list) return;

  list.innerHTML = '';
  
  const needs = getFromLocalStorage('needs')
    .filter(item => item.status === 'approved')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (needs.length === 0) {
    list.innerHTML = '<li>No needs or offers yet.</li>';
    return;
  }

  needs.forEach(item => {
    const li = document.createElement('li');
    const typeLabel = item.needType ? item.needType.toUpperCase() : 'ITEM';
    li.innerHTML = `<strong>${typeLabel} - ${item.name}</strong> (${new Date(item.date).toLocaleString()}): ${item.details}`;
    if (item.image && item.image !== DEFAULT_NEED_IMAGE) {
      li.innerHTML += `<br><img src="${item.image}" alt="${item.needType} image" loading="lazy" style="max-width: 100%; height: auto;">`;
    }
    list.appendChild(li);
  });
}

// EVENTS
function addEvent() {
  const titleEl = document.getElementById('event-title');
  const dateEl = document.getElementById('event-date');
  const imageEl = document.getElementById('event-image');
  const linkEl = document.getElementById('event-link');
  const submitBtn = document.querySelector('.event-form button');

  if (!titleEl || !dateEl) return;

  const title = escapeHTML(titleEl.value.trim());
  const date = dateEl.value;
  let image = imageEl ? imageEl.value.trim() : '';
  let link = linkEl ? escapeHTML(linkEl.value.trim()) : '';

  if (!title || !date) {
    alert('Please fill in the title and date.');
    return;
  }

  if (image && !/^https?:\/\/.+/.test(image)) {
    alert('Invalid image URL.');
    return;
  }

  if (link && !/^https?:\/\/.+/.test(link)) {
    alert('Invalid event link URL.');
    return;
  }

  submitBtn.disabled = true;
  
  const event = {
    id: Date.now(),
    title,
    date,
    image,
    link,
    status: 'pending',
    type: 'event',
    submittedDate: new Date().toISOString()
  };

  const pending = getFromLocalStorage('pendingApprovals');
  pending.push(event);
  saveToLocalStorage('pendingApprovals', pending);

  sendEmailNotification('Event', event);

  titleEl.value = '';
  dateEl.value = '';
  if (imageEl) imageEl.value = '';
  if (linkEl) linkEl.value = '';
  submitBtn.disabled = false;

  alert('Event submitted! It will be visible after admin approval.');
}

function renderEvents() {
  const list = document.getElementById('events-list');
  if (!list) return;

  list.innerHTML = '';
  
  const events = getFromLocalStorage('events')
    .filter(item => item.status === 'approved')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (events.length === 0) {
    list.innerHTML = '<li>No events scheduled yet.</li>';
    return;
  }

  events.forEach(item => {
    const li = document.createElement('li');
    let content = `<strong>${item.title}</strong> (${new Date(item.date).toLocaleString()})`;
    if (item.link) content += ` <a href="${item.link}" target="_blank" rel="noopener noreferrer">Details</a>`;
    if (item.image) content += `<br><img src="${item.image}" alt="Event image" loading="lazy" style="max-width: 100%; height: auto;">`;
    li.innerHTML = content;
    list.appendChild(li);
  });
}

// Check if user is admin
function isAdmin() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const adminUsers = getFromLocalStorage('adminUsers');
  return adminUsers.some(admin => admin.email === currentUser.email);
}

// Update pending count badge
function updatePendingCount() {
  const pending = getFromLocalStorage('pendingApprovals');
  const badge = document.getElementById('pending-count');
  if (badge) {
    badge.textContent = pending.length;
    badge.style.display = pending.length > 0 ? 'inline-block' : 'none';
  }
}

// LOAD PAGE DATA
if (document.getElementById('ann-list')) renderAnnouncements();
if (document.getElementById('prayer-list')) renderPrayers();
if (document.getElementById('needs-list')) renderNeeds();
if (document.getElementById('events-list')) renderEvents();

// Update pending count on page load
updatePendingCount();

const chatBtn = document.getElementById('chat-button');
const chatWidget = document.getElementById('chat-widget');
const closeChatBtn = document.getElementById('close-chat');

if (chatBtn && chatWidget && closeChatBtn) {
  chatBtn.addEventListener('click', () => {
    chatWidget.classList.add('open');
  });

  closeChatBtn.addEventListener('click', () => {
    chatWidget.classList.remove('open');
  });

  // Optional: ESC key closes chat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      chatWidget.classList.remove('open');
    }
  });
}

chatBtn.addEventListener('click', () => {
  chatWidget.classList.add('open');
  document.body.classList.add('chat-open');
});

closeChatBtn.addEventListener('click', () => {
  chatWidget.classList.remove('open');
  document.body.classList.remove('chat-open');
});

document.addEventListener('DOMContentLoaded', () => {
  const adminLink = document.querySelector('.admin-link');

  if (!adminLink) return;

  if (isAdmin()) {
    adminLink.style.display = 'inline-block';
  } else {
    adminLink.style.display = 'none';
  }
});

document.querySelectorAll('.admin-only').forEach(el => {
  if (isAdmin()) el.style.display = 'block';
});
