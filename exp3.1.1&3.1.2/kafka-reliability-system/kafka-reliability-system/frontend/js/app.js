/**
 * Kafka Reliability Dashboard – Experiment 3.1.1
 * RENULASYA 24BAI70210
 */
const API = "http://localhost:8080/api";
let lastLogCount = 0;

/* ---- Navigation ---- */
document.querySelectorAll(".nav").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
    document.querySelector(`#page-${btn.dataset.page}`).classList.remove("hidden");
    document.querySelector("#page-title").textContent = btn.textContent.trim();
  });
});

/* ---- Toast ---- */
function toast(msg) {
  const t = document.querySelector("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2800);
}

/* ---- API helpers ---- */
async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}
async function post(path, body) {
  const r = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || r.statusText);
  return json;
}

/* ---- Stats ---- */
async function refreshStats() {
  try {
    const s = await get("/stats");
    document.querySelector("#s-total").textContent = s.totalEvents;
    document.querySelector("#s-success").textContent = s.successful;
    document.querySelector("#s-failed").textContent = s.failed;
    document.querySelector("#s-retried").textContent = s.retried;
    document.querySelector("#s-dlq").textContent = s.dlq;
    document.querySelector("#s-dup").textContent = s.duplicates;
    document.querySelector("#s-proc").textContent = s.processing;
    document.querySelector("#conn").textContent = "API online";
    document.querySelector("#conn").className = "conn online";
  } catch {
    document.querySelector("#conn").textContent = "API offline";
    document.querySelector("#conn").className = "conn offline";
  }
}

/* ---- Logs / Live feed ---- */
function statusIcon(st) {
  const map = {
    SUCCESS: "✓",
    FAILED: "✗",
    RETRYING: "↻",
    DLQ: "☠",
    DUPLICATE: "⚠",
    PROCESSING: "…",
    RECEIVED: "↓",
  };
  return map[st] || "•";
}

async function refreshLogs() {
  try {
    const logs = await get("/logs");
    const tbody = document.querySelector("#log-body");
    tbody.innerHTML = logs
      .slice(0, 80)
      .map(
        (l) => `
      <tr>
        <td>${l.eventId || ""}</td>
        <td>${l.postId || ""}</td>
        <td>${l.platform || ""}</td>
        <td><span class="badge ${l.status}">${l.status}</span></td>
        <td>${l.attempt || 0}</td>
        <td>${l.message || ""}${l.error ? " — " + l.error : ""}</td>
        <td>${l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ""}</td>
      </tr>`
      )
      .join("");

    const feed = document.querySelector("#live-feed");
    const recent = logs.slice(0, 25);
    feed.innerHTML = recent
      .map(
        (l) =>
          `<div class="live-item">${statusIcon(l.status)} <strong>${l.eventId}</strong> — ${l.message || l.status}${
            l.error ? " (" + l.error + ")" : ""
          }</div>`
      )
      .join("");
  } catch (_) {}
}

/* ---- DLQ ---- */
async function refreshDlq() {
  try {
    const items = await get("/dlq");
    const tbody = document.querySelector("#dlq-body");
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted)">DLQ is empty</td></tr>`;
      return;
    }
    tbody.innerHTML = items
      .map(
        (e) => `
      <tr>
        <td>${e.eventId}</td>
        <td>${e.postId || ""}</td>
        <td>${e.errorMessage || "Max retries exceeded"}</td>
        <td>${e.attempt || 3}</td>
        <td><span class="badge DLQ">DLQ</span></td>
        <td><button class="btn-sm" onclick="retryDlq('${e.eventId}')">Retry from DLQ</button></td>
      </tr>`
      )
      .join("");
  } catch (_) {}
}

window.retryDlq = async function (eventId) {
  try {
    await post(`/dlq/${eventId}/retry`);
    toast("Re-queued " + eventId + " from DLQ");
    refreshAll();
  } catch (err) {
    toast("Error: " + err.message);
  }
};

/* ---- Publish ---- */
document.querySelector("#btn-publish").addEventListener("click", async () => {
  const event = {
    eventId: document.querySelector("#f-eventId").value.trim() || undefined,
    postId: document.querySelector("#f-postId").value.trim() || undefined,
    userName: document.querySelector("#f-user").value.trim() || "Lasya",
    platform: document.querySelector("#f-platform").value,
    content: document.querySelector("#f-content").value,
    scheduledTime: document.querySelector("#f-time").value,
    failureSimulation: document.querySelector("#f-fail").value,
  };
  try {
    const res = await post("/events", event);
    document.querySelector("#publish-msg").textContent =
      "Published " + res.event.eventId + " → scheduled-posts";
    toast("Event published: " + res.event.eventId);
    // clear event id so next is unique unless user sets it
    document.querySelector("#f-eventId").value = "";
  } catch (err) {
    document.querySelector("#publish-msg").textContent = "Error: " + err.message;
  }
});

/* ---- Demo buttons ---- */
document.querySelectorAll(".demo-btn").forEach((btn) => {
  btn.addEventListener("click", () => runDemo(btn.dataset.demo));
});

async function runDemo(type) {
  const log = document.querySelector("#demo-log");
  const add = (t) => {
    log.innerHTML = `<div class="live-item">${t}</div>` + log.innerHTML;
  };

  const publish = async (ev) => {
    const res = await post("/events", ev);
    add("Published " + res.event.eventId + " [" + (ev.failureSimulation || "SUCCESS") + "]");
    return res.event.eventId;
  };

  try {
    if (type === "success") {
      await publish({
        eventId: "EVT-S-" + Date.now(),
        userName: "Lasya",
        platform: "Instagram",
        content: "Success demo",
        failureSimulation: "SUCCESS",
      });
    } else if (type === "fail_once") {
      await publish({
        eventId: "EVT-R1-" + Date.now(),
        userName: "Lasya",
        platform: "Twitter",
        content: "Fail once then success",
        failureSimulation: "FAIL_ONCE",
      });
    } else if (type === "fail_twice") {
      await publish({
        eventId: "EVT-R2-" + Date.now(),
        userName: "Lasya",
        platform: "LinkedIn",
        content: "Fail twice then success",
        failureSimulation: "FAIL_TWICE",
      });
    } else if (type === "always_fail") {
      await publish({
        eventId: "EVT-DLQ-" + Date.now(),
        userName: "Lasya",
        platform: "Facebook",
        content: "Always fail → DLQ",
        failureSimulation: "ALWAYS_FAIL",
      });
    } else if (type === "duplicate") {
      const id = "EVT-DUP-" + Date.now();
      await publish({
        eventId: id,
        userName: "Lasya",
        platform: "Instagram",
        content: "First – should succeed",
        failureSimulation: "SUCCESS",
      });
      // wait a bit then send same id again
      setTimeout(async () => {
        await publish({
          eventId: id,
          userName: "Lasya",
          platform: "Instagram",
          content: "Second – should be duplicate",
          failureSimulation: "SUCCESS",
        });
        add("Sent duplicate of " + id);
      }, 2500);
    } else if (type === "all") {
      add("Running all demo scenarios…");
      await runDemo("success");
      setTimeout(() => runDemo("fail_once"), 1500);
      setTimeout(() => runDemo("fail_twice"), 4000);
      setTimeout(() => runDemo("always_fail"), 10000);
      setTimeout(() => runDemo("duplicate"), 16000);
    }
    toast("Demo started: " + type);
  } catch (err) {
    add("Error: " + err.message);
  }
}

document.querySelector("#btn-reset").addEventListener("click", async () => {
  await post("/reset");
  toast("Stats & logs cleared");
  refreshAll();
});

function refreshAll() {
  refreshStats();
  refreshLogs();
  refreshDlq();
}

/* Poll every 1.5s for live updates */
setInterval(refreshAll, 1500);
refreshAll();
