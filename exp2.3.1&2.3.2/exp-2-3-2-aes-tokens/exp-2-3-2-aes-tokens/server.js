/**
 * Experiment 2.3.2 – AES Encryption + Access / Refresh Token Lifecycle
 * ---------------------------------------------------------------------
 * Pure Node.js (no Express, no MongoDB, no external crypto libraries).
 * Demonstrates:
 *   - AES-256-CBC encryption & decryption of sensitive data
 *   - Secure in-memory storage of encrypted OAuth-style credentials
 *   - Short-lived Access Tokens + long-lived Refresh Tokens
 *   - Token refresh and rotation
 *
 * Run:  node server.js
 * Open: http://localhost:4332
 *
 * Submitted by: RENULASYA  24BAI70210
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4332;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "mySecretKeyForJwtAuthenticationMustBeLongEnough123456";
/* 32-byte key for AES-256 (hex string → 32 bytes) */
const AES_KEY = Buffer.from(
  process.env.AES_KEY || "0123456789abcdef0123456789abcdef",
  "utf8"
);
const PUBLIC_DIR = path.join(__dirname, "public");

const SUBMITTED_BY = "RENULASYA 24BAI70210";

/* Access token lifetime (short for demo – 90 seconds) */
const ACCESS_TTL = 90;
/* Refresh token lifetime (longer – 1 hour) */
const REFRESH_TTL = 60 * 60;

/* ------------------------------------------------------------------ */
/*  In-memory stores                                                  */
/* ------------------------------------------------------------------ */
const USERS = [
  {
    username: "admin",
    password: "admin123",
    name: "Aria Voss",
    title: "Security Lead",
  },
  {
    username: "dev",
    password: "dev123",
    name: "Kai Rivera",
    title: "Backend Developer",
  },
];

/** username → { refreshToken, expiresAt } */
const refreshStore = new Map();

/**
 * Simulated secure credential vault.
 * Each entry stores AES-encrypted ciphertext of a sensitive value
 * (e.g. third-party OAuth client secret / API key).
 * Format: { id, label, ciphertext, iv, createdAt, owner }
 */
const credentialVault = [];

/* ------------------------------------------------------------------ */
/*  AES-256-CBC helpers                                               */
/* ------------------------------------------------------------------ */
function aesEncrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
  };
}

function aesDecrypt(ciphertext, ivHex) {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY, iv);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/* ------------------------------------------------------------------ */
/*  Custom JWT (HS256) – Access & Refresh                             */
/* ------------------------------------------------------------------ */
function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload, expiresInSec) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${h}.${p}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${h}.${p}.${sig}`;
}

function decodePart(part) {
  const pad = part.length % 4 === 0 ? "" : "=".repeat(4 - (part.length % 4));
  return JSON.parse(
    Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString(
      "utf8"
    )
  );
}

function verifyJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return { ok: false, reason: "Malformed token" };
  const [h, p, s] = parts;
  const expected = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${h}.${p}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "Signature mismatch" };
  }
  let payload;
  try {
    payload = decodePart(p);
  } catch {
    return { ok: false, reason: "Unreadable claims" };
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "Token expired", payload };
  }
  return { ok: true, payload };
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

function authenticateAccess(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid Authorization header", status: 401 };
  }
  const token = header.slice(7);
  const checked = verifyJwt(token);
  if (!checked.ok) {
    return { user: null, error: checked.reason, status: 401, expired: checked.reason === "Token expired" };
  }
  if (checked.payload.type !== "access") {
    return { user: null, error: "Not an access token", status: 401 };
  }
  return {
    user: {
      username: checked.payload.sub,
      name: checked.payload.name,
      title: checked.payload.title,
    },
    payload: checked.payload,
    token,
  };
}

function issueTokens(user) {
  const accessToken = signJwt(
    {
      sub: user.username,
      name: user.name,
      title: user.title,
      type: "access",
    },
    ACCESS_TTL
  );
  const refreshToken = signJwt(
    {
      sub: user.username,
      type: "refresh",
      jti: crypto.randomBytes(8).toString("hex"),
    },
    REFRESH_TTL
  );
  const exp = Math.floor(Date.now() / 1000) + REFRESH_TTL;
  refreshStore.set(user.username, { refreshToken, expiresAt: exp });
  return {
    accessToken,
    refreshToken,
    accessExpiresIn: ACCESS_TTL,
    refreshExpiresIn: REFRESH_TTL,
    tokenType: "Bearer",
  };
}

/* ------------------------------------------------------------------ */
/*  Static files                                                      */
/* ------------------------------------------------------------------ */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
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
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

/* ------------------------------------------------------------------ */
/*  HTTP Server                                                       */
/* ------------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
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
    /* ---------- Login → issue access + refresh ---------- */
    if (pathname === "/auth/login" && req.method === "POST") {
      const body = await readBody(req);
      const username = (body.username || "").trim();
      const password = body.password || "";
      const found = USERS.find((u) => u.username === username && u.password === password);
      if (!found) {
        return send(res, 401, { error: "Invalid credentials" });
      }
      const tokens = issueTokens(found);
      return send(res, 200, {
        message: "Login successful — access + refresh tokens issued",
        user: { username: found.username, name: found.name, title: found.title },
        ...tokens,
        note: `Access token expires in ${ACCESS_TTL}s (short-lived). Use refresh token to get a new one.`,
      });
    }

    /* ---------- Refresh access token (rotation) ---------- */
    if (pathname === "/auth/refresh" && req.method === "POST") {
      const body = await readBody(req);
      const refreshToken = body.refreshToken || "";
      const checked = verifyJwt(refreshToken);
      if (!checked.ok || checked.payload.type !== "refresh") {
        return send(res, 401, {
          error: "Invalid or expired refresh token",
          reason: checked.reason || "Not a refresh token",
        });
      }
      const username = checked.payload.sub;
      const stored = refreshStore.get(username);
      if (!stored || stored.refreshToken !== refreshToken) {
        return send(res, 401, {
          error: "Refresh token revoked or already rotated",
          tip: "Login again to obtain a new pair",
        });
      }
      const user = USERS.find((u) => u.username === username);
      if (!user) {
        return send(res, 401, { error: "User not found" });
      }
      /* Token rotation: old refresh is invalidated, new pair issued */
      const tokens = issueTokens(user);
      return send(res, 200, {
        message: "Access token refreshed (refresh token rotated)",
        ...tokens,
        note: "Previous refresh token is now invalid (rotation).",
      });
    }

    /* ---------- Logout / revoke refresh ---------- */
    if (pathname === "/auth/logout" && req.method === "POST") {
      const body = await readBody(req);
      const auth = authenticateAccess(req);
      const username =
        (auth.user && auth.user.username) ||
        (body.refreshToken && verifyJwt(body.refreshToken).payload?.sub);
      if (username) refreshStore.delete(username);
      return send(res, 200, { message: "Logged out — refresh token revoked" });
    }

    /* ---------- Current user (needs valid access token) ---------- */
    if (pathname === "/api/me" && req.method === "GET") {
      const auth = authenticateAccess(req);
      if (!auth.user) {
        return send(res, auth.status, {
          error: auth.error,
          expired: !!auth.expired,
          tip: auth.expired
            ? "Access token expired. Call POST /auth/refresh with your refresh token."
            : "Provide Authorization: Bearer <accessToken>",
        });
      }
      const stored = refreshStore.get(auth.user.username);
      return send(res, 200, {
        message: "Authenticated with access token",
        user: auth.user,
        accessTokenClaims: {
          type: auth.payload.type,
          exp: auth.payload.exp,
          expiresInSeconds: Math.max(0, auth.payload.exp - Math.floor(Date.now() / 1000)),
        },
        hasRefreshToken: !!stored,
      });
    }

    /* ---------- Store encrypted credential (AES) ---------- */
    if (pathname === "/api/credentials" && req.method === "POST") {
      const auth = authenticateAccess(req);
      if (!auth.user) {
        return send(res, auth.status, { error: auth.error, expired: !!auth.expired });
      }
      const body = await readBody(req);
      const label = (body.label || "").trim() || "Untitled credential";
      const secret = body.secret || "";
      if (!secret) {
        return send(res, 400, { error: "Field 'secret' is required (the sensitive value to encrypt)" });
      }
      const { ciphertext, iv } = aesEncrypt(secret);
      const entry = {
        id: crypto.randomBytes(6).toString("hex"),
        label,
        ciphertext,
        iv,
        createdAt: new Date().toISOString(),
        owner: auth.user.username,
      };
      credentialVault.push(entry);
      return send(res, 201, {
        message: "Credential encrypted with AES-256-CBC and stored securely",
        algorithm: "AES-256-CBC",
        stored: {
          id: entry.id,
          label: entry.label,
          ciphertext: entry.ciphertext,
          iv: entry.iv,
          createdAt: entry.createdAt,
          owner: entry.owner,
        },
        note: "Plaintext is never stored. Only ciphertext + IV are kept.",
      });
    }

    /* ---------- List credentials (ciphertext only) ---------- */
    if (pathname === "/api/credentials" && req.method === "GET") {
      const auth = authenticateAccess(req);
      if (!auth.user) {
        return send(res, auth.status, { error: auth.error, expired: !!auth.expired });
      }
      const mine = credentialVault
        .filter((c) => c.owner === auth.user.username)
        .map((c) => ({
          id: c.id,
          label: c.label,
          ciphertext: c.ciphertext.slice(0, 24) + "…",
          iv: c.iv.slice(0, 12) + "…",
          createdAt: c.createdAt,
        }));
      return send(res, 200, {
        message: "Encrypted credentials (ciphertext only — never plaintext)",
        count: mine.length,
        credentials: mine,
      });
    }

    /* ---------- Decrypt a credential ---------- */
    if (pathname === "/api/credentials/decrypt" && req.method === "POST") {
      const auth = authenticateAccess(req);
      if (!auth.user) {
        return send(res, auth.status, { error: auth.error, expired: !!auth.expired });
      }
      const body = await readBody(req);
      const id = body.id;
      const entry = credentialVault.find(
        (c) => c.id === id && c.owner === auth.user.username
      );
      if (!entry) {
        return send(res, 404, { error: "Credential not found or not owned by you" });
      }
      try {
        const plaintext = aesDecrypt(entry.ciphertext, entry.iv);
        return send(res, 200, {
          message: "Decrypted successfully with AES-256-CBC",
          id: entry.id,
          label: entry.label,
          plaintext,
          algorithm: "AES-256-CBC",
          note: "Plaintext is returned only after successful decryption. It is never stored.",
        });
      } catch (err) {
        return send(res, 500, { error: "Decryption failed", detail: err.message });
      }
    }

    /* ---------- Demo: encrypt arbitrary text (no auth needed for learning) ---------- */
    if (pathname === "/api/demo/encrypt" && req.method === "POST") {
      const body = await readBody(req);
      const text = body.text || "";
      if (!text) return send(res, 400, { error: "Field 'text' required" });
      const { ciphertext, iv } = aesEncrypt(text);
      return send(res, 200, {
        message: "AES-256-CBC encryption demo",
        algorithm: "AES-256-CBC",
        keySize: "256 bits",
        plaintextLength: text.length,
        ciphertext,
        iv,
        note: "Same key + different IV each time → different ciphertext (semantic security).",
      });
    }

    if (pathname === "/api/demo/decrypt" && req.method === "POST") {
      const body = await readBody(req);
      if (!body.ciphertext || !body.iv) {
        return send(res, 400, { error: "Fields 'ciphertext' and 'iv' required" });
      }
      try {
        const plaintext = aesDecrypt(body.ciphertext, body.iv);
        return send(res, 200, {
          message: "AES-256-CBC decryption demo",
          plaintext,
        });
      } catch (err) {
        return send(res, 400, { error: "Decryption failed — wrong key or corrupted data", detail: err.message });
      }
    }

    /* ---------- Public info ---------- */
    if (pathname === "/api/info" && req.method === "GET") {
      return send(res, 200, {
        experiment: "2.3.2",
        title: "AES Encryption & Access/Refresh Token Lifecycle",
        submittedBy: SUBMITTED_BY,
        accessTokenTTL: `${ACCESS_TTL} seconds`,
        refreshTokenTTL: `${REFRESH_TTL} seconds`,
        encryption: "AES-256-CBC",
        demoAccounts: [
          { username: "admin", password: "admin123" },
          { username: "dev", password: "dev123" },
        ],
        endpoints: {
          login: "POST /auth/login",
          refresh: "POST /auth/refresh  { refreshToken }",
          logout: "POST /auth/logout",
          me: "GET /api/me  (access token)",
          storeCredential: "POST /api/credentials  { label, secret }",
          listCredentials: "GET /api/credentials",
          decrypt: "POST /api/credentials/decrypt  { id }",
          demoEncrypt: "POST /api/demo/encrypt  { text }",
          demoDecrypt: "POST /api/demo/decrypt  { ciphertext, iv }",
        },
      });
    }

    if (req.method === "GET") return serveStatic(req, res);
    send(res, 404, { error: "Not found", path: pathname });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: "Internal server error", detail: err.message });
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log("======================================================");
  console.log("  Experiment 2.3.2 – AES Encryption + Token Lifecycle");
  console.log("  Submitted by: RENULASYA  24BAI70210");
  console.log("======================================================");
  console.log(`  Server running on  http://localhost:${PORT}`);
  console.log("");
  console.log("  Demo accounts:");
  console.log("    admin / admin123");
  console.log("    dev   / dev123");
  console.log("");
  console.log(`  Access token TTL : ${ACCESS_TTL}s (short-lived)`);
  console.log(`  Refresh token TTL: ${REFRESH_TTL}s`);
  console.log("  Encryption      : AES-256-CBC");
  console.log("======================================================");
  console.log("");
});
