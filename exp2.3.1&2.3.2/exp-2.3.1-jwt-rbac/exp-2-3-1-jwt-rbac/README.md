# Experiment 2.3.1 — JWT Authentication & Role-Based Access Control (RBAC)

**Submitted by:** RENULASYA · UID **24BAI70210**

**Aim:** Implement secure backend APIs using JWT authentication and role-based authorization.

**No MongoDB · No Express · No Postman · Pure Node.js**

---

## Quick Start (VS Code)

### Step 1 – Open the project
Extract the ZIP and open the folder `exp-2-3-1-jwt-rbac` in VS Code.

### Step 2 – Start the server
Open the integrated terminal (`Ctrl + `` `) and run:

```bash
node server.js
```

You should see:

```
======================================================
  Experiment 2.3.1 – JWT + RBAC
======================================================
  Server running on  http://localhost:4331

  Demo accounts:
    admin  / admin123   → ADMIN  (full access)
    editor / editor123  → EDITOR (edit + view)
    viewer / viewer123  → VIEWER (view only)

  Open the browser and try each role.
======================================================
```

### Step 3 – Open the browser
Go to:

```
http://localhost:4331
```

### Step 4 – Demonstrate the experiment

| Username | Password   | Role   | What you can open                          |
|----------|------------|--------|--------------------------------------------|
| admin    | admin123   | ADMIN  | Viewer + Editor + Admin pages              |
| editor   | editor123  | EDITOR | Viewer + Editor pages (Admin denied)       |
| viewer   | viewer123  | VIEWER | Viewer page only (Editor & Admin denied)   |

1. Click the role buttons (Admin / Editor / Viewer) to fill credentials.
2. Click **Issue JWT Pass**.
3. Use the left navigation to open **Viewer**, **Editor**, and **Admin** pages.
4. Observe success (green) vs access denied (red) responses.
5. Open **Token Inspector** to see Header · Payload · Signature of the JWT.

---

## API Testing with curl (VS Code terminal)

Open a **second** terminal while the server is running.

### 1. Login and get a token

```bash
curl -s -X POST http://localhost:4331/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Copy the `token` value from the response.

### 2. Call protected endpoints

Replace `YOUR_TOKEN` with the token you received.

```bash
# Current user
curl -s http://localhost:4331/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Admin page (only ADMIN)
curl -s http://localhost:4331/api/admin \
  -H "Authorization: Bearer YOUR_TOKEN"

# Editor page (ADMIN or EDITOR)
curl -s http://localhost:4331/api/editor \
  -H "Authorization: Bearer YOUR_TOKEN"

# Viewer page (any authenticated role)
curl -s http://localhost:4331/api/viewer \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test access denial

Login as viewer, then try the admin endpoint — you will receive **HTTP 403**.

```bash
# Login as viewer
curl -s -X POST http://localhost:4331/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"viewer\",\"password\":\"viewer123\"}"

# Then use that token on /api/admin → 403 Forbidden
```

### 4. Public info

```bash
curl -s http://localhost:4331/api/info
```

---

## Project Structure

```
exp-2-3-1-jwt-rbac/
├── server.js              # Complete backend (JWT + RBAC + static files)
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── VIVA.md
├── DOCUMENTATION.md
├── .vscode/
│   └── tasks.json
└── public/
    ├── index.html         # Frontend UI
    ├── styles.css
    └── app.js
```

---

## Environment Variables (optional)

Copy `.env.example` to `.env` if you want to change defaults:

```
PORT=4331
JWT_SECRET=mySecretKeyForJwtAuthenticationMustBeLongEnough123456
```

The server also works without a `.env` file (uses built-in defaults).

---

## Concepts Demonstrated

| Concept                    | How it appears in the project                          |
|----------------------------|--------------------------------------------------------|
| JWT Authentication         | Custom HS256 sign / verify using Node `crypto`         |
| Security Filter Chain      | `authenticate()` function on every protected route     |
| Role-Based Access Control  | `allow(user, ["ADMIN"])` checks before returning data  |
| Method / Endpoint Security | Different roles required for `/api/admin`, `/api/editor`, `/api/viewer` |
| Stateless Auth             | No sessions, no database — token carries the claims    |

---

## Troubleshooting

| Problem                        | Solution                                              |
|--------------------------------|-------------------------------------------------------|
| Port already in use            | Change `PORT` or kill the process using 4331          |
| “Network error” in browser     | Make sure `node server.js` is still running           |
| Token expired                  | Tokens last 1 hour — just log in again                |
| 403 on a page                  | Expected! That role is not allowed for that endpoint  |

---

## No external dependencies

This project uses **only** Node.js built-in modules (`http`, `crypto`, `fs`, `path`).  
You do **not** need `npm install`. Just run `node server.js`.
