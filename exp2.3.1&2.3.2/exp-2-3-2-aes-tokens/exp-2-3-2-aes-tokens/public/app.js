/**
 * Frontend – Experiment 2.3.2 AES + Access/Refresh Tokens
 * RENULASYA 24BAI70210
 */

const loginScreen = document.querySelector("#login-screen");
const app = document.querySelector("#app");
const loginNote = document.querySelector("#login-note");
const loginForm = document.querySelector("#login-form");

let session = null; // { accessToken, refreshToken, user, accessExp }
let countdownTimer = null;

/* ---------- Helpers ---------- */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
}

async function api(method, path, body, useAuth = true) {
  const opts = {
    method,
    headers: useAuth && session ? authHeaders() : { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function showResult(el, ok, text) {
  el.className = "result-box " + (ok ? "ok" : "err");
  el.textContent = text;
}

/* ---------- Login ---------- */
document.querySelectorAll("[data-fill]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const map = {
      admin: { username: "admin", password: "admin123" },
      dev: { username: "dev", password: "dev123" },
    };
    const c = map[btn.dataset.fill];
    loginForm.username.value = c.username;
    loginForm.password.value = c.password;
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginNote.textContent = "Issuing tokens…";
  const body = Object.fromEntries(new FormData(loginForm));
  try {
    const { ok, json } = await api("POST", "/auth/login", body, false);
    if (!ok) {
      loginNote.textContent = json.error || "Login failed";
      loginNote.style.color = "#ef4444";
      return;
    }
    session = {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      user: json.user,
      accessExp: Math.floor(Date.now() / 1000) + (json.accessExpiresIn || 90),
    };
    loginNote.style.color = "";
    enterApp();
  } catch {
    loginNote.textContent = "Network error — is the server running?";
    loginNote.style.color = "#ef4444";
  }
});

function enterApp() {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
  document.querySelector("#who").innerHTML = `
    <strong>${session.user.name}</strong>
    <span class="role-pill">${session.user.username}</span>
  `;
  document.querySelector("#dash-name").textContent = session.user.name;
  updateTokenUI();
  startCountdown();
  showPage("dashboard");
}

function updateTokenUI() {
  if (!session) return;
  const a = session.accessToken;
  const r = session.refreshToken;
  document.querySelector("#access-preview").textContent =
    a.slice(0, 36) + "…" + a.slice(-12);
  document.querySelector("#refresh-preview").textContent =
    r.slice(0, 36) + "…" + r.slice(-12);
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  const tick = () => {
    if (!session) return;
    const left = Math.max(0, session.accessExp - Math.floor(Date.now() / 1000));
    const timerEl = document.querySelector("#timer");
    const cd = document.querySelector("#access-countdown");
    const badge = document.querySelector("#access-badge");
    timerEl.textContent = left > 0 ? `${left}s left` : "EXPIRED";
    if (cd) cd.textContent = left;
    timerEl.className = "timer" + (left === 0 ? " dead" : left <= 15 ? " warn" : "");
    if (badge) {
      badge.textContent = left > 0 ? "LIVE" : "EXPIRED";
      badge.className = "badge " + (left > 0 ? "live" : "expired");
    }
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ---------- Navigation ---------- */
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    showPage(btn.dataset.page);
  });
});

function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  const page = document.querySelector(`#page-${name}`);
  if (page) page.classList.remove("hidden");
  if (name === "tokens") updateTokenUI();
}

/* ---------- Token actions ---------- */
document.querySelector("#btn-refresh").addEventListener("click", async () => {
  const el = document.querySelector("#token-result");
  el.textContent = "Refreshing…";
  const { ok, status, json } = await api(
    "POST",
    "/auth/refresh",
    { refreshToken: session.refreshToken },
    false
  );
  if (ok) {
    session.accessToken = json.accessToken;
    session.refreshToken = json.refreshToken; // rotated
    session.accessExp = Math.floor(Date.now() / 1000) + (json.accessExpiresIn || 90);
    updateTokenUI();
    startCountdown();
    showResult(
      el,
      true,
      `✅ HTTP ${status}\n\n${json.message}\n\nNew access token issued.\nRefresh token rotated (old one is now invalid).\nAccess expires in ${json.accessExpiresIn}s.`
    );
  } else {
    showResult(el, false, `❌ HTTP ${status}\n\n${json.error}\n${json.reason || json.tip || ""}`);
  }
});

document.querySelector("#btn-test-me").addEventListener("click", async () => {
  const el = document.querySelector("#token-result");
  el.textContent = "Calling GET /api/me …";
  const { ok, status, json } = await api("GET", "/api/me");
  if (ok) {
    showResult(
      el,
      true,
      `✅ HTTP ${status}\n\n${json.message}\nUser: ${json.user.name} (${json.user.username})\nAccess token type: ${json.accessTokenClaims.type}\nExpires in: ${json.accessTokenClaims.expiresInSeconds}s\nHas refresh token on server: ${json.hasRefreshToken}`
    );
  } else {
    showResult(
      el,
      false,
      `❌ HTTP ${status}\n\n${json.error}\n${json.tip || ""}\n\n${json.expired ? "→ Click “Refresh Access Token” to get a new one." : ""}`
    );
  }
});

/* ---------- AES Demo ---------- */
document.querySelector("#btn-encrypt").addEventListener("click", async () => {
  const text = document.querySelector("#plain-in").value;
  const el = document.querySelector("#enc-out");
  if (!text) return showResult(el, false, "Enter some plaintext first.");
  const { ok, json } = await api("POST", "/api/demo/encrypt", { text }, false);
  if (ok) {
    document.querySelector("#cipher-in").value = json.ciphertext;
    document.querySelector("#iv-in").value = json.iv;
    showResult(
      el,
      true,
      `✅ ${json.message}\nAlgorithm: ${json.algorithm}\nKey size: ${json.keySize}\n\nCiphertext:\n${json.ciphertext}\n\nIV:\n${json.iv}\n\n${json.note}`
    );
  } else {
    showResult(el, false, json.error || "Encrypt failed");
  }
});

document.querySelector("#btn-decrypt").addEventListener("click", async () => {
  const ciphertext = document.querySelector("#cipher-in").value;
  const iv = document.querySelector("#iv-in").value;
  const el = document.querySelector("#dec-out");
  const { ok, json } = await api("POST", "/api/demo/decrypt", { ciphertext, iv }, false);
  if (ok) {
    showResult(el, true, `✅ ${json.message}\n\nPlaintext:\n${json.plaintext}`);
  } else {
    showResult(el, false, `❌ ${json.error}\n${json.detail || ""}`);
  }
});

/* ---------- Credential Vault ---------- */
document.querySelector("#btn-store").addEventListener("click", async () => {
  const label = document.querySelector("#cred-label").value;
  const secret = document.querySelector("#cred-secret").value;
  const el = document.querySelector("#vault-store-result");
  const { ok, status, json } = await api("POST", "/api/credentials", { label, secret });
  if (ok) {
    showResult(
      el,
      true,
      `✅ HTTP ${status}\n\n${json.message}\nAlgorithm: ${json.algorithm}\n\nStored (ciphertext only):\n  id: ${json.stored.id}\n  label: ${json.stored.label}\n  ciphertext: ${json.stored.ciphertext.slice(0, 40)}…\n  iv: ${json.stored.iv}\n\n${json.note}`
    );
    document.querySelector("#cred-id").value = json.stored.id;
  } else {
    showResult(el, false, `❌ HTTP ${status}\n\n${json.error}\n${json.tip || ""}`);
  }
});

document.querySelector("#btn-list").addEventListener("click", async () => {
  const el = document.querySelector("#vault-list");
  const { ok, status, json } = await api("GET", "/api/credentials");
  if (ok) {
    const lines = (json.credentials || [])
      .map((c) => `  • ${c.id}  |  ${c.label}  |  ${c.ciphertext}`)
      .join("\n");
    showResult(
      el,
      true,
      `✅ HTTP ${status}\n\n${json.message}\nCount: ${json.count}\n\n${lines || "(empty)"}`
    );
  } else {
    showResult(el, false, `❌ HTTP ${status}\n\n${json.error}\n${json.tip || ""}`);
  }
});

document.querySelector("#btn-decrypt-cred").addEventListener("click", async () => {
  const id = document.querySelector("#cred-id").value.trim();
  const el = document.querySelector("#vault-decrypt-result");
  if (!id) return showResult(el, false, "Enter a credential id.");
  const { ok, status, json } = await api("POST", "/api/credentials/decrypt", { id });
  if (ok) {
    showResult(
      el,
      true,
      `✅ HTTP ${status}\n\n${json.message}\nLabel: ${json.label}\nPlaintext: ${json.plaintext}\nAlgorithm: ${json.algorithm}\n\n${json.note}`
    );
  } else {
    showResult(el, false, `❌ HTTP ${status}\n\n${json.error}`);
  }
});

/* ---------- Logout ---------- */
document.querySelector("#logout-btn").addEventListener("click", async () => {
  if (session) {
    await api("POST", "/auth/logout", { refreshToken: session.refreshToken }).catch(() => {});
  }
  session = null;
  if (countdownTimer) clearInterval(countdownTimer);
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  loginNote.textContent = "Signed out. Tokens revoked.";
  loginNote.style.color = "";
});
