const hamburger = document.querySelector(".hamburger-menu");
const navLinks = document.querySelector(".nav-links");
const authLinks = document.querySelector(".auth-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    authLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
});

// =========================
// SIGN UP
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    const signinForm = document.getElementById("signin-form");
  
    // --- SIGN UP ---
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const username = document.getElementById("username").value;
  
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Set display name
            return userCredential.user.updateProfile({
              displayName: username
            });
          })
          .then(() => {
            alert("Account created successfully! You can now sign in.");
            window.location.href = "signin.html";
          })
          .catch((error) => {
            alert(error.message);
          });
      });
    }
  
    // --- SIGN IN ---
    if (signinForm) {
      signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
  
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            alert(`Welcome back, ${user.displayName || "Member"}!`);
            window.location.href = "index.html";
          })
          .catch((error) => {
            alert(error.message);
          });
      });
    }
  });

  
// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            hamburgerMenu.classList.toggle('active');
            hamburgerMenu.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        });
    }

    // Load data based on current page
    if (document.getElementById('ann-list')) loadAnnouncements();
    if (document.getElementById('prayer-list')) loadPrayers();
    if (document.getElementById('needs-list')) loadNeeds();
    if (document.getElementById('events-list')) loadEvents();
});

// LocalStorage helpers
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Placeholder images
const DEFAULT_PRAYER_IMAGE = 'https://images.unsplash.com/photo-1517486430290-6979eb1ebb64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'; // Candle
const DEFAULT_NEED_IMAGE = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'; // Helping hands

// Announcements
function addAnnouncement() {
    const title = document.getElementById('ann-title')?.value.trim();
    const body = document.getElementById('ann-body')?.value.trim();
    const image = document.getElementById('ann-image')?.value.trim();
    if (!title || !body) {
        alert('Please fill in the title and body.');
        return;
    }
    const announcements = getFromLocalStorage('announcements');
    announcements.push({ title, body, image, date: new Date().toISOString() });
    saveToLocalStorage('announcements', announcements);
    renderAnnouncements();
    document.getElementById('ann-title').value = '';
    document.getElementById('ann-body').value = '';
    document.getElementById('ann-image').value = '';
    alert('Announcement posted successfully!');
}

function loadAnnouncements() {
    renderAnnouncements();
}

function renderAnnouncements() {
    const list = document.getElementById('ann-list');
    if (list) {
        list.innerHTML = '';
        const announcements = getFromLocalStorage('announcements')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        announcements.forEach(item => {
            const li = document.createElement('li');
            let content = `<strong>${item.title}</strong> (${new Date(item.date).toLocaleString()}): ${item.body}`;
            if (item.image) {
                content += `<img src="${item.image}" alt="Announcement image" loading="lazy">`;
            }
            li.innerHTML = content;
            list.appendChild(li);
        });
    }
}

// Prayer Requests
function submitPrayer() {
    const name = document.getElementById('prayer-name')?.value.trim() || 'Anonymous';
    const msg = document.getElementById('prayer-msg')?.value.trim();
    const image = document.getElementById('prayer-image')?.value.trim() || DEFAULT_PRAYER_IMAGE;
    const isPrivate = document.getElementById('prayer-private')?.checked;
    if (!msg) {
        alert('Please describe your prayer request.');
        return;
    }
    const prayers = getFromLocalStorage('prayers');
    prayers.push({ name, msg, image, private: isPrivate, date: new Date().toISOString() });
    saveToLocalStorage('prayers', prayers);
    renderPrayers();
    clearPrayerForm();
    alert('Your prayer request has been submitted and will be reviewed by our team.');
}

function clearPrayerForm() {
    document.getElementById('prayer-name').value = '';
    document.getElementById('prayer-msg').value = '';
    document.getElementById('prayer-image').value = '';
    document.getElementById('prayer-private').checked = false;
}

function loadPrayers() {
    renderPrayers();
}

function renderPrayers() {
    const list = document.getElementById('prayer-list');
    const featuredList = document.getElementById('prayer-featured-list');
    if (list && featuredList) {
        list.innerHTML = '';
        featuredList.innerHTML = '';
        const prayers = getFromLocalStorage('prayers')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        let featuredAdded = false;
        prayers.forEach((item, index) => {
            if (!item.private) {
                const li = document.createElement('li');
                let content = `<strong>${item.name}</strong> (${new Date(item.date).toLocaleString()}): ${item.msg}`;
                if (item.image) {
                    content += `<img src="${item.image}" alt="Prayer request image" loading="lazy">`;
                }
                content += `<button class="share-button facebook" aria-label="Share prayer on Facebook" onclick="sharePrayer(${index}, 'facebook')"><i class="fab fa-facebook"></i> Share</button>`;
                content += `<button class="share-button instagram" aria-label="Share prayer on Instagram" onclick="sharePrayer(${index}, 'instagram')"><i class="fab fa-instagram"></i> Share</button>`;
                li.innerHTML = content;
                if (!featuredAdded) {
                    featuredList.appendChild(li.cloneNode(true));
                    featuredAdded = true;
                } else {
                    list.appendChild(li);
                }
            }
        });
        if (!featuredAdded) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Community Prayer</strong> (Ongoing): Please join us in praying for our congregation's strength and unity. <img src="${DEFAULT_PRAYER_IMAGE}" alt="Default prayer image" loading="lazy">`;
            featuredList.appendChild(li);
        }
    }
}

function sharePrayer(index, platform) {
    const prayers = getFromLocalStorage('prayers');
    const prayer = prayers[index];
    if (!prayer || prayer.private) return;
    const text = encodeURIComponent(`Prayer Request from NG Kerk Wonderpark: ${prayer.name} - ${prayer.msg}`);
    const url = platform === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`
        : `https://www.instagram.com/`;
    window.open(url, '_blank');
    if (platform === 'instagram') {
        alert('To share on Instagram, please copy this text and paste it into your Instagram post: ' + decodeURIComponent(text));
    }
}

// Needs & Offers
function submitNeed() {
    const type = document.querySelector('input[name="need-type"]:checked')?.value;
    const name = document.getElementById('need-name')?.value.trim() || 'Anonymous';
    const details = document.getElementById('need-details')?.value.trim();
    const image = document.getElementById('need-image')?.value.trim() || DEFAULT_NEED_IMAGE;
    if (!details || !type) {
        alert('Please select a type and describe your need or offer.');
        return;
    }
    const needs = getFromLocalStorage('needs');
    needs.push({ type, name, details, image, date: new Date().toISOString() });
    saveToLocalStorage('needs', needs);
    renderNeeds();
    clearNeedsForm();
    alert('Your need or offer has been posted and will be reviewed by our team.');
}

function clearNeedsForm() {
    document.getElementById('need-name').value = '';
    document.getElementById('need-details').value = '';
    document.getElementById('need-image').value = '';
    document.querySelector('input[name="need-type"][value="need"]').checked = true;
}

function loadNeeds() {
    renderNeeds();
}

function renderNeeds() {
    const list = document.getElementById('needs-list');
    const featuredList = document.getElementById('needs-featured-list');
    if (list && featuredList) {
        list.innerHTML = '';
        featuredList.innerHTML = '';
        const needs = getFromLocalStorage('needs')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        let featuredAdded = false;
        needs.forEach((item, index) => {
            const li = document.createElement('li');
            let content = `<strong>${item.type.toUpperCase()} - ${item.name}</strong> (${new Date(item.date).toLocaleString()}): ${item.details}`;
            if (item.image) {
                content += `<img src="${item.image}" alt="${item.type} image" loading="lazy">`;
            }
            content += `<button class="share-button facebook" aria-label="Share ${item.type} on Facebook" onclick="shareNeed(${index}, 'facebook')"><i class="fab fa-facebook"></i> Share</button>`;
            content += `<button class="share-button instagram" aria-label="Share ${item.type} on Instagram" onclick="shareNeed(${index}, 'instagram')"><i class="fab fa-instagram"></i> Share</button>`;
            li.innerHTML = content;
            if (!featuredAdded) {
                featuredList.appendChild(li.cloneNode(true));
                featuredAdded = true;
            } else {
                list.appendChild(li);
            }
        });
        if (!featuredAdded) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Community Need</strong> (Ongoing): We are seeking volunteers to support our outreach programs. <img src="${DEFAULT_NEED_IMAGE}" alt="Default need image" loading="lazy">`;
            featuredList.appendChild(li);
        }
    }
}

function shareNeed(index, platform) {
    const needs = getFromLocalStorage('needs');
    const need = needs[index];
    if (!need) return;
    const text = encodeURIComponent(`Need/Offer from NG Kerk Wonderpark: ${need.type.toUpperCase()} - ${need.name} - ${need.details}`);
    const url = platform === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`
        : `https://www.instagram.com/`;
    window.open(url, '_blank');
    if (platform === 'instagram') {
        alert('To share on Instagram, please copy this text and paste it into your Instagram post: ' + decodeURIComponent(text));
    }
}

// Events
function addEvent() {
    const title = document.getElementById('event-title')?.value.trim();
    const date = document.getElementById('event-date')?.value;
    if (!title || !date) {
        alert('Please fill in the title and date.');
        return;
    }
    const events = getFromLocalStorage('events');
    events.push({ title, date });
    saveToLocalStorage('events', events);
    renderEvents();
    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = '';
    alert('Event added successfully!');
}

function loadEvents() {
    renderEvents();
}

function renderEvents() {
    const list = document.getElementById('events-list');
    if (list) {
        list.innerHTML = '';
        getFromLocalStorage('events').sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${new Date(item.date).toLocaleString()}</strong> - ${item.title}`;
            list.appendChild(li);
        });
    }
}