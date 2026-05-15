console.log("Script loaded successfully");

const API = "http://127.0.0.1:5000";

let selectedRole = "";
let authMode = "login";
let currentUser = null;

function openAuth(role, mode) {
  selectedRole = role;
  authMode = mode;

  document.getElementById("authBox").classList.remove("hidden");
  document.getElementById("loginMsg").innerText = "";

  updateAuthUI();

  if (mode === "login") {
    if (role === "organizer") {
      document.getElementById("email").value = "organizer@university.com";
      document.getElementById("password").value = "admin123";
    } else {
      document.getElementById("email").value = "student@university.com";
      document.getElementById("password").value = "student123";
    }
  } else {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  }
}

function updateAuthUI() {
  const titleRole = selectedRole === "organizer" ? "Organizer" : "Participant";
  const titleMode = authMode === "login" ? "Login" : "Signup";

  document.getElementById("authTitle").innerText = `${titleRole} ${titleMode}`;

  if (authMode === "signup") {
    document.getElementById("name").classList.remove("hidden");
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("signupBtn").classList.remove("hidden");
  } else {
    document.getElementById("name").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
    document.getElementById("signupBtn").classList.add("hidden");
  }
}

function switchMode() {
  authMode = authMode === "login" ? "signup" : "login";
  document.getElementById("loginMsg").innerText = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  updateAuthUI();
}

async function signup() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    document.getElementById("loginMsg").innerText = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: selectedRole
      })
    });

    const data = await res.json();
    document.getElementById("loginMsg").innerText = data.message;

    if (data.success) {
      authMode = "login";
      updateAuthUI();
      document.getElementById("password").value = "";
    }
  } catch (error) {
    document.getElementById("loginMsg").innerText = "Backend not running. Start Flask backend first.";
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    document.getElementById("loginMsg").innerText = "Please enter email and password.";
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.success) {
      document.getElementById("loginMsg").innerText = data.message;
      return;
    }

    if (data.user.role !== selectedRole) {
      document.getElementById("loginMsg").innerText = "Please choose the correct portal.";
      return;
    }

    currentUser = data.user;

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("userName").innerText = currentUser.name;
    document.getElementById("roleText").innerText =
      currentUser.role === "organizer" ? "Organizer Portal" : "Participant Portal";

    if (currentUser.role === "organizer") {
      document.getElementById("chatBtn").style.display = "none";
      document.getElementById("myRegBtn").style.display = "none";
      document.getElementById("addBtn").style.display = "block";
    } else {
      document.getElementById("chatBtn").style.display = "block";
      document.getElementById("myRegBtn").style.display = "block";
      document.getElementById("addBtn").style.display = "none";
    }

    loadDashboard();

  } catch (err) {
    document.getElementById("loginMsg").innerText = "Backend not running. Start Flask backend first.";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

async function loadDashboard() {
  const res = await fetch(`${API}/stats`);
  const s = await res.json();

  if (currentUser.role === "organizer") {
    document.getElementById("content").innerHTML = `
      <h1>Organizer Dashboard</h1>
      <p>Here's your university event overview for today</p>

      <div class="cards">
        <div class="card"><h2>${s.total_events}</h2><p>Total Events</p></div>
        <div class="card"><h2>${s.participants}</h2><p>Participants</p></div>
        <div class="card"><h2>${s.registrations}</h2><p>Registrations</p></div>
        <div class="card"><h2>${s.available_seats}</h2><p>Available Seats</p></div>
      </div>

      <br>

      <div class="card">
        <h3>Quick Actions</h3>
        <button onclick="loadAddEvent()">Add New Event</button>
        <button onclick="loadEvents()">View All Events</button>
      </div>
    `;
  } else {
    document.getElementById("content").innerHTML = `
      <h1>Participant Dashboard</h1>
      <p>Here's your event overview</p>

      <div class="cards">
        <div class="card"><h2>${s.total_events}</h2><p>Available Events</p></div>
        <div class="card"><h2>${s.registrations}</h2><p>Total Registrations</p></div>
        <div class="card"><h2>${s.available_seats}</h2><p>Open Seats</p></div>
        <div class="card"><h2>AI</h2><p>Event Assistant</p></div>
      </div>

      <br>

      <div class="card">
        <h3>AI Recommendation</h3>
        <p>Join AI Workshop or Hackathon 2026 to improve your technical skills.</p>
        <button onclick="loadEvents()">Explore Events</button>
        <button onclick="loadChat()">Ask AI Assistant</button>
      </div>
    `;
  }
}

async function loadEvents() {
  const res = await fetch(`${API}/events`);
  const events = await res.json();

  let html = `
    <h1>${currentUser.role === "organizer" ? "Manage Events" : "Find Events"}</h1>
    <div class="event-grid">
  `;

  events.forEach(e => {
    html += `
      <div class="event-card">
        <span class="badge">${e.category}</span>
        <h3>${e.title}</h3>
        <p>${e.description}</p>
        <p>Date: ${e.date} | Time: ${e.time}</p>
        <p>Venue: ${e.venue}</p>
        <p>Seats: ${e.seats}</p>
        ${currentUser.role === "participant" ? `<button onclick="registerEvent(${e.id})">Register</button>` : ""}
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById("content").innerHTML = html;
}

async function registerEvent(eventId) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: currentUser.id,
      event_id: eventId
    })
  });

  const data = await res.json();
  alert(data.message);
  loadEvents();
}

async function loadMyRegistrations() {
  const res = await fetch(`${API}/my-registrations/${currentUser.id}`);
  const regs = await res.json();

  let html = `
    <h1>My Registrations</h1>
    <div class="table-box">
      <div class="table-row table-head">
        <div>Event</div>
        <div>Date</div>
        <div>Time</div>
        <div>Venue</div>
      </div>
  `;

  if (regs.length === 0) {
    html += `<p>No registrations yet.</p>`;
  }

  regs.forEach(r => {
    html += `
      <div class="table-row">
        <div>${r.title}</div>
        <div>${r.date}</div>
        <div>${r.time}</div>
        <div>${r.venue}</div>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById("content").innerHTML = html;
}

function loadAddEvent() {
  document.getElementById("content").innerHTML = `
    <h1>Add New Event</h1>

    <div class="form-box">
      <input id="title" placeholder="Event Title">
      <input id="category" placeholder="Category">
      <input id="date" type="date">
      <input id="time" placeholder="Time">
      <input id="venue" placeholder="Venue">
      <input id="seats" type="number" placeholder="Seats">
      <textarea id="description" placeholder="Description"></textarea>

      <button onclick="addEvent()">Create Event</button>
    </div>
  `;
}

async function addEvent() {
  const eventData = {
    title: document.getElementById("title").value,
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    venue: document.getElementById("venue").value,
    seats: document.getElementById("seats").value,
    description: document.getElementById("description").value
  };

  const res = await fetch(`${API}/events`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(eventData)
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) {
    loadEvents();
  }
}

function loadChat() {
  document.getElementById("content").innerHTML = `
    <h1>AI Event Assistant</h1>

    <div class="chat-layout">
      <div class="chat-box">
        <div id="chatMessages" class="chat-messages">
          <div class="msg bot-msg">Hi! I am your AI event assistant. Ask me only about university events.</div>
        </div>

        <div class="chat-input">
          <input id="chatInput" placeholder="Ask about event date, venue, seats, registration...">
          <button onclick="askBot()">Send</button>
        </div>
      </div>

      <div class="card quick">
        <h3>Quick Questions</h3>
        <button onclick="quickAsk('What events are available?')">Available Events</button>
        <button onclick="quickAsk('How to register for event?')">How to Register</button>
        <button onclick="quickAsk('What are the event venues?')">Event Venues</button>
        <button onclick="quickAsk('How many seats are available?')">Available Seats</button>
      </div>
    </div>
  `;
}

function quickAsk(q) {
  document.getElementById("chatInput").value = q;
  askBot();
}

async function askBot() {
  const input = document.getElementById("chatInput");
  const question = input.value.trim();

  if (!question) return;

  const box = document.getElementById("chatMessages");

  box.innerHTML += `<div class="msg user-msg">${question}</div>`;
  input.value = "";

  const res = await fetch(`${API}/chatbot`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ question })
  });

  const data = await res.json();

  box.innerHTML += `<div class="msg bot-msg">${data.answer}</div>`;
  box.scrollTop = box.scrollHeight;
}