document.querySelectorAll(".nav").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
    document.querySelector(`#page-${btn.dataset.page}`).classList.remove("hidden");
    document.querySelector("#page-title").textContent = btn.textContent.trim();
  });
});

async function refreshStats() {
  try {
    const s = await (await fetch("/api/canary/stats")).json();
    document.querySelector("#s-stable").textContent = s.stableVersion;
    document.querySelector("#s-canary").textContent = s.canaryVersion;
    document.querySelector("#s-pct").textContent = s.trafficPercent + "%";
    document.querySelector("#s-total").textContent = s.totalRequests;
    document.querySelector("#s-sh").textContent = s.stableHits;
    document.querySelector("#s-ch").textContent = s.canaryHits;
    document.querySelector("#conn").textContent = "API online";
    document.querySelector("#conn").className = "conn online";

    const recent = await (await fetch("/api/canary/recent")).json();
    document.querySelector("#recent").textContent = recent.length
      ? recent
          .slice(0, 15)
          .map((r) => `${r.track.padEnd(7)} ${r.userId} → ${r.version}`)
          .join("\n")
      : "(no requests yet)";
  } catch {
    document.querySelector("#conn").textContent = "API offline";
    document.querySelector("#conn").className = "conn offline";
  }
}

async function loadPipeline() {
  try {
    const d = await (await fetch("/api/cd/pipeline")).json();
    document.querySelector("#stages").innerHTML = (d.stages || [])
      .map(
        (s, i) =>
          `<div class="stage"><div class="stage-num">${i + 1}</div><div><strong>${s.name}</strong><span>${s.desc}</span></div></div>`
      )
      .join("")
    ;
  } catch (_) {}
}

function setMsg(text) {
  const out = document.querySelector("#sim-out");
  if (out) out.textContent = text;
}

async function setTraffic(percent) {
  try {
    const res = await fetch("/api/canary/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: Number(percent) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg("Error setting traffic: " + (data.message || res.status));
      return;
    }
    setMsg("✓ Canary traffic set to " + percent + "%\n" + JSON.stringify(data.stats || data, null, 2));
    await refreshStats();
  } catch (e) {
    setMsg("Network error: " + e.message);
  }
}

// Traffic buttons: 0%, 10%, 20%, 50%, 100% Promote
document.querySelectorAll("[data-pct]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const percent = parseInt(btn.getAttribute("data-pct"), 10);
    setTraffic(percent);
  });
});

document.querySelector("#btn-rollback").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/api/canary/rollback", { method: "POST" });
    const data = await res.json();
    setMsg("✓ Rollback done – 100% STABLE\n" + JSON.stringify(data.stats || data, null, 2));
    await refreshStats();
  } catch (err) {
    setMsg("Rollback error: " + err.message);
  }
});

document.querySelector("#btn-reset").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/canary/reset", { method: "POST" });
    setMsg("✓ Stats reset. Traffic back to 20% canary.");
    await refreshStats();
  } catch (err) {
    setMsg("Reset error: " + err.message);
  }
});

document.querySelector("#btn-sim").addEventListener("click", async (e) => {
  e.preventDefault();
  const lines = [];
  for (let i = 1; i <= 20; i++) {
    try {
      const r = await (await fetch("/api/hello?userId=user-" + i)).json();
      lines.push(`${String(i).padStart(2)}. ${r.track.padEnd(7)} ${r.version}`);
    } catch (err) {
      lines.push(`${String(i).padStart(2)}. ERROR ${err.message}`);
    }
  }
  setMsg(lines.join("\n"));
  await refreshStats();
});

loadPipeline();
refreshStats();
setInterval(refreshStats, 3000);
