/**
 * Frontend for Experiment 2.3.1 – JWT + RBAC
 * Handles login, token storage, role-based navigation, and API calls.
 */

const loginScreen = document.querySelector("#login-screen");
const app = document.querySelector("#app");
const loginNote = document.querySelector("#login-note");
const loginForm = document.querySelector("#login-form");

let session = null; // { token, user }

/* ---------- Helpers ---------- */
function decodeJwtPart(part) {
  const pad = part.length % 4 === 0 ? "" : "=".repeat(4 - (part.length % 4));
  return JSON.parse(
    atob(part.replace(/-/g, "+").replace(/_/g, "/") + pad)
  );
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
  };
}

async function apiGet(path) {
  const res = await fetch(path, { headers: authHeaders() });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

/* ---------- Login ---------- */
document.querySelectorAll("[data-fill]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const map = {
      admin: { username: "admin", password: "admin123" },
      editor: { username: "editor", password: "editor123" },
      viewer: { username: "viewer", password: "viewer123" },
    };
    const creds = map[btn.dataset.fill];
    loginForm.username.value = creds.username;
    loginForm.password.value = creds.password;
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginNote.textContent = "Checking credentials…";
  const body = Object.fromEntries(new FormData(loginForm));

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (!res.ok) {
      loginNote.textContent = json.error || "Login failed";
      loginNote.style.color = "#ef4444";
      return;
    }

    session = { token: json.token, user: json.user };
    loginNote.style.color = "";
    enterApp();
  } catch (err) {
    loginNote.textContent = "Network error — is the server running?";
    loginNote.style.color = "#ef4444";
  }
});

function enterApp() {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  document.querySelector("#who").innerHTML = `
    <strong>${session.user.name}</strong>
    <span class="role">${session.user.role}</span>
  `;
  document.querySelector("#dash-name").textContent = session.user.name;
  document.querySelector("#dash-role").textContent = session.user.role;

  // Show/hide nav buttons by role
  const role = session.user.role;
  const editorBtn = document.querySelector("#nav-editor");
  const adminBtn = document.querySelector("#nav-admin");

  editorBtn.disabled = !(role === "ADMIN" || role === "EDITOR");
  adminBtn.disabled = role !== "ADMIN";

  // Role capability cards
  const cards = document.querySelector("#role-cards");
  cards.innerHTML = `
    <div class="card ok">
      <h3>👁️ Viewer</h3>
      <p>All roles can access</p>
    </div>
    <div class="card ${role === "ADMIN" || role === "EDITOR" ? "ok" : "denied"}">
      <h3>✏️ Editor</h3>
      <p>${role === "ADMIN" || role === "EDITOR" ? "You have access" : "Denied for VIEWER"}</p>
    </div>
    <div class="card ${role === "ADMIN" ? "ok" : "denied"}">
      <h3>🛠️ Admin</h3>
      <p>${role === "ADMIN" ? "You have full access" : "Admin only"}</p>
    </div>
  `;

  showPage("dashboard");
  renderTokenInspector();
}

/* ---------- Navigation ---------- */
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    showPage(btn.dataset.page);
  });
});

function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  const page = document.querySelector(`#page-${name}`);
  if (page) page.classList.remove("hidden");

  if (name === "viewer") loadProtected("/api/viewer", "#viewer-result");
  if (name === "editor") loadProtected("/api/editor", "#editor-result");
  if (name === "admin") loadProtected("/api/admin", "#admin-result");
  if (name === "token") renderTokenInspector();
}

async function loadProtected(endpoint, selector) {
  const el = document.querySelector(selector);
  el.className = "result-box";
  el.textContent = "Calling " + endpoint + " …";

  const { ok, status, json } = await apiGet(endpoint);

  if (ok) {
    el.classList.add("success");
    el.textContent =
      `✅ HTTP ${status}\n\n` +
      `Message: ${json.message}\n` +
      `Page: ${json.page}\n\n` +
      `Description:\n${json.description}\n\n` +
      `Features:\n${(json.features || []).map((f) => "  • " + f).join("\n")}\n\n` +
      `Your role: ${json.user.role}\n` +
      `Authority: ${json.user.authority}\n\n` +
      `Filter chain trace:\n${(json.trace || []).map((t) => "  " + t).join("\n")}`;
  } else {
    el.classList.add("error");
    el.textContent =
      `❌ HTTP ${status}\n\n` +
      `Error: ${json.error}\n` +
      (json.message ? `Message: ${json.message}\n` : "") +
      (json.yourRole ? `Your role: ${json.yourRole}\n` : "") +
      (json.requiredRoles
        ? `Required: ${json.requiredRoles.join(", ")}\n`
        : "") +
      `\nFilter chain trace:\n${(json.trace || []).map((t) => "  " + t).join("\n")}`;
  }
}

function renderTokenInspector() {
  if (!session) return;
  const [h, p, s] = session.token.split(".");
  document.querySelector("#token-parts").innerHTML = `
    <div class="bit h"><small>Header</small>${h}</div>
    <div class="bit p"><small>Payload</small>${p}</div>
    <div class="bit s"><small>Signature</small>${s}</div>
  `;
  try {
    const claims = decodeJwtPart(p);
    document.querySelector("#token-claims").textContent =
      "Decoded payload (claims):\n\n" + JSON.stringify(claims, null, 2);
  } catch {
    document.querySelector("#token-claims").textContent = "Could not decode payload";
  }
}

/* ---------- Logout ---------- */
document.querySelector("#logout-btn").addEventListener("click", () => {
  session = null;
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginNote.textContent = "Signed out. Choose a role to try again.";
  loginNote.style.color = "";
});
