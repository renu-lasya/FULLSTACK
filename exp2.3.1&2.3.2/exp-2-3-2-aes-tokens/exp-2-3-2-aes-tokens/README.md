# Experiment 2.3.2 — AES Encryption & Access / Refresh Token Lifecycle

**Submitted by:** RENULASYA · UID **24BAI70210**

**Aim:** Implement encryption and secure storage mechanisms for protecting sensitive data and credentials, plus access/refresh token lifecycle management.

**No MongoDB · No Express · No Postman · Pure Node.js**

---

## Quick Start (VS Code)

### Step 1 – Open the project
Extract the ZIP and open the folder `exp-2-3-2-aes-tokens` in VS Code.

### Step 2 – Start the server
```bash
node server.js
```

You should see:
```
======================================================
  Experiment 2.3.2 – AES Encryption + Token Lifecycle
  Submitted by: RENULASYA  24BAI70210
======================================================
  Server running on  http://localhost:4332
  ...
```

### Step 3 – Open the browser
```
http://localhost:4332
```

### Step 4 – Demonstrate

| Username | Password  |
|----------|-----------|
| admin    | admin123  |
| dev      | dev123    |

**Pages to show:**
1. **Dashboard** – overview of access token, refresh token, AES
2. **Token Lifecycle** – live countdown of access token (90s). Let it expire → Test /api/me → 401 → click Refresh → new token
3. **AES Encrypt Demo** – type text → Encrypt → Decrypt (shows ciphertext + IV)
4. **Credential Vault** – store a secret (encrypted), list ciphertext-only entries, decrypt by id

---

## curl examples (VS Code terminal)

```bash
# Login
curl -s -X POST http://localhost:4332/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use accessToken from response:
curl -s http://localhost:4332/api/me \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Refresh (use refreshToken from login)
curl -s -X POST http://localhost:4332/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'

# AES encrypt demo
curl -s -X POST http://localhost:4332/api/demo/encrypt \
  -H "Content-Type: application/json" \
  -d '{"text":"my-secret-api-key"}'

# Store encrypted credential (needs access token)
curl -s -X POST http://localhost:4332/api/credentials \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"GitHub OAuth Secret","secret":"gh_secret_abc123"}'
```

---

## Concepts demonstrated

| Concept                    | Implementation                                      |
|----------------------------|-----------------------------------------------------|
| AES-256-CBC encryption     | `crypto.createCipheriv` / `createDecipheriv`        |
| Secure credential storage  | Only ciphertext + IV stored; never plaintext        |
| Access token (short-lived) | JWT type=access, TTL = 90 seconds                   |
| Refresh token (long-lived) | JWT type=refresh, TTL = 1 hour                      |
| Token rotation             | On refresh, old refresh token is invalidated        |
| Token lifecycle            | Login → use → expire → refresh → logout/revoke      |

---

## Project structure

```
exp-2-3-2-aes-tokens/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── VIVA.md
├── DOCUMENTATION.md
├── .vscode/tasks.json
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

No `npm install` needed — only Node.js built-in modules.

---

## Troubleshooting

| Issue                         | Fix                                              |
|-------------------------------|--------------------------------------------------|
| Port 4332 in use              | Change PORT or kill the process                  |
| Access token expired (401)    | Click “Refresh Access Token” on Token Lifecycle  |
| Refresh fails                 | Login again (token was rotated or revoked)       |
| Network error in browser      | Ensure `node server.js` is still running         |
