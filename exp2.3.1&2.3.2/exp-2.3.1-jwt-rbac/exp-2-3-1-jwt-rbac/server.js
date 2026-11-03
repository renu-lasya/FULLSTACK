/**
 * Experiment 2.3.1 – JWT Authentication + Role-Based Access Control (RBAC)
 * --------------------------------------------------------------------------
 * Pure Node.js (no Express, no MongoDB, no external JWT library).
 * Demonstrates:
 *   - Stateless JWT authentication (custom HS256 implementation)
 *   - Security filter chain style request interception
 *   - Role-Based Access Control (ADMIN / EDITOR / VIEWER)
 *   - Protected endpoints with different access levels
 *
 * Run:  node server.js
 * Open: http://localhost:4331
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4331;
const SECRET =
  process.env.JWT_SECRET ||
  "mySecretKeyForJwtAuthenticationMustBeLongEnough123456";
const PUBLIC_DIR = path.join(__dirname, "public");

/* ------------------------------------------------------------------ */
/*  In-memory user store (no database required)                       */
/* ------------------------------------------------------------------ */
const USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "ADMIN",
    name: "Aria Voss",
    title: "Platform Administrator",
  },
  {
    username: "editor",
    password: "editor123",
    role: "EDITOR",
    name: "Kai Rivera",
    title: "Content Editor",
  },
  {
    username: "viewer",
    password: "viewer123",
    role: "VIEWER",
    name: "Sam Patel",
    title: "Read-only Viewer",
  },
];

/* ------------------------------------------------------------------ */
/*  Custom JWT helpers (HS256) – mirrors Spring Security JWT concept  */
/* ------------------------------------------------------------------ */
function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload, expiresInSec = 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${h}.${p}.${sig}`;
}

function decodePart(part) {
  const pad = part.length % 4 === 0 ? "" : "=".repeat(4 - (part.length % 4));
  const json = Buffer.from(
    part.replace(/-/g, "+").replace(/_/g, "/") + pad,
    "base64"
  ).toString("utf8");
  return JSON.parse(json);
}

function verifyJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "Malformed token" };
  }
  const [h, p, s] = parts;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "Signature mismatch — token was modified" };
  }
  let header, payload;
  try {
    header = decodePart(h);
    payload = decodePart(p);
  } catch {
    return { ok: false, reason: "Unreadable claims" };
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "Token expired", payload, header };
  }
  return { ok: true, header, payload };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const SUBMITTED_BY = "RENULASYA 24BAI70210";

function send(res, status, data) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    data.submittedBy = SUBMITTED_BY;
  }
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(body);
}

/**
 * Authentication filter (conceptually like JwtAuthenticationFilter
 * in Spring Security). Reads Authorization header, validates JWT,
 * extracts username + role into a "SecurityContext".
 */
function authenticate(req) {
  const header = req.headers.authorization || "";
  const trace = [
    "1. Request enters the security filter chain",
    "2. JwtAuthenticationFilter reads Authorization header",
  ];

  if (!header) {
    trace.push("3. No Authorization header — request stays anonymous");
    return { user: null, trace, error: "Missing JWT", status: 401 };
  }
  if (!header.startsWith("Bearer ")) {
    trace.push("3. Header does not start with Bearer");
    return { user: null, trace, error: "Bearer scheme required", status: 401 };
  }

  trace.push("3. Bearer prefix confirmed");
  const token = header.slice(7);
  const checked = verifyJwt(token);

  if (!checked.ok) {
    trace.push(`4. Validation failed: ${checked.reason}`);
    trace.push("5. SecurityContext cleared");
    return { user: null, trace, error: checked.reason, status: 401, token };
  }

  const role = checked.payload.role;
  trace.push(`4. Username extracted: ${checked.payload.sub}`);
  trace.push(`5. Role claim extracted: ${role}`);
  trace.push(`6. Authority created: ROLE_${role}`);
  trace.push("7. Authentication placed in SecurityContext");

  return {
    user: {
      username: checked.payload.sub,
      role,
      authority: `ROLE_${role}`,
      name: checked.payload.name,
      title: checked.payload.title,
    },
    trace,
    token,
    payload: checked.payload,
  };
}

/** Role check helper (RBAC) */
function allow(user, allowedRoles) {
  return user && allowedRoles.includes(user.role);
}

/* ------------------------------------------------------------------ */
/*  Static file serving                                               */
/* ------------------------------------------------------------------ */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(req, res) {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

/* ------------------------------------------------------------------ */
/*  HTTP Server & Routes                                              */
/* ------------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    /* ---------- Public: Login ---------- */
    if (pathname === "/auth/login" && req.method === "POST") {
      const body = await readBody(req);
      const username = (body.username || "").trim();
      const password = body.password || "";

      const found = USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (!found) {
        return send(res, 401, {
          error: "Invalid credentials",
          message: "Username or password is incorrect",
        });
      }

      // Create JWT with role claim (like Spring Security authorities)
      const token = signJwt({
        sub: found.username,
        role: found.role,
        name: found.name,
        title: found.title,
      });

      return send(res, 200, {
        message: "Login successful — JWT issued",
        token,
        user: {
          username: found.username,
          role: found.role,
          name: found.name,
          title: found.title,
          authority: `ROLE_${found.role}`,
        },
        expiresIn: "1 hour",
      });
    }

    /* ---------- Protected: Current user ---------- */
    if (pathname === "/api/me" && req.method === "GET") {
      const auth = authenticate(req);
      if (!auth.user) {
        return send(res, auth.status, {
          error: auth.error,
          trace: auth.trace,
        });
      }
      return send(res, 200, {
        message: "Authenticated user",
        user: auth.user,
        trace: auth.trace,
        tokenPreview: auth.token ? auth.token.slice(0, 40) + "…" : null,
      });
    }

    /* ---------- ADMIN only ---------- */
    if (pathname === "/api/admin" && req.method === "GET") {
      const auth = authenticate(req);
      if (!auth.user) {
        return send(res, auth.status, {
          error: auth.error,
          trace: auth.trace,
        });
      }
      if (!allow(auth.user, ["ADMIN"])) {
        return send(res, 403, {
          error: "Access denied",
          message: `Role ${auth.user.role} is not allowed. Required: ADMIN`,
          yourRole: auth.user.role,
          requiredRoles: ["ADMIN"],
          trace: auth.trace,
        });
      }
      return send(res, 200, {
        message: "Welcome to the Admin dashboard",
        page: "ADMIN",
        description:
          "Full system control. You can manage users, view audit logs, and configure security.",
        features: [
          "User management",
          "Role assignment",
          "System configuration",
          "Audit logs",
        ],
        user: auth.user,
        trace: auth.trace,
      });
    }

    /* ---------- EDITOR (ADMIN + EDITOR) ---------- */
    if (pathname === "/api/editor" && req.method === "GET") {
      const auth = authenticate(req);
      if (!auth.user) {
        return send(res, auth.status, {
          error: auth.error,
          trace: auth.trace,
        });
      }
      if (!allow(auth.user, ["ADMIN", "EDITOR"])) {
        return send(res, 403, {
          error: "Access denied",
          message: `Role ${auth.user.role} is not allowed. Required: ADMIN or EDITOR`,
          yourRole: auth.user.role,
          requiredRoles: ["ADMIN", "EDITOR"],
          trace: auth.trace,
        });
      }
      return send(res, 200, {
        message: "Welcome to the Editor workspace",
        page: "EDITOR",
        description:
          "You can create and edit content. Viewers cannot reach this page.",
        features: [
          "Create articles",
          "Edit drafts",
          "Publish content",
          "Preview pages",
        ],
        user: auth.user,
        trace: auth.trace,
      });
    }

    /* ---------- VIEWER (any authenticated role) ---------- */
    if (pathname === "/api/viewer" && req.method === "GET") {
      const auth = authenticate(req);
      if (!auth.user) {
        return send(res, auth.status, {
          error: auth.error,
          trace: auth.trace,
        });
      }
      // All authenticated roles can access viewer
      if (!allow(auth.user, ["ADMIN", "EDITOR", "VIEWER"])) {
        return send(res, 403, {
          error: "Access denied",
          message: "Valid role required",
          yourRole: auth.user.role,
          trace: auth.trace,
        });
      }
      return send(res, 200, {
        message: "Welcome to the Viewer page",
        page: "VIEWER",
        description:
          "Read-only access. You can view published content but cannot modify anything.",
        features: [
          "View published articles",
          "Browse public dashboards",
          "Read-only reports",
        ],
        user: auth.user,
        trace: auth.trace,
      });
    }

    /* ---------- Public info endpoint ---------- */
    if (pathname === "/api/info" && req.method === "GET") {
      return send(res, 200, {
        experiment: "2.3.1",
        title: "JWT Authentication and Role-Based Access Control",
        roles: ["ADMIN", "EDITOR", "VIEWER"],
        demoAccounts: [
          { username: "admin", password: "admin123", role: "ADMIN" },
          { username: "editor", password: "editor123", role: "EDITOR" },
          { username: "viewer", password: "viewer123", role: "VIEWER" },
        ],
        endpoints: {
          login: "POST /auth/login",
          me: "GET /api/me  (any authenticated)",
          admin: "GET /api/admin  (ADMIN only)",
          editor: "GET /api/editor  (ADMIN + EDITOR)",
          viewer: "GET /api/viewer  (ADMIN + EDITOR + VIEWER)",
        },
      });
    }

    /* ---------- Static files ---------- */
    if (req.method === "GET") {
      return serveStatic(req, res);
    }

    send(res, 404, { error: "Not found", path: pathname });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: "Internal server error", detail: err.message });
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log("======================================================");
  console.log("  Experiment 2.3.1 – JWT + RBAC");
  console.log("  Submitted by: RENULASYA  24BAI70210");
  console.log("======================================================");
  console.log(`  Server running on  http://localhost:${PORT}`);
  console.log("");
  console.log("  Demo accounts:");
  console.log("    admin  / admin123   → ADMIN  (full access)");
  console.log("    editor / editor123  → EDITOR (edit + view)");
  console.log("    viewer / viewer123  → VIEWER (view only)");
  console.log("");
  console.log("  Open the browser and try each role.");
  console.log("======================================================");
  console.log("");
});
